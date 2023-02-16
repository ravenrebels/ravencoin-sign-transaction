const bitcoin = require("bitcoinjs-lib");
const coininfo = require("coininfo");

interface IUTXO {
  address: string;
  assetName: string;
  txid: string;
  outputIndex: number;
  script: string;
  satoshis: number;
  height: number;
  value: number;
}
export function sign(
  network: "rvn" | "rvn-test",
  rawTransactionHex: string,
  UTXOs: Array<IUTXO>,
  privateKeys: any
): string {
  //Validation
  const isRVN = network === "rvn";
  const isRVNTEST = network === "rvn-test";

  if (isRVN === false && isRVNTEST === false) {
    throw new Error(
      "Validation error, first argument network must be rvn or rvn-test"
    );
  }
  const networkMapper = {
    rvn: "main",
    "rvn-test": "test",
  };

  const RAVENCOIN = coininfo.ravencoin[networkMapper[network]].toBitcoinJS();

  const tx = bitcoin.Transaction.fromHex(rawTransactionHex);
  const txb = bitcoin.TransactionBuilder.fromTransaction(tx, RAVENCOIN);

  function getKeyPairByAddress(address) {
    const wif = privateKeys[address];
    const keyPair = bitcoin.ECPair.fromWIF(wif, RAVENCOIN);
    return keyPair;
  }

  function getUTXO(transactionId, index) {
    return UTXOs.find((utxo) => {
      return utxo.txid === transactionId && utxo.outputIndex === index;
    });
  }

  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];

    const txId = Buffer.from(input.hash, "hex").reverse().toString("hex");
    const utxo = getUTXO(txId, input.index);
    if (!utxo) {
      throw Error("Could not find UTXO for input " + input);
    }
    const address = utxo.address;
    const keyPair = getKeyPairByAddress(address);

    const signParams = {
      prevOutScriptType: "p2pkh",
      vin: i,
      keyPair,
      UTXO: utxo,
    };
    txb.sign(signParams);
  }
  const signedTxHex = txb.build().toHex();
  return signedTxHex;
}
export default {
  sign,
};
