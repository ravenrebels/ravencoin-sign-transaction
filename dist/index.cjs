var $g5Y9E$buffer = require("buffer");
var $g5Y9E$bitcoinjslib = require("bitcoinjs-lib");
var $g5Y9E$coininfo = require("coininfo");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "sign", () => $80bd448eb6ea085b$export$c5552dfdbc7cec71);
$parcel$export(module.exports, "default", () => $80bd448eb6ea085b$export$2e2bcd8739ae039);

var $80bd448eb6ea085b$require$Buffer = $g5Y9E$buffer.Buffer;


function $80bd448eb6ea085b$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    //Validation
    const isRVN = network === "rvn";
    const isRVNTEST = network === "rvn-test";
    if (isRVN === false && isRVNTEST === false) throw new Error("Validation error, first argument network must be rvn or rvn-test");
    const networkMapper = {
        rvn: "main",
        "rvn-test": "test"
    };
    const RAVENCOIN = $g5Y9E$coininfo.ravencoin[networkMapper[network]].toBitcoinJS();
    const tx = $g5Y9E$bitcoinjslib.Transaction.fromHex(rawTransactionHex);
    const txb = $g5Y9E$bitcoinjslib.TransactionBuilder.fromTransaction(tx, RAVENCOIN);
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        const keyPair = $g5Y9E$bitcoinjslib.ECPair.fromWIF(wif, RAVENCOIN);
        return keyPair;
    }
    function getUTXO(transactionId, index) {
        return UTXOs.find((utxo)=>{
            return utxo.txid === transactionId && utxo.outputIndex === index;
        });
    }
    for(let i = 0; i < tx.ins.length; i++){
        const input = tx.ins[i];
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
var $80bd448eb6ea085b$export$2e2bcd8739ae039 = {
    sign: $80bd448eb6ea085b$export$c5552dfdbc7cec71
};


//# sourceMappingURL=index.cjs.map
