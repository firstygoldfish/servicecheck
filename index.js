var request = require("request");
var exec = require('child_process').exec;
const fs = require('fs');

var upstarttag = '<td style="padding: 20px;"><center><img src="laptopup.png"><br><span style="background-color: #00FF00;padding: 5px;">';
var downstarttag = '<td style="padding: 20px;"><center><img src="laptopdown.png"><br><span style="background-color: #FF0000;padding: 5px;">';
var endtag = '</span></center></td>';
let opfile = 'servicecheck.html';
let displaycols = 4;

var checks = [
  { "name": "INF TEST BIP", "type": "url", "target": "http://10.0.1.5:7001/xmlpserver", "expect": "BI Publisher Enterprise" }
  , { "name": "INF TEST OASys", "type": "url", "target": "http://10.0.1.9:8080/ords/f?p=100", "expect": "OASys is running in" }
  , { "name": "INF TEST DB", "type": "ora", "target": "sys/delta1@10.0.1.9/XE.local as sysdba", "expect": "DATABASE_IS_UP" }
  , { "name": "SYS TEST BIP", "type": "url", "target": "http://10.0.1.11:7001/xmlpserver", "expect": "BI Publisher Enterprise" }
  , { "name": "Google.com", "type": "url", "target": "https://google.com", "expect": "google" }
  , { "name": "SYS TEST OASys", "type": "url", "target": "http://10.0.1.22:8080/ords/f?p=100", "expect": "OASys is running in" }
  , { "name": "SYS TEST DB", "type": "ora", "target": "sys/delta1@10.0.1.22/centos7.dbaora.com as sysdba", "expect": "DATABASE_IS_UP" }
];

function checkURI(element) {
  console.log('checkURI: ' + element.name);
  return new Promise(function (resolve, reject) {
    request({ uri: element.target, timeout: 5000 },
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
  console.log('checkORA: ' + element.name);
  return new Promise(function (resolve, reject) {
    child = exec('echo "PROMPT DATABASE_IS_UP" | sqlplus -S -L ' + element.target, { timeout: 5000 },
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
    let response = '<table><tr>';
    fs.copyFileSync('topsc.html', opfile);
    let colcount = 0;
    for (i = 0; i < checks.length; i++) {
      colcount = colcount + 1;
      if (checks[i].type == "url") {
        let retval = await checkURI(checks[i]);
        response = response + retval + '\n';
      }
      if (checks[i].type == "ora") {
        let retval = await checkORA(checks[i]);
        response = response + retval + '\n';
      }
      if ( colcount == displaycols ) {
        response = response + '</tr>\n<tr>';
        colcount = 0;
      }
    }
    fs.appendFileSync(opfile, response + '</table>');
    fs.appendFileSync(opfile, '<h2 style="border: #000 1px solid;padding-left: 25px;width: 600px;background-color: #c9c9c9;color: #0000cd">END OF REPORT</h2></body>');
  } catch (error) {
    fs.appendFileSync(opfile, error);
    fs.appendFileSync(opfile, '<h2 style="border: #000 1px solid;padding-left: 25px;width: 600px;background-color: #c9c9c9;color: #0000cd">END OF REPORT</h2></body>');
  }
}

main();
