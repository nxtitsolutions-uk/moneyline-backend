const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

/* ---------------- StoreKit 2 JWT ---------------- */
const validateJWTToken = async (token) => {
  const decoded = jwt.decode(token);
  if (!decoded) throw new Error("Invalid StoreKit 2 JWT");

  const {
    transactionId,
    originalTransactionId,
    productId,
    purchaseDate,
    expiresDate,
    type,
    environment,
  } = decoded;

  const now = Date.now();
  const isExpired = expiresDate && Number(expiresDate) < now;

  return {
    valid: true,
    platform: "ios",
    productId,
    transactionId,
    originalTransactionId: originalTransactionId || transactionId,
    autoRenew: type === "Auto-Renewable Subscription",
    startTimeMillis: purchaseDate,
    expiryTimeMillis: expiresDate,
    isExpired,
    environment,
    latestTransaction: decoded,
  };
};

/* ---------------- Legacy Receipt ---------------- */
const validateLegacyReceipt = async (receiptData) => {
  const payload = {
    "receipt-data": receiptData,
    password: process.env.APPLE_SHARED_SECRET,
  };

  const send = async (url) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  };

  let result = await send("https://buy.itunes.apple.com/verifyReceipt");

  if (result.status === 21007) {
    result = await send("https://sandbox.itunes.apple.com/verifyReceipt");
  }

  if (result.status !== 0) {
    throw new Error(`Apple receipt validation failed: ${result.status}`);
  }

  const latest =
    result.latest_receipt_info?.[result.latest_receipt_info.length - 1];

  return {
    valid: true,
    platform: "ios",
    productId: latest.product_id,
    transactionId: latest.transaction_id,
    originalTransactionId: latest.original_transaction_id,
    autoRenew: latest.is_in_billing_retry_period === "0",
    startTimeMillis: Number(latest.purchase_date_ms),
    expiryTimeMillis: Number(latest.expires_date_ms),
    latestTransaction: latest,
  };
};

/* ---------------- Main Entry ---------------- */
const validateIOSPurchase = async (data) => {
  const receipt =
    data?.receiptData?.transactionReceipt ||
    data?.transactionReceipt;

  if (!receipt) throw new Error("Missing iOS receipt");

  const cleanReceipt = receipt.trim().replace(/^"|"$/g, "");

  // StoreKit 2 JWT
  if (cleanReceipt.startsWith("eyJ")) {
    return await validateJWTToken(cleanReceipt);
  }

  // Base64 sanity check
  if (!/^[A-Za-z0-9+/=]+$/.test(cleanReceipt)) {
    throw new Error("Invalid iOS receipt format");
  }

  return await validateLegacyReceipt(cleanReceipt);
};

module.exports = validateIOSPurchase;
