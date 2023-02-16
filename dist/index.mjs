import {Buffer as $hCgyA$Buffer} from "buffer";
import {Transaction as $hCgyA$Transaction, TransactionBuilder as $hCgyA$TransactionBuilder, ECPair as $hCgyA$ECPair} from "bitcoinjs-lib";
import {ravencoin as $hCgyA$ravencoin} from "coininfo";


var $c3f6c693698dc7cd$require$Buffer = $hCgyA$Buffer;


function $c3f6c693698dc7cd$export$c5552dfdbc7cec71(network, rawTransactionHex, UTXOs, privateKeys) {
    //Validation
    const isRVN = network === "rvn";
    const isRVNTEST = network === "rvn-test";
    if (isRVN === false && isRVNTEST === false) throw new Error("Validation error, first argument network must be rvn or rvn-test");
    const networkMapper = {
        rvn: "main",
        "rvn-test": "test"
    };
    const RAVENCOIN = $hCgyA$ravencoin[networkMapper[network]].toBitcoinJS();
    const tx = $hCgyA$Transaction.fromHex(rawTransactionHex);
    const txb = $hCgyA$TransactionBuilder.fromTransaction(tx, RAVENCOIN);
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        const keyPair = $hCgyA$ECPair.fromWIF(wif, RAVENCOIN);
        return keyPair;
    }
    function getUTXO(transactionId, index) {
        return UTXOs.find((utxo)=>{
            return utxo.txid === transactionId && utxo.outputIndex === index;
        });
    }
    for(let i = 0; i < tx.ins.length; i++){
        const input = tx.ins[i];
        const txId = $c3f6c693698dc7cd$require$Buffer.from(input.hash, "hex").reverse().toString("hex");
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
var $c3f6c693698dc7cd$export$2e2bcd8739ae039 = {
    sign: $c3f6c693698dc7cd$export$c5552dfdbc7cec71
};


export {$c3f6c693698dc7cd$export$c5552dfdbc7cec71 as sign, $c3f6c693698dc7cd$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=index.mjs.map
