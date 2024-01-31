const axios = require("axios");
const { clear } = require("console");
const crypto = require("crypto");
const fs = require("fs");

const main = async () => {
  let response = "";
  let apiMethod = "";
  let inputParameters = "";

  const api_private = [
    "Balance",
    "BalanceEx",
    "TradeBalance",
    "OpenOrders",
    "ClosedOrders",
    "QueryOrders",
    "TradesHistory",
    "QueryTrades",
    "OpenPositions",
    "Ledgers",
    "QueryLedgers",
    "TradeVolume",
    "AddExport",
    "ExportStatus",
    "RetrieveExport",
    "RemoveExport",
    "GetWebSocketsToken",
    "AddOrder",
    "AddOrderBatch",
    "EditOrder",
    "CancelOrder",
    "CancelAll",
    "CancelAllOrdersAfter",
    "DepositMethods",
    "DepositAddresses",
    "DepositStatus",
    "WithdrawInfo",
    "Withdraw",
    "WithdrawStatus",
    "WithdrawCancel",
    "WalletTransfer",
    "Staking/Assets",
    "Stake",
    "Unstake",
    "Staking/Pending",
    "Staking/Transactions",
  ];
  api_public = [
    "Time",
    "Assets",
    "AssetPairs",
    "Ticker",
    "OHLC",
    "Depth",
    "Trades",
    "Spread",
    "SystemStatus",
  ];

  // destructuring the input command

  if (process.argv.length < 3) {
    apiMethod = "Time";
  } else if (process.argv.length == 3) {
    apiMethod = process.argv[2];
  } else {
    apiMethod = process.argv[2];
    for (count = 3; count < process.argv.length; count++) {
      if (count == 3) {
        inputParameters = process.argv[count];
      } else {
        inputParameters = inputParameters + "&" + process.argv[count];
      }
    }
  }

  // condition to check the private or public endpoints

  if (api_private.includes(apiMethod)) {
    response = await QueryPrivateEndpoint(apiMethod, inputParameters);

    if (apiMethod == "RetrieveExport") {
      try {
        fs.writeFileSync("Report.zip", response); // write the zip file response
        console.log("Report.zip file sucessffuly recieved");
      }
      catch (err) {
        console.log(err);
      }
    }
    else {
      console.log(response.toString());
    }
  } else if (api_public.includes(apiMethod)) {
    response = await QueryPublicEndpoint(apiMethod, inputParameters);
    console.log(JSON.stringify(response));
  } else {
    console.log("Usage: app method [parameters]");
    console.log("Example: app OHLC pair=xbtusd interval=1440");
  }
};

// Public API Endpoint

async function QueryPublicEndpoint(endPointName, inputParameters) {
  let jsonData;
  const baseDomain = "https://api.kraken.com";
  const publicPath = "/0/public/";
  const apiEndpointFullURL =
    baseDomain + publicPath + endPointName + "?" + inputParameters;

  await axios
    .get(apiEndpointFullURL)
    .then((res) => {
      jsonData = res;
    })
    .catch((err) => {
      jsonData = err;
    });
  return jsonData.data;
}

// Private API Endpoint

async function QueryPrivateEndpoint(endPointName, inputParameters) {
  const baseDomain = "https://api.kraken.com";
  const privatePath = "/0/private/";

  const apiPublicKey = fs.readFileSync("API_PUBLIC_KEY").toString().trim(); //get data from API_PUBLIC_KEY text file

  const apiPrivateKey = fs.readFileSync("API_PRIVATE_KEY").toString().trim(); //get data from API_PRIVATE_KEY text file

  const apiEndpointFullURL =
    baseDomain + privatePath + endPointName;

  const nonce = Date.now().toString();
  const apiPostBodyData = "nonce=" + nonce + "&" + inputParameters;

  const signature = CreateAuthenticationSignature(
    apiPrivateKey,
    privatePath,
    endPointName,
    nonce,
    apiPostBodyData
  );
  const httpOptions = {
    headers: { "API-Key": apiPublicKey, "API-Sign": signature }, responseType: "arraybuffer",
    
  };

  let jsonData;
  await axios
    .post(apiEndpointFullURL, apiPostBodyData, httpOptions)
    .then((res) => {
      jsonData = res;
    })
    .catch((err) => {
      jsonData = err;
    });

  return jsonData.data;
}

// Authentication algorithm

function CreateAuthenticationSignature(
  apiPrivateKey,
  apiPath,
  endPointName,
  nonce,
  apiPostBodyData
) {

  const apiPost = nonce + apiPostBodyData;
  const secret = Buffer.from(apiPrivateKey, "base64");
  const sha256 = crypto.createHash("sha256");
  const hash256 = sha256.update(apiPost).digest("binary");
  const hmac512 = crypto.createHmac("sha512", secret);
  const signatureString = hmac512
    .update(apiPath + endPointName + hash256, "binary")
    .digest("base64");
  return signatureString;
}

main();
