const bitcoin = require("bitcoinjs-lib");
const coininfo = require("coininfo");
const RAVENCOIN = coininfo.ravencoin.main.toBitcoinJS();

const full = require("./mock/full.json").debug;
const UTXOs = full.rvnUTXOs.concat(full.assetUTXOs);

const txHex = full.rawUnsignedTransaction;
const tx = bitcoin.Transaction.fromHex(txHex);
const txb = bitcoin.TransactionBuilder.fromTransaction(tx, RAVENCOIN);
txb.UTXOs = UTXOs;

//Very ugly but it works, set UTXOs as global variable so we can use it from the forked bitcoinjs-lib
global.UTXOs = UTXOs;
for (let i = 0; i < tx.ins.length; i++) {
  const address = full.inputs[i].address;
  const keyPair = getKeyPairByAddress(address);
  console.log(tx.ins[i].script.toString());

 /*
  interface TxbSignArg {
    prevOutScriptType: string;
    vin: number;
    keyPair: Signer;
    redeemScript?: Buffer;
    hashType?: number;
    witnessValue?: number;
    witnessScript?: Buffer; 
*/
  const transactionBuilderSignArgument = {
    prevOutScriptType: "p2pkh",
    vin: i,
    keyPair,
  };
  txb.sign(transactionBuilderSignArgument);
 // txb.sign(i, keyPair);
}

const signedTxHex = txb.build().toHex();

console.log(signedTxHex);
//const signedTxHex = txb.build().toHex();
// Broadcast this signed raw transaction
//console.log(signedTxHex);

function getKeyPairByAddress(address) {
  const wif = full.privateKeys[address];
  const keyPair = bitcoin.ECPair.fromWIF(wif, RAVENCOIN);
  return keyPair;
}
