var $g5Y9E$buffer = require("buffer");
var $g5Y9E$bitcoinjslib = require("bitcoinjs-lib");
var $g5Y9E$coininfo = require("coininfo");

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "sign", () => $80bd448eb6ea085b$export$c5552dfdbc7cec71);

var $80bd448eb6ea085b$require$Buffer = $g5Y9E$buffer.Buffer;


const $80bd448eb6ea085b$var$RAVENCOIN = $g5Y9E$coininfo.ravencoin.main.toBitcoinJS();
function $80bd448eb6ea085b$export$c5552dfdbc7cec71(rawTransactionHex, UTXOs, privateKeys) {
    const tx = $g5Y9E$bitcoinjslib.Transaction.fromHex(rawTransactionHex);
    const txb = $g5Y9E$bitcoinjslib.TransactionBuilder.fromTransaction(tx, $80bd448eb6ea085b$var$RAVENCOIN);
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        const keyPair = $g5Y9E$bitcoinjslib.ECPair.fromWIF(wif, $80bd448eb6ea085b$var$RAVENCOIN);
        return keyPair;
    }
    function getUTXO(transactionId, index) {
        return UTXOs.find((utxo)=>{
            return utxo.txid === transactionId && utxo.outputIndex === index;
        });
    }
    for(let i = 0; i < tx.ins.length; i++){
        const input = tx.ins[i];
        console.log(input);
        const txId = $80bd448eb6ea085b$require$Buffer.from(input.hash, "hex").reverse().toString("hex");
        const utxo = getUTXO(txId, input.index);
        if (!utxo) throw Error("Could not find UTXO for input " + input);
        const address = utxo.address;
        const keyPair = getKeyPairByAddress(address);
        const signParams = {
            prevOutScriptType: "p2pkh",
            vin: i,
            keyPair: keyPair,
            UTXO: utxo
        };
        txb.sign(signParams);
    }
    const signedTxHex = txb.build().toHex();
    return signedTxHex;
}


//# sourceMappingURL=index.cjs.map
