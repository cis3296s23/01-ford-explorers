module.exports = {
    preset: "jest-puppeteer",
    testRegex: "./*\\.test\\.js$",
    coverageDirectory: "./coverage/",
    collectCoverage: true,
    // collectCoverageFrom: [
    //     /public/index.html //will not work
    //   ],
  };