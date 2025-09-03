const path = require('path');
const { google } = require('googleapis');

const validateAndroidPurchase = async (data) => {
  console.log("===========data==============", data)
  const { transactionReceipt, productId, purchaseToken } = data;

  if (!transactionReceipt || !productId || !purchaseToken) {
    throw new Error('Missing Android purchase data');
  }

  const parsedReceipt = JSON.parse(transactionReceipt);
  const packageName = parsedReceipt.packageName;

  if (!packageName) throw new Error('Invalid receipt: missing packageName');

  try {
   const credentials = require("./reviewcut-94cb80ff1f5c.json");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });


    const authClient = await auth.getClient();
    const androidpublisher = google.androidpublisher({ version: 'v3', auth: authClient });

    const response = await androidpublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId: productId,
      token: purchaseToken,
    });

    const subscription = response.data;
    console.log("===========subscription==============", subscription)
    // return

    if (subscription.autoRenewing && subscription.paymentState === 1) {
      return subscription;
    } else {
      throw new Error('Subscription is not active or not auto-renewing');
    }

  } catch (error) {
    throw new Error('Error verifying Android subscription: ' + error.message);
  }
};

module.exports = validateAndroidPurchase;
