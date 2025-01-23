import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Format a date object to DD-MM-YY format.
 * @param {string|Date} date - The date to format.
 * @returns {string} - The formatted date.
 */
const formatDate = (date) => {
    if (!date) {
        return "Invalid Date"; // Handle missing date
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return "Invalid Date"; // Handle invalid date
    }
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = String(parsedDate.getFullYear()).slice(-2); // Last two digits of the year
    return `${day}-${month}-${year}`;
};

/**
 * Generate a professional invoice as a PDF.
 * @param {Object} invoice - The invoice data to generate the PDF for.
 */
export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();
    const {
        invoiceNumber,
        client,
        vendor,
        dateIssued,
        dueDate,
        items,
        total,
        type,
    } = invoice;

    // Default values and validation
    const defaultDate = new Date().toISOString();
    const validatedInvoiceNumber = invoiceNumber || "Unknown";
    const validatedType = type || "Unknown";
    const validatedItems = Array.isArray(items) && items.length > 0 ? items : [];
    const validatedDateIssued = dateIssued || defaultDate;
    const validatedDueDate = dueDate || defaultDate;
    const validatedTotal = total || validatedItems.reduce((sum, item) => sum + (item.quantity * item.price || 0), 0);

    if (!validatedInvoiceNumber || validatedItems.length === 0) {
        console.error("Missing required invoice data.");
        alert("Cannot generate invoice. Please ensure all required fields are filled.");
        return;
    }

    // Title and header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Invoice", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${validatedInvoiceNumber}`, 14, 30);
    doc.text(`Type: ${validatedType === "Outgoing" ? "Client Invoice" : "Vendor Invoice"}`, 14, 40);
    doc.text(`${validatedType === "Outgoing" ? "Client" : "Vendor"}: ${client || vendor || "N/A"}`, 14, 50);
    doc.text(`Date Issued: ${formatDate(validatedDateIssued)}`, 14, 60);
    doc.text(`Due Date: ${formatDate(validatedDueDate)}`, 14, 70);

    // Add a line separator
    doc.line(14, 75, 196, 75); // Horizontal line

    // Table for items
    const tableColumnHeaders = ["Description", "Quantity", "Price", "Total"];
    const tableRows = validatedItems.map((item) => [
        item.description || "N/A",
        item.quantity || 0,
        `$${item.price?.toFixed(2) || "0.00"}`,
        `$${(item.quantity * item.price || 0).toFixed(2)}`,
    ]);

    doc.autoTable({
        startY: 80,
        head: [tableColumnHeaders],
        body: tableRows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 123, 255] }, // Blue header
    });

    // Calculate the Y position after the table
    const finalY = doc.lastAutoTable.finalY || 80;

    // Total Amount Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: $${validatedTotal.toFixed(2)}`, 14, finalY + 20);

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for your business!", 105, finalY + 40, { align: "center" });

    // Save the PDF
    doc.save(`Invoice_${validatedInvoiceNumber}.pdf`);
};
