# ravencoin-sign-transaction
Signs a Ravencoin transaction

The sole purpose of this project is to enable us to
"Sign RVN or asset transfer transactions in pure JavaScript"

## Working proof of concept.
We have successfully signed a raw transaction using bitcoinjs-lib version 5.2 with an updated transaction_builder.js.

## Background
There are two JavaScript projects that handles bitcoin
- bitcoinjs-lib
- bitcore-lib


## What we need

We need code that can take the UNSIGNED transaction, and sign it using the private keys.
This transaction transfers one FREN/CIVILAZATION asset/token and pays fees in RVN.

[decoded UNSIGNED transaction](./mock/decodedUnsignedTransaction.json)

[decoded SIGNED transaction](./mock/decodedSignedTransaction.json)

[Private keys](./mock/privateKeys.json)



## Important stuff learned

- Signing a transaction means, sign the inputs to the transaction and sign the whole transaction.

- To sign a transaction, inputs and outputs are not enough, we need the UTXOs used (to get each utxo.script)

- bitcoinjs-lib cant sign an unsigned transaction from Ravencoin out of the box because 
of this line in transaction_builder.js

  `const prevOutScript = payments.p2pkh({ pubkey: ourPubKey }).output;`

  That is, transaction_builder assumes that the previous outputscript was "just" our pub key/address, that is not true in the case of Ravencoin asset transfer transactions.

## Stuff to look at
https://github.com/bitpay/bitcore-lib/blob/master/lib/script/script.js

