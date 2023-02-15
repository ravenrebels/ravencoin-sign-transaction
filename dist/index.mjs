import {Buffer as $hCgyA$Buffer} from "buffer";
import {Transaction as $hCgyA$Transaction, TransactionBuilder as $hCgyA$TransactionBuilder, ECPair as $hCgyA$ECPair} from "bitcoinjs-lib";
import {ravencoin as $hCgyA$ravencoin} from "coininfo";


var $c3f6c693698dc7cd$require$Buffer = $hCgyA$Buffer;


const $c3f6c693698dc7cd$var$RAVENCOIN = $hCgyA$ravencoin.main.toBitcoinJS();
function $c3f6c693698dc7cd$export$c5552dfdbc7cec71(rawTransactionHex, UTXOs, privateKeys) {
    const tx = $hCgyA$Transaction.fromHex(rawTransactionHex);
    const txb = $hCgyA$TransactionBuilder.fromTransaction(tx, $c3f6c693698dc7cd$var$RAVENCOIN);
    function getKeyPairByAddress(address) {
        const wif = privateKeys[address];
        const keyPair = $hCgyA$ECPair.fromWIF(wif, $c3f6c693698dc7cd$var$RAVENCOIN);
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


export {$c3f6c693698dc7cd$export$c5552dfdbc7cec71 as sign};
//# sourceMappingURL=index.mjs.map
