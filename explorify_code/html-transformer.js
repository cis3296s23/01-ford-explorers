const htmlLoader = require('html-loader');

module.exports = {
  process(sourceText, sourcePath) {
    // Transform the HTML code into JavaScript using html-loader
    const transformedCode = htmlLoader(sourceText);
    
    // Return an object with the transformed JavaScript code
    return {
      code: transformedCode
    };
  }
};