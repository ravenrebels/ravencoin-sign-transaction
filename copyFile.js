const fs = require("fs");
//const path = require("path");
console.log("DIR NAME", __dirname);

const currentWorkingDirectory = process.env.INIT_CWD;

//We need to find the node_modules folder
//If project A install this dependency, then our files will NOT be located in
//A/node_modules/bitcoinjs-lib/node_modules
//but in
//A/node_modules, that is in our parent directory
const destination =
  currentWorkingDirectory +
  "/node_modules/bitcoinjs-lib/src/transaction_builder.js";

  console.log("Will try to copy file to", currentWorkingDirectory);
//delete destination
fs.unlinkSync(destination);

const source = __dirname + "/bitcoinjs_transactionjs_override.js";
fs.copyFileSync(source, destination);
console.info("Copied transaction builder");
