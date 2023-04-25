
const htmlLoader = require('html-loader');
const path = require('path');

module.exports = {
    preset: "jest-puppeteer",
    testRegex: "./*\\.test\\.js$",
    coverageDirectory: "./coverage/",
    collectCoverage: true,
    collectCoverageFrom: [
      '**/public/.index.html',
      './*.js'
    ],
    transform: {
      '^.+\\.html$':  path.resolve(__dirname, 'html-transformer.js'),
      '^.+\\.js$': 'babel-jest',
    },
  };