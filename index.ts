import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";

import { rvn, evr, toBitcoinJS, MainNet, TestNet } from "@hyperbitjs/chains";

const ECPair = ECPairFactory(ecc);

interface IUTXO {
  address: string;
  assetName: string;
  txid: string;
  outputIndex: number;
  script: string;
  satoshis: number;
  height?: number;
  value: number;
}

export function sign(
  network: "rvn" | "rvn-test" | "evr" | "evr-test",
  rawTransactionHex: string,
  UTXOs: Array<IUTXO>,
  privateKeys: Record<string, string>
): string {
  const networkMapper = {
    rvn: toBitcoinJS(rvn.mainnet as MainNet),
    "rvn-test": toBitcoinJS(rvn.testnet as TestNet),
    evr: toBitcoinJS(evr.mainnet as MainNet),
    "evr-test": toBitcoinJS(evr.testnet as TestNet),
  };

  const COIN = networkMapper[network];
  COIN.bech32 = COIN.bech32 || ""; //ECPair requires bech32 to not be undefined
  if (!COIN) throw new Error("Invalid network specified");

  const COIN_NETWORK = COIN as bitcoin.Network;

  const tx = bitcoin.Transaction.fromHex(rawTransactionHex);
  if (!tx) throw new Error("Invalid transaction hex");

  function getKeyPairByAddress(address: string) {
    const wif = privateKeys[address];
    if (!wif) throw new Error(`Missing private key for address: ${address}`);

    try {
      return ECPair.fromWIF(wif, COIN_NETWORK);
    } catch (e) {
      console.error("Failed to parse WIF:", e);
      throw e;
    }
  }

  function getUTXO(txid: string, vout: number): IUTXO | undefined {
    return UTXOs.find((u) => u.txid === txid && u.outputIndex === vout);
  }

  // Sign each input
  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;

    const utxo = getUTXO(txid, vout);
    if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);

    const keyPair = getKeyPairByAddress(utxo.address);
    const scriptPubKey = Buffer.from(utxo.script, "hex");

    const sighash = tx.hashForSignature(
      i,
      scriptPubKey,
      bitcoin.Transaction.SIGHASH_ALL
    );
    const rawSignature = keyPair.sign(sighash);

    const signatureWithHashType = bitcoin.script.signature.encode(
      Buffer.from(rawSignature),
      bitcoin.Transaction.SIGHASH_ALL
    );

    const pubKey = keyPair.publicKey;
    const scriptSig = bitcoin.script.compile([
      signatureWithHashType,
      Buffer.from(pubKey),
    ]);

    tx.setInputScript(i, scriptSig);
  }

  return tx.toHex();
}

export default {
  sign,
};
