import crypto from "crypto";

interface PayUMoneyConfig {
  merchantId: string;
  merchantKey: string;
  salt: string;
  baseUrl: string;
}

const config: PayUMoneyConfig = {
  merchantId: process.env.PAYUMONEY_MERCHANT_ID || "",
  merchantKey: process.env.PAYUMONEY_MERCHANT_KEY || "",
  salt: process.env.PAYUMONEY_SALT || "",
  baseUrl: process.env.NODE_ENV === "production" 
    ? "https://secure.payu.in/_payment" 
    : "https://test.payu.in/_payment", // Test environment
};

export interface PayUMoneyPaymentData {
  txnid: string; // Unique transaction ID
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string; // Success URL
  furl: string; // Failure URL
  udf1?: string; // User defined field 1
  udf2?: string; // User defined field 2
  udf3?: string; // User defined field 3
  udf4?: string; // User defined field 4
  udf5?: string; // User defined field 5
}

// Generate hash for PayUMoney payment
export function generatePayUHash(data: PayUMoneyPaymentData): string {
  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = data;

  // Hash string format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
  const hashString = `${config.merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${config.salt}`;

  return crypto.createHash("sha512").update(hashString).digest("hex");
}

// Verify hash from PayUMoney response
export function verifyPayUHash(
  status: string,
  firstname: string,
  amount: string,
  txnid: string,
  productinfo: string,
  email: string,
  udf1: string = "",
  udf2: string = "",
  udf3: string = "",
  udf4: string = "",
  udf5: string = "",
  receivedHash: string
): boolean {
  // Reverse hash string format for response: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = `${config.salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${config.merchantKey}`;

  const calculatedHash = crypto.createHash("sha512").update(hashString).digest("hex");

  return calculatedHash === receivedHash;
}

// Generate payment form data
export function generatePaymentFormData(data: PayUMoneyPaymentData) {
  const hash = generatePayUHash(data);

  return {
    key: config.merchantKey,
    txnid: data.txnid,
    amount: data.amount,
    productinfo: data.productinfo,
    firstname: data.firstname,
    email: data.email,
    phone: data.phone,
    surl: data.surl,
    furl: data.furl,
    hash: hash,
    udf1: data.udf1 || "",
    udf2: data.udf2 || "",
    udf3: data.udf3 || "",
    udf4: data.udf4 || "",
    udf5: data.udf5 || "",
    service_provider: "payu_paisa",
  };
}

// Get PayUMoney payment URL
export function getPaymentUrl(): string {
  return config.baseUrl;
}

// Generate unique transaction ID
export function generateTransactionId(prefix: string = "TXN"): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}${timestamp}${random}`;
}

// Calculate platform commission (30%)
export function calculateCommission(amount: number): {
  totalAmount: number;
  platformCommission: number;
  ownerEarnings: number;
} {
  const platformCommission = amount * 0.3; // 30% commission
  const ownerEarnings = amount * 0.7; // 70% to owner

  return {
    totalAmount: amount,
    platformCommission: parseFloat(platformCommission.toFixed(2)),
    ownerEarnings: parseFloat(ownerEarnings.toFixed(2)),
  };
}
