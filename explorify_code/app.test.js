jest.setTimeout(900000);
const puppeteer = require("puppeteer");

describe("Explorify", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test("User logs in, enters playlist name, and clicks create and update playlist", async () => {
    const playlistName = "TestPlaylist";
    const accessToken = "BQBGvedKj9BniR3s-tO_c-1Qd0C4dXgMXXWA_1jo-dzYsMmGukPbhRd_p__HzGSJt71Cyu8vj_gZ1IQTTzTYHIF6Wl0zErO7TLMZMZpUBaeKOjYp3IaGA1DSMuvzW0DvQ-_7y9gs6nwwu9ENjTTzJS2K4P49DiBqnILsxe7ykU159oRFMG7rgj94lXb4mfka5apkWuMlKM9Wy4lojavPMTubBo4bru3_Rv6Ee07UJJ4a48qm7u4QodI0LIL_eK3JDXDiawLftlLOd-VsqSfQJWwnAw6w0ctRyrU3pIFpJoI&refresh_token=AQDGlZkdKAek5LBmHw1e8qv4diKuDFzc98_MMqcAbmfbQb6Jyl3j5fxis3jntpqlj4w4z-N4-LjTs1XN6GUlHdXvOipq7vrIbjndpM2fMFMXb_PMqkmcxGkY3Mp9XBCYUiA"; // Replace with the access token you obtained in step 1

    // Navigate to the application with the access token in the URL
    await page.goto(`http://localhost:8888/#access_token=${accessToken}`);
    console.log(await page.content());
    //await sleep(1000); // Wait for 1 second (1000 milliseconds)
    

    // Click on the login button
    //await page.click(".btn-primary");

    // Assuming the login process is complete and the user is redirected back to the application.
    // Wait for the #createPlaylist button to be visible
    await page.waitForSelector("#createPlaylist",{ timeout: 100000 });

    // Type the playlist name into the input field
    await page.type("#playlist-name", playlistName);

    // Click the create and update playlist button
    //await page.click("#createPlaylist", { timeout: 100000 });
    await page.evaluate(() => {
        document.querySelector("#createPlaylist").click();
      });

    // Check that the AJAX call to create the playlist was successful.
    // This can be done by checking for a specific element that appears only after successful playlist creation, e.g., a toast message or an updated playlist list.
    // Replace '#element-to-check' with the actual element you want to check for.
    //await page.waitForSelector("#element-to-check");
  });
});
