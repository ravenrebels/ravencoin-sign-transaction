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
export function sign(network: "rvn" | "rvn-test" | "evr" | "evr-test", rawTransactionHex: string, UTXOs: Array<IUTXO>, privateKeys: Record<string, string>): string;
declare const _default: {
    sign: typeof sign;
};
export default _default;

//# sourceMappingURL=types.d.ts.map
