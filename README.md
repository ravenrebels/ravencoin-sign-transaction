# ravencoin-sign-transaction
Signs a Ravencoin transaction

The sole purpose of this project is to enable us to
"Sign RVN or asset transfer transactions in pure JavaScript"

## Important stuff learned

bitcore-lib cant sign a unsigned transaction from Ravencoin as is.
Why? Because bitcore-lib needs more information about the UTXOs. Not a big problem but important.


## What we need

We need code that can take the UNSIGNED transaction, and sign it using the private keys.
This transaction transfers one FREN/CIVILAZATION asset/token and pays fees in RVN.

[decoded UNSIGNED transaction](./mock/decodedUnsignedTransaction.json)

[decoded SIGNED transaction](./mock/decodedSignedTransaction.json)

[Private keys](./mock/privateKeys.json)
