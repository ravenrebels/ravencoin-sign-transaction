const { getRPC, methods } = require("@ravenrebels/ravencoin-rpc");
const fs = require("fs");

const full = require("./mock/full.json"); 
const unsigned = full.debug.rawUnsignedTransaction;
const signed = full.debug.signedTransaction.hex;

const rpc = getRPC("anon", "anon", "https://rvn-rpc-mainnet.ting.finance/rpc");

rpc(methods.decoderawtransaction, [unsigned]).then((data) => {
  const filename = "./mock/decodedUnsignedTransaction.json";
  const json = JSON.stringify(data, null, 4);
  fs.writeFileSync(filename, json);
  console.log(filename, "DONE");
});

rpc(methods.decoderawtransaction, [signed]).then((data) => {
  const filename = "./mock/decodedSignedTransaction.json";
  const json = JSON.stringify(data, null, 4);
  fs.writeFileSync(filename, json);
  console.log(filename, "DONE");
});
