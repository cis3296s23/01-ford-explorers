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


    const playlistName = "wowowowo";
    const accessToken = "BQDnt9Ea2wmXJ2DuVcmYQ5TMprjLHSVLFQ8ImS9ifpLgWYYwXtzLe__m7qv-7Jst6YU6q0n-i8jHKgOarstTTWC5naL8R-EZbvLJvqEM7EXi4WA88rhHyKgDjdBPI2QjY8yrAuxC3HLB4vc0JVsfSyALSOZhlaQJ6kFo0Tl_oOAoqMO93fhvogqvIprMOg4cGEOsaVAjoRz12Zcwn3tTunKeis-JYAOQOohLlGDPZf3PUD4JCDr1JhoiuvkcI4H02KSPXreACE5v2nmvsdFRsxqltAY3R9jbHODlKWI_Yn0&refresh_token=AQAw4MYLtTzWce3Zz9iyxE2bHd6SrxhetZoEJ5F6xBow6gmSczHQ35ssOpXvCgpy7jUcaPdMxFWG-KOYlcFhI1aHy44pe7jSqCGJo-yABx_Znle4z3c384ICESsT5lbRoAo" //ned in step 1

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
    }



  }, 40000);
});
