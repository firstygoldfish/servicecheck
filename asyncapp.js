const request = require("request");

const checks = [ {"url":"https://google.com"}, {"url":"https://ebay.co.uk"} ]

function doRequest(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, res, body) {
      if (!error && res.statusCode === 200) {
        resolve(res.statusCode+':'+url);
      } else {
        reject(error);
      }
    });
  });
}

// Usage:
async function main() {
  try {
    let response = await doRequest('https://www.google.com');
    response = response + '\n' + await doRequest('https://www.ebay.co.uk');
    console.log(response);
    console.log('END');
  } catch (error) {
    console.error(error);
  }
}

main();