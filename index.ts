const bitcoin = require("bitcoinjs-lib");

import { rvn, evr, toBitcoinJS } from "@hyperbitjs/chains";

// UTXO model for inputs to be signed
interface IUTXO {
  address: string; // Address that holds the UTXO
  assetName: string; // Name of the asset
  txid: string; // Transaction ID of the UTXO
  outputIndex: number; // Output index in the original transaction
  script: string; // Hex-encoded scriptPubKey (from the UTXO)
  satoshis: number; // Amount in satoshis
  height?: number; // Optional block height
  value: number; // Same as satoshis (can be used for clarity)
}

/**
 * Signs a raw, unsigned transaction using provided UTXOs and private keys.
 * Supports Ravencoin and Evrmore transactions, including asset transfers.
 * Uses bitcoinjs-lib's Transaction class directly for full script control.
 *
 * @param network - The blockchain network: 'rvn', 'rvn-test', 'evr', or 'evr-test'
 * @param rawTransactionHex - The raw hex of the unsigned transaction
 * @param UTXOs - List of UTXOs referenced by the inputs in the transaction
 * @param privateKeys - Object mapping addresses to their corresponding WIF private keys
 * @returns The signed transaction in hex format
 */
export function sign(
  network: "rvn" | "rvn-test" | "evr" | "evr-test",
  rawTransactionHex: string,
  UTXOs: Array<IUTXO>,
  privateKeys: Record<string, string>
): string {
  // Get bitcoinjs-lib-compatible network parameters
  const networkMapper = {
    rvn: rvn.mainnet,
    "rvn-test": rvn.testnet,
    evr: evr.mainnet,
    "evr-test": evr.testnet,
  };

  const coin = networkMapper[network];

  if (!coin) {
    throw new Error("Invalid network specified");
  }

  // Convert to bitcoinjs-lib network format
  // @ts-ignore because toBitcoinJS returns a compatible structure
  const COIN = toBitcoinJS(coin);

  // Parse the unsigned transaction
  const unsignedTx = bitcoin.Transaction.fromHex(rawTransactionHex);
  const tx = new bitcoin.Transaction();

  tx.version = unsignedTx.version;
  tx.locktime = unsignedTx.locktime;

  // Helper to look up the correct private key by address
  function getKeyPairByAddress(address: string) {
    const wif = privateKeys[address];
    if (!wif) {
      throw new Error(`Missing private key for address: ${address}`);
    }
    if (!COIN.messagePrefix) {
      throw new Error(`Missing messagePrefix for coin ${COIN.name}`);
    }
    //@ts-ignore
    return bitcoin.ECPair.fromWIF(wif, COIN);
  }

  // Helper to find the correct UTXO for an input
  function getUTXO(txid: string, vout: number): IUTXO | undefined {
    return UTXOs.find((u) => u.txid === txid && u.outputIndex === vout);
  }

  // Add all inputs to the new transaction using the actual scriptPubKey from the UTXO
  for (let i = 0; i < unsignedTx.ins.length; i++) {
    const input = unsignedTx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;

    const utxo = getUTXO(txid, vout);
    if (!utxo) {
      throw new Error(`Missing UTXO for input ${txid}:${vout}`);
    }

    const script = Buffer.from(utxo.script, "hex");

    // Add input with the correct scriptPubKey
    tx.addInput(Buffer.from(input.hash), input.index, input.sequence, script);
  }

  // Copy all outputs from the unsigned transaction
  for (const out of unsignedTx.outs) {
    tx.addOutput(out.script, out.value);
  }

  // Sign each input manually
  for (let i = 0; i < tx.ins.length; i++) {
    const input = tx.ins[i];
    const txid = Buffer.from(input.hash).reverse().toString("hex");
    const vout = input.index;

    const utxo = getUTXO(txid, vout);
    if (!utxo) {
      throw new Error(`Missing UTXO for input ${txid}:${vout}`);
    }

    const keyPair = getKeyPairByAddress(utxo.address);

    // Compute the sighash (message to be signed)
    const sighash = tx.hashForSignature(
      i,
      Buffer.from(utxo.script, "hex"),
      bitcoin.Transaction.SIGHASH_ALL
    );

    // Sign the hash
    const signature = bitcoin.script.signature.encode(
      keyPair.sign(sighash),
      bitcoin.Transaction.SIGHASH_ALL
    );

    const pubKey = keyPair.publicKey;

    // Build the unlocking script (scriptSig) manually: <signature> <pubKey>
    const scriptSig = bitcoin.script.compile([signature, pubKey]);

    // Attach the scriptSig to the input
    tx.setInputScript(i, scriptSig);
  }

  // Return the signed transaction as hex
  return tx.toHex();
}

export default {
  sign,
};
