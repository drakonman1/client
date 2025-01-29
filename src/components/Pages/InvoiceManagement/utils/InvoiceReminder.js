const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const sgMail = require('@sendgrid/mail');

exports.sendInvoiceReminder = functions.pubsub.schedule('every 24 hours').onRun(async () => {
    const invoicesSnapshot = await admin.firestore().collectionGroup("invoices").where("status", "==", "Unpaid").get();

    invoicesSnapshot.forEach(doc => {
        const invoice = doc.data();
        const email = invoice.clientEmail;
        const message = {
            to: email,
            from: "your-email@example.com",
            subject: `Invoice Reminder - ${invoice.invoiceNumber}`,
            text: `Your invoice ${invoice.invoiceNumber} is due on ${invoice.dueDate}. Please make the payment.`,
        };
        sgMail.send(message);
    });

    return null;
});