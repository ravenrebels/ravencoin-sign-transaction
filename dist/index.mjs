import {rvn as $hCgyA$rvn, evr as $hCgyA$evr, toBitcoinJS as $hCgyA$toBitcoinJS} from "@hyperbitjs/chains";
import {Transaction as $hCgyA$Transaction, ECPair as $hCgyA$ECPair, script as $hCgyA$script} from "bitcoinjs-lib";



function $c3f6c693698dc7cd$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    // Get bitcoinjs-lib-compatible network parameters
    const networkMapper = {
        rvn: (0, $hCgyA$rvn).mainnet,
        "rvn-test": (0, $hCgyA$rvn).testnet,
        evr: (0, $hCgyA$evr).mainnet,
        "evr-test": (0, $hCgyA$evr).testnet
    };
    const coin = networkMapper[network];
    if (!coin) throw new Error("Invalid network specified");
    // Convert to bitcoinjs-lib network format
    // @ts-ignore because toBitcoinJS returns a compatible structure
    const COIN = (0, $hCgyA$toBitcoinJS)(coin);
    // Parse the unsigned transaction
    const unsignedTx = $hCgyA$Transaction.fromHex(rawTransactionHex);
    const tx = new $hCgyA$Transaction();
    tx.version = unsignedTx.version;
    tx.locktime = unsignedTx.locktime;
    // Helper to look up the correct private key by address
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        if (!wif) throw new Error(`Missing private key for address: ${address}`);
        if (!COIN.messagePrefix) throw new Error(`Missing messagePrefix for coin ${COIN.name}`);
        //@ts-ignore
        return $hCgyA$ECPair.fromWIF(wif, COIN);
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
        const sighash = tx.hashForSignature(i, Buffer.from(utxo.script, "hex"), $hCgyA$Transaction.SIGHASH_ALL);
        // Sign the hash
        const signature = $hCgyA$script.signature.encode(keyPair.sign(sighash), $hCgyA$Transaction.SIGHASH_ALL);
        const pubKey = keyPair.publicKey;
        // Build the unlocking script (scriptSig) manually: <signature> <pubKey>
        const scriptSig = $hCgyA$script.compile([
            signature,
            pubKey
        ]);
        // Attach the scriptSig to the input
        tx.setInputScript(i, scriptSig);
    }
    // Return the signed transaction as hex
    return tx.toHex();
}
var $c3f6c693698dc7cd$export$2e2bcd8739ae039 = {
    sign: $c3f6c693698dc7cd$export$c5552dfdbc7cec71
};


export {$c3f6c693698dc7cd$export$c5552dfdbc7cec71 as sign, $c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
