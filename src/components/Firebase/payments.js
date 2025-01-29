import { loadStripe } from "@stripe/stripe-js";

const stripe = loadStripe("your-stripe-public-key");

// Generate Payment Link
export const createPaymentLink = async (invoice) => {
    const response = await fetch('/create-payment-link', { method: "POST", body: JSON.stringify(invoice) });
    const data = await response.json();
    return data.url;
};
