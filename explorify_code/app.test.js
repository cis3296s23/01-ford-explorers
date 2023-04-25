const puppeteer = require("puppeteer");
const { fail } = require('jest');
const $ = require('jquery');


describe("Explorify", () => {
  let browser;
  let page;
  let client;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    client = await page.target().createCDPSession();
  }, 15000);

  afterAll(async () => {
    await page.close();
    await browser.close();
  }, 10000);

  test("User logs in, enters playlist name, and clicks create and update playlist", async () => {
    // Enable the Profiler domain and start precise coverage collection
    await client.send('Profiler.enable');
    await client.send('Profiler.startPreciseCoverage', { callCount: false, detailed: true });


    const playlistName = "wowowowo";
    const accessToken = "BQDtyOycnBaCRdrXPeZZj2uQlajtwn5HBLN_1tRlq2DOPMVcAdiUv5KtvFvmC53D6PT3DsTy-RUVlim72_Y1x20aRS36bj7V03RdGm_wyP9NpPZoK_9C6clXuciEurQ-POq1tu1mpkrLWfAaF0Gtk3K5d3y_t12R2Co7Lfgf7YW-XqU8d5L1knXLoJu09jfewYDuKnjgMNioYrJSj6z-UB-zONP3V06sSDTmdXnZF-tR6YxpRUtJRGJmSflU5gZKQ4M-Mdfiesv7pyD_Dn8pwpt4--DGyXLtxBkJmijdRfQ"; //ned in step 1

    // Navigate to the application with the access token in the URL
    await page.goto(`http://localhost:8888/#access_token=${accessToken}`);
    console.log("user login");

    // Wait for the #createPlaylist button to be visible
    await page.waitForSelector("#createPlaylist", { timeout: 100000 });
    console.log("create playlist button is visible");

    // Type the playlist name into the input field
    // await page.type("#playlist-name", playlistName, { delay: 100 }); 
    // console.log("field entered");
    await page.evaluate((playlistName) => {
      const input = document.querySelector("#playlist-name");
      input.value = playlistName;
    }, playlistName);

    // Click the create and update playlist button
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const createPlaylistButton = document.querySelector("#createPlaylist");
      createPlaylistButton.scrollIntoView();
      createPlaylistButton.click();
    });

    // await page.waitForSelector("#toast", { timeout: 100000 });

    // Check that the AJAX call to create the playlist was successful.
    // This can be done by checking for a specific element that appears only after successful playlist creation, e.g., a toast message or an updated playlist list.
    // Replace '#element-to-check' with the actual element you want to check for.
    //await page.waitForSelector("#element-to-check");

    await page.waitForTimeout(10000);

    // Retrieve the user's playlists
    // Retrieve the user's playlists
    let playlistId;
    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
      });
      if (!response.ok) {
        throw new Error('Error retrieving playlists');
      }
      const data = await response.json();
      const existingPlaylist = data.items.find(function (playlist) {
        return playlist.name === playlistName;
      });
      if (existingPlaylist) {
        playlistId = existingPlaylist.id;
      } else {
        console.log('Playlist not found');
      }
    } catch (error) {
      console.log('Error retrieving playlists:', error);
    }

    // Delete the playlist if it exists
    if (playlistId) {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200) {
        console.log(`Playlist with ID ${playlistName} deleted successfully`);
      } else if (response.status === 404) {
        throw new Error(`Playlist with ID ${playlistName} not found`);
      } else {
        throw new Error(`Failed to delete playlist with ID ${playlistName}`);
      }
      await page.waitForTimeout(10000);
      await page.goto(`http://localhost:8888/#access_token=${accessToken}`);
      await page.waitForTimeout(10000);
    }

    // Stop the coverage collection and disable the Profiler domain
    const { result } = await client.send('Profiler.takePreciseCoverage');
    await client.send('Profiler.stopPreciseCoverage');
    await client.send('Profiler.disable');

    // Process the coverage data
    const coverageSummary = result.map(({ url, functions }) => {
      const totalBytes = functions.reduce((sum, { ranges }) => {
        return sum + ranges.reduce((innerSum, range) => innerSum + range.end - range.start, 0);
      }, 0);

      const usedBytes = functions
        .filter(({ functionName }) => functionName !== '')
        .reduce((sum, { ranges }) => {
          return sum + ranges.reduce((innerSum, range) => innerSum + range.end - range.start, 0);
        }, 0);

      return {
        url,
        totalBytes,
        usedBytes,
        coverage: (usedBytes / totalBytes) * 100,
      };
    });
    console.log('Coverage summary:', coverageSummary);



    }, 40000);
  });
