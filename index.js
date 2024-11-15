var request = require("request");
var exec = require('child_process').exec;

var upstarttag = '<span style="background-color: #00FF00;padding: 10px;">';
var downstarttag = '<span style="background-color: #FF0000;padding: 10px;">';
var endtag = '</span>';

var checks = [
  { "name": "INF TEST BIP", "type": "url", "target": "http://10.0.1.5:7001/xmlpserver", "expect": "BI Publisher Enterprise" }
  , { "name": "INF TEST OASys", "type": "url", "target": "http://10.0.1.9:8080/ords/f?p=100", "expect": "OASys is running in" }
  , { "name": "INF TEST DB", "type": "ora", "target": "sys/delta1@10.0.1.9/XE.local as sysdba", "expect": "DATABASE_IS_UP" }
  , { "name": "SYS TEST BIP", "type": "url", "target": "http://10.0.1.11:7001/xmlpserver", "expect": "BI Publisher Enterprise" }
  , { "name": "SYS TEST OASys", "type": "url", "target": "http://10.0.1.22:8080/ords/f?p=100", "expect": "OASys is running in" }
  , { "name": "SYS TEST DB", "type": "ora", "target": "sys/delta1@10.0.1.22/centos7.dbaora.com as sysdba", "expect": "DATABASE_IS_UP" }
];

function itsUP(name) {
  console.log(upstarttag + name + endtag);
}

function itsDOWN(name) {
  console.log(downstarttag + name + endtag);
}

checks.forEach((element) => {
  if (element.type == "url") {
    request({ uri: element.target },
      function (error, response, body) {
        if (body.indexOf(element.expect) > 0) {
          itsUP(element.name);
        } else {
          itsDOWN(element.name);
        }
      });
  }
  if (element.type == "ora") {
    var child;
    child = exec('echo "PROMPT DATABSE_IS_UP" | sqlplus -S -L '+element.target, { timeout: 10000 }, 
      function (error, stdout, stderr) { 
        if ( stdout == 'DATABSE_IS_UP' ) { 
          itsUP(element.name);
        } else {
          itsDOWN(element.name);
        }
      });
  }
});
