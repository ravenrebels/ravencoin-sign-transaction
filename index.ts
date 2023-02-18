const bitcoin = require("bitcoinjs-lib");
import { chains } from "@hyperbitjs/chains";

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

function toBitcoinJS() {
  return Object.assign({}, this, {
    bech32: this.bech32,
    bip32: {
      public: (this.versions.bip32 || {}).public,
      private: (this.versions.bip32 || {}).private,
    },
    pubKeyHash: this.versions.public,
    scriptHash: this.versions.scripthash,
    wif: this.versions.private,
    dustThreshold: null, // TODO
  });
}

export function sign(
  network: "rvn" | "rvn-test" | "evr" | "evr-test",
  rawTransactionHex: string,
  UTXOs: Array<IUTXO>,
  privateKeys: any
): string {
  const networkMapper = {
    rvn: chains.rvn.main,
    "rvn-test": chains.rvn.test,
    evr: chains.evr.main,
    "evr-test": chains.evr.test,
  };

  const coin = networkMapper[network];

  if (!coin) {
    throw new Error(
      "Validation error, first argument network must be rvn, rvn-test, evr or evr-test"
    );
  }
  //@ts-ignore
  coin.toBitcoinJS = toBitcoinJS.bind(coin);

  console.log("Sign, network", network);
  console.log("Sign got chain", coin);

  //@ts-ignore
  const RAVENCOIN = coin.toBitcoinJS();
  console.log("Sign chain toBitcoinJS", RAVENCOIN);

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
