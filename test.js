const Signer = require("./dist/index.cjs");

test("Verify RVN sign transaction", () => {
  const testData = require("./mock/test_rvn_transaction.json");
  const network = "rvn-test";
  const UTXOs = testData.debug.rvnUTXOs;
  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const signedTransaction = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(signedTransaction).toBe(expectedResult);
});
test("Verify RVN sign ASSET transaction", () => {
  const testData = require("./mock/test_asset_transaction.json");
  const network = "rvn-test";
  const UTXOs = testData.debug.rvnUTXOs.concat(testData.debug.assetUTXOs);

  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const signedTransaction = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(signedTransaction).toBe(expectedResult);
});
test("Verify EVR sign transaction", () => {
  const testData = require("./mock/test_evr_transaction.json");
  const network = "evr";
  const UTXOs = testData.debug.UTXOs;

  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const signedTransaction = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(signedTransaction).toBe(expectedResult);
});

test("Verify EVR sign ASSET transaction", () => {
  const testData = require("./mock/test_asset_transaction_evr.json");
  const network = "evr";
  const UTXOs = testData.debug.UTXOs;

  const privateKeys = testData.debug.privateKeys;
  const rawUnsignedTransaction = testData.debug.rawUnsignedTransaction;

  const expectedResult = testData.debug.signedTransaction;
  const signedTransaction = Signer.sign(network, rawUnsignedTransaction, UTXOs, privateKeys);

  expect(signedTransaction).toBe(expectedResult);
});
