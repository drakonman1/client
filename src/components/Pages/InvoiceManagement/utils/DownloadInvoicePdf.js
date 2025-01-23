import { jsPDF } from "jspdf";

const downloadInvoiceAsPDF = (invoice) => {
    if (!invoice || !invoice.items) {
        console.error("Invalid invoice data provided.");
        return;
    }

    const doc = new jsPDF();

    // Header Section
    doc.text(`Invoice Number: ${invoice.invoiceNumber || "Unknown"}`, 10, 10);
    doc.text(`Client: ${invoice.client || "N/A"}`, 10, 20);
    doc.text(`Date Issued: ${invoice.dateIssued || "N/A"}`, 10, 30);
    doc.text(`Due Date: ${invoice.dueDate || "N/A"}`, 10, 40);
    doc.text(`Status: ${invoice.status || "N/A"}`, 10, 50);

    // Items Section
    let yPosition = 60;
    invoice.items.forEach((item, index) => {
        if (yPosition > 280) { // Handle page overflow
            doc.addPage();
            yPosition = 10;
        }
        doc.text(
            `Item ${index + 1}: ${item.description || "N/A"}, Qty: ${item.quantity || 0}, Price: $${item.price || 0}`,
            10,
            yPosition
        );
        yPosition += 10;
    });

    // Total
    if (yPosition > 280) {
        doc.addPage();
        yPosition = 10;
    }
    doc.text(`Total: $${invoice.total.toFixed(2)}`, 10, yPosition);

    // Save the PDF
    doc.save(`Invoice_${invoice.invoiceNumber || "Unknown"}.pdf`);
};

export default downloadInvoiceAsPDF;