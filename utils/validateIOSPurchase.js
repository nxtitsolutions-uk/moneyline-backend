const fetch = require('node-fetch');


const validateIOSPurchase = async (data) => {
  console.log("===========data==============", data)
  const receiptData = data.receiptData.transactionReceipt;
  console.log("===========receiptData==============", data.transactionReceipt )
  if (!receiptData) {
    throw new Error('Missing iOS receipt data');
  }

  const payload = {
    'receipt-data': receiptData,
    'password': process.env.APPLE_SHARED_SECRET, // Your app-specific shared secret from App Store Connect
    'exclude-old-transactions': true
  };

  // Use sandbox or production endpoint based on environment
  const endpoint = process.env.NODE_ENV === 'development'
    ? 'https://buy.itunes.apple.com/verifyReceipt'
    : 'https://sandbox.itunes.apple.com/verifyReceipt';
  console.log("=============endpoint================", endpoint)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.status === 0) {
      return result; // contains latest_receipt_info, receipt, etc.
      // console.log("===========result==============", result)
      // return
    } else {
      throw new Error(`Invalid iOS receipt: status ${result.status}`);
    }

  } catch (error) {
    throw new Error('Error verifying iOS receipt: ' + error.message);
  }
};

module.exports = validateIOSPurchase;   

