import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create SMTP transporter
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("SMTP configuration not found. Email sending will be disabled.");
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

const transporter = createTransporter();

// Load and process email template
function loadTemplate(templateName: string, data: Record<string, any>): string {
  const templatePath = path.join(process.cwd(), "emailtemplates", `${templateName}.html`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found: ${templateName}`);
  }

  let template = fs.readFileSync(templatePath, "utf-8");

  // Replace placeholders with actual data
  Object.keys(data).forEach((key) => {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    template = template.replace(placeholder, data[key] || "");
  });

  return template;
}

// Send email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!transporter) {
    console.log(`[Email] Would send email to ${options.to}: ${options.subject}`);
    console.log(`[Email] Template: ${options.template}`, options.data);
    return false;
  }

  try {
    const html = loadTemplate(options.template, options.data);
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transporter.sendMail({
      from: `"DriveEase" <${from}>`,
      to: options.to,
      subject: options.subject,
      html,
    });

    console.log(`[Email] Successfully sent email to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send email to ${options.to}:`, error);
    return false;
  }
}

// Email templates for different scenarios
export const emailTemplates = {
  welcome: async (email: string, firstName: string) => {
    return sendEmail({
      to: email,
      subject: "Welcome to DriveEase - Your Journey Begins Here!",
      template: "welcome",
      data: { firstName },
    });
  },

  bookingConfirmationCustomer: async (
    email: string,
    firstName: string,
    vehicleName: string,
    pickupDate: string,
    returnDate: string,
    totalAmount: string
  ) => {
    return sendEmail({
      to: email,
      subject: "Booking Confirmed - Your Vehicle is Reserved!",
      template: "booking-confirmation-customer",
      data: {
        firstName,
        vehicleName,
        pickupDate,
        returnDate,
        totalAmount,
      },
    });
  },

  bookingNotificationOwner: async (
    email: string,
    ownerName: string,
    customerName: string,
    vehicleName: string,
    pickupDate: string,
    returnDate: string,
    earnings: string
  ) => {
    return sendEmail({
      to: email,
      subject: "New Booking - Your Vehicle Has Been Rented!",
      template: "booking-notification-owner",
      data: {
        ownerName,
        customerName,
        vehicleName,
        pickupDate,
        returnDate,
        earnings,
      },
    });
  },

  bookingCancelled: async (
    email: string,
    firstName: string,
    vehicleName: string,
    refundAmount: string
  ) => {
    return sendEmail({
      to: email,
      subject: "Booking Cancelled - Refund Initiated",
      template: "booking-cancelled",
      data: {
        firstName,
        vehicleName,
        refundAmount,
      },
    });
  },

  paymentSuccess: async (
    email: string,
    firstName: string,
    vehicleName: string,
    amount: string,
    transactionId: string
  ) => {
    return sendEmail({
      to: email,
      subject: "Payment Successful - Thank You!",
      template: "payment-success",
      data: {
        firstName,
        vehicleName,
        amount,
        transactionId,
      },
    });
  },
};
