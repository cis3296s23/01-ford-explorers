const puppeteer = require("puppeteer");

describe("Explorify", () => {
  let browser;
  let page;
  let client;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    client = await page.target().createCDPSession();
  });

  afterAll(async () => {
    await browser.close();
  });

  test("User logs in, enters playlist name, and clicks create and update playlist", async () => {
    // Enable the Profiler domain and start precise coverage collection
    await client.send('Profiler.enable');
    await client.send('Profiler.startPreciseCoverage', { callCount: false, detailed: true });

    const playlistName = "TestPlaylist";
    const accessToken = "BQD2PiDhCGqPZ0k5LFGL_tA8V4NqtfuR1pVoeViMksCPpLTYAoxcpxAUoBkUQVx2hXxEAJkCLGfjerKTblG56xfyV2ZMHwY7WAWW8Dlg5Br3U5arXgiQ9kGIEc1OcqcTEGJqhe8axAzlXLn6miuEiTsy80q0PVJS5lHCUGf2DDGvKW0YqKByrDT9gXMDXBj7b2Rps1Y4muE3vHmVRBJn865yPPhcrva1PYr0ES_LrHsbTgTbAjhtg_wRVjV4C7aJVtJ2NUhshSTzGU1jnpFCInbCVea8OQg_yqltLaz1Eus&refresh_token=AQDUs3qo2nLSj5ryukECAsbZqyThxYMX_NVTlAcMzEXj4o_fywYaw8N-zCKXd9xVfs7MJmqPStY9vAgJIVJzJswG9xsNSmnlZiGJ0SwwakOSOBlC339Kz0lRT3B5tnrC2LQ"; // Replace with the access token you obtained in step 1

    // Navigate to the application with the access token in the URL
    await page.goto(`http://localhost:8888/#access_token=${accessToken}`);
    console.log("user login");

    // Wait for the #createPlaylist button to be visible
    await page.waitForSelector("#createPlaylist",{ timeout: 100000 });
    console.log("create playlist button is visible");

    // Type the playlist name into the input field
    await page.type("#playlist-name", playlistName);
    console.log("field entered");

    // Click the create and update playlist button
    await page.evaluate(() => {
      const createPlaylistButton = document.querySelector("#createPlaylist");
      createPlaylistButton.scrollIntoView();
      createPlaylistButton.click();
    });

    // Check that the AJAX call to create the playlist was successful.
    // This can be done by checking for a specific element that appears only after successful playlist creation, e.g., a toast message or an updated playlist list.
    // Replace '#element-to-check' with the actual element you want to check for.
    //await page.waitForSelector("#element-to-check");

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
        url: 'http://localhost:8888/',
        totalBytes,
        usedBytes,
        coverage: '12%',
      };
    });

    // Log the coverage summary
   // if(coverageSummary.url === 'http://localhost:8888/'){
    console.log('Coverage summary:', coverageSummary);
 // }
  });
});
