var $g5Y9E$bitcoinjslib = require("bitcoinjs-lib");
var $g5Y9E$hyperbitjschains = require("@hyperbitjs/chains");


function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "sign", () => $80bd448eb6ea085b$export$c5552dfdbc7cec71);
$parcel$export(module.exports, "default", () => $80bd448eb6ea085b$export$2e2bcd8739ae039);


function $80bd448eb6ea085b$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    // Get bitcoinjs-lib-compatible network parameters
    const networkMapper = {
        rvn: (0, $g5Y9E$hyperbitjschains.chains).rvn.main,
        "rvn-test": (0, $g5Y9E$hyperbitjschains.chains).rvn.test,
        evr: (0, $g5Y9E$hyperbitjschains.chains).evr.main,
        "evr-test": (0, $g5Y9E$hyperbitjschains.chains).evr.test
    };
    const coin = networkMapper[network];
    if (!coin) throw new Error("Invalid network specified");
    // Convert to bitcoinjs-lib network format
    // @ts-ignore because toBitcoinJS returns a compatible structure
    const RAVENCOIN = (0, $g5Y9E$hyperbitjschains.toBitcoinJS)(coin);
    // Parse the unsigned transaction
    const unsignedTx = $g5Y9E$bitcoinjslib.Transaction.fromHex(rawTransactionHex);
    const tx = new $g5Y9E$bitcoinjslib.Transaction();
    tx.version = unsignedTx.version;
    tx.locktime = unsignedTx.locktime;
    // Helper to look up the correct private key by address
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        if (!wif) throw new Error(`Missing private key for address: ${address}`);
        return $g5Y9E$bitcoinjslib.ECPair.fromWIF(wif, RAVENCOIN);
    }
    // Helper to find the correct UTXO for an input
    function getUTXO(txid, vout) {
        return UTXOs.find((u)=>u.txid === txid && u.outputIndex === vout);
    }
    // Add all inputs to the new transaction using the actual scriptPubKey from the UTXO
    for(let i = 0; i < unsignedTx.ins.length; i++){
        const input = unsignedTx.ins[i];
        const txid = Buffer.from(input.hash).reverse().toString("hex");
        const vout = input.index;
        const utxo = getUTXO(txid, vout);
        if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);
        const script = Buffer.from(utxo.script, "hex");
        // Add input with the correct scriptPubKey
        tx.addInput(Buffer.from(input.hash), input.index, input.sequence, script);
    }
    // Copy all outputs from the unsigned transaction
    for (const out of unsignedTx.outs)tx.addOutput(out.script, out.value);
    // Sign each input manually
    for(let i = 0; i < tx.ins.length; i++){
        const input = tx.ins[i];
        const txid = Buffer.from(input.hash).reverse().toString("hex");
        const vout = input.index;
        const utxo = getUTXO(txid, vout);
        if (!utxo) throw new Error(`Missing UTXO for input ${txid}:${vout}`);
        const keyPair = getKeyPairByAddress(utxo.address);
        // Compute the sighash (message to be signed)
        const sighash = tx.hashForSignature(i, Buffer.from(utxo.script, "hex"), $g5Y9E$bitcoinjslib.Transaction.SIGHASH_ALL);
        // Sign the hash
        const signature = $g5Y9E$bitcoinjslib.script.signature.encode(keyPair.sign(sighash), $g5Y9E$bitcoinjslib.Transaction.SIGHASH_ALL);
        const pubKey = keyPair.publicKey;
        // Build the unlocking script (scriptSig) manually: <signature> <pubKey>
        const scriptSig = $g5Y9E$bitcoinjslib.script.compile([
            signature,
            pubKey
        ]);
        // Attach the scriptSig to the input
        tx.setInputScript(i, scriptSig);
    }
    // Return the signed transaction as hex
    return tx.toHex();
}
var $80bd448eb6ea085b$export$2e2bcd8739ae039 = {
    sign: $80bd448eb6ea085b$export$c5552dfdbc7cec71
};


//# sourceMappingURL=index.cjs.map
