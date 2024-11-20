var request = require("request");
var exec = require('child_process').exec;
const fs = require('fs');

var upstarttag = '<span style="background-color: #00FF00;padding: 10px;">';
var downstarttag = '<span style="background-color: #FF0000;padding: 10px;">';
var endtag = '</span>';
let opfile = 'servicecheck.html';

var checks = [
  { "name": "INF TEST BIP", "type": "url", "target": "http://10.0.1.5:7001/xmlpserver", "expect": "BI Publisher Enterprise" }
  , { "name": "INF TEST OASys", "type": "url", "target": "http://10.0.1.9:8080/ords/f?p=100", "expect": "OASys is running in" }
  , { "name": "INF TEST DB", "type": "ora", "target": "sys/delta1@10.0.1.9/XE.local as sysdba", "expect": "DATABASE_IS_UP" }
  , { "name": "SYS TEST BIP", "type": "url", "target": "http://10.0.1.11:7001/xmlpserver", "expect": "BI Publisher Enterprise" }
  , { "name": "SYS TEST OASys", "type": "url", "target": "http://10.0.1.22:8080/ords/f?p=100", "expect": "OASys is running in" }
  , { "name": "SYS TEST DB", "type": "ora", "target": "sys/delta1@10.0.1.22/centos7.dbaora.com as sysdba", "expect": "DATABASE_IS_UP" }
];

function checkURI(element) {
  return new Promise(function (resolve, reject) {
    request({ uri: element.target },
      function (error, response, body) {
        if (body != undefined && body.indexOf(element.expect) > 0) {
          resolve(upstarttag + element.name + endtag);
        } else {
          resolve(downstarttag + element.name + endtag);
        }
      });
  });
}

function checkORA(element) {
  return new Promise(function (resolve, reject) {
    child = exec('echo "PROMPT DATABASE_IS_UP" | sqlplus -S -L ' + element.target, { timeout: 10000 },
      function (error, stdout, stderr) {
        if (stdout.substring(0,14) == 'DATABASE_IS_UP') {
          resolve(upstarttag + element.name + endtag);
        } else {
          resolve(downstarttag + element.name + endtag);
        }
      }
    );
  });
}

async function main() {
  try {
    let response = '';
    fs.copyFileSync('topsc.html', opfile);
    for (i = 0; i < checks.length; i++) {
      if (checks[i].type == "url") {
        let retval = await checkURI(checks[i]);
        response = response + retval + '\n';
      }
      if (checks[i].type == "ora") {
        let retval = await checkORA(checks[i]);
        response = response + retval + '\n';
      }
    }
    fs.appendFileSync(opfile, response);
    fs.appendFileSync(opfile, '<h2>END OF REPORT</h2>');
  } catch (error) {
    fs.appendFileSync(opfile, error);
    fs.appendFileSync(opfile, '<h2>END OF REPORT</h2></body>');
  }
}

main();