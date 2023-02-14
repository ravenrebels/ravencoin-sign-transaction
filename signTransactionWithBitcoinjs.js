const bitcoin = require("bitcoinjs-lib");
const coininfo = require("coininfo");
const RAVENCOIN = coininfo.ravencoin.main.toBitcoinJS();

const full = require("./mock/full.json").debug; 
const txHex = full.rawUnsignedTransaction; 
const tx = bitcoin.Transaction.fromHex(txHex);
const txb = bitcoin.TransactionBuilder.fromTransaction(tx, RAVENCOIN);

// This assumes all inputs are spending utxos sent to the same Dogecoin P2PKH address (starts with D)
for (let i = 0; i < tx.ins.length; i++) {
  const address = full.inputs[i].address;
  const keyPair = getKeyPairByAddress(address);
  console.log(tx.ins[i].script.toString());
  txb.sign(i, keyPair);
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
