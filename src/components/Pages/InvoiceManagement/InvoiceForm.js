import React, { useState } from "react";
import { uploadFileToFirebaseStorage } from "../../Firebase/storage";
import "./styles/InvoiceForm.css";
import { generateInvoicePDF } from "./utils/InvoiceGenerator"; // Import the PDF generator

const InvoiceForm = ({ formState, setFormState, onSave }) => {
    const [file, setFile] = useState(null); // State for file upload

    const handleItemChange = (index, key, value) => {
        const updatedItems = [...formState.invoice.items];
        updatedItems[index][key] = value;
        setFormState((prev) => ({
            ...prev,
            invoice: { ...prev.invoice, items: updatedItems },
        }));
    };

    const addItem = () => {
        setFormState((prev) => ({
            ...prev,
            invoice: {
                ...prev.invoice,
                items: [...prev.invoice.items, { description: "", quantity: 1, price: 0 }],
            },
        }));
    };

    const removeItem = (index) => {
        const updatedItems = formState.invoice.items.filter((_, i) => i !== index);
        setFormState((prev) => ({
            ...prev,
            invoice: { ...prev.invoice, items: updatedItems },
        }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Store the file locally
    };

    const handleSave = async () => {
        let fileURL = null;
    
        // Upload the file if present
        if (file) {
            try {
                fileURL = await uploadFileToFirebaseStorage(file, `invoices/${file.name}`);
                console.log("File uploaded successfully:", fileURL);
            } catch (error) {
                console.error("Error uploading file:", error);
                alert("Failed to upload file. Please try again.");
                return;
            }
        }
    
        // Automatically set dateIssued for outgoing invoices in DD-MM-YY format
        const updatedInvoice = {
            ...formState.invoice,
            dateIssued:
                formState.invoice.type === "Outgoing" && !formState.invoice.dateIssued
                    ? formatDate(new Date())
                    : formState.invoice.dateIssued,
            fileURL, // Add the file URL to the invoice
        };
    
        setFormState((prev) => ({ ...prev, invoice: updatedInvoice }));
        onSave(); // Save the invoice
    };

    const formatDate = (date) => {
        if (!date) {
            return "Invalid Date"; // Handle missing date
        }
        const d = new Date(date);
        if (isNaN(d)) {
            return "Invalid Date"; // Handle invalid date
        }
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = String(d.getFullYear()).slice(-2); // Last two digits of the year
        return `${day}-${month}-${year}`;
    };
    
    const handleGeneratePDF = () => {
        // Automatically set dateIssued for outgoing invoices in DD-MM-YY format
        const updatedInvoice = {
            ...formState.invoice,
            dateIssued:
                formState.invoice.type === "Outgoing" && !formState.invoice.dateIssued
                    ? formatDate(new Date())
                    : formState.invoice.dateIssued,
        };
    
        generateInvoicePDF(updatedInvoice); // Generate the invoice PDF
    };

   return (
    <div className="invoice-form">
        <h3>{formState.isEditing ? "Edit Invoice" : "Add Invoice"}</h3>

        {/* Invoice Type */}
        <label htmlFor="invoiceType">Invoice Type:</label>
        <select
            id="invoiceType"
            value={formState.invoice.type || "Incoming"}
            onChange={(e) =>
                setFormState((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, type: e.target.value },
                }))
            }
        >
            <option value="Incoming">Send an Invoice to a Client (Incoming)</option>
            <option value="Outgoing">Add an Invoice You Received (Outgoing)</option>
        </select>

        {/* Conditional Fields Based on Invoice Type */}
        {formState.invoice.type === "Outgoing" ? (
            <input
                type="text"
                placeholder="Supplier Name"
                value={formState.invoice.supplierName}
                onChange={(e) =>
                    setFormState((prev) => ({
                        ...prev,
                        invoice: { ...prev.invoice, supplierName: e.target.value },
                    }))
                }
            />
        ) : (
            <input
                type="text"
                placeholder="Client Name"
                value={formState.invoice.clientName}
                onChange={(e) =>
                    setFormState((prev) => ({
                        ...prev,
                        invoice: { ...prev.invoice, clientName: e.target.value },
                    }))
                }
            />
        )}

        {/* Common Fields */}
        <input
            type="text"
            placeholder="Invoice Number"
            value={formState.invoice.invoiceNumber}
            onChange={(e) =>
                setFormState((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, invoiceNumber: e.target.value },
                }))
            }
        />

        {/* Conditionally Render Date Issued */}
        {formState.invoice.type === "Outgoing" && (
            <input
                type="date"
                placeholder="Invoice Date"
                value={formState.invoice.invoiceDate}
                onChange={(e) =>
                    setFormState((prev) => ({
                        ...prev,
                        invoice: { ...prev.invoice, invoiceDate: e.target.value },
                    }))
                }
            />
        )}

        <input
            type="date"
            placeholder="Due Date"
            value={formState.invoice.dueDate}
            onChange={(e) =>
                setFormState((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, dueDate: e.target.value },
                }))
            }
        />
        <select
            value={formState.invoice.status}
            onChange={(e) =>
                setFormState((prev) => ({
                    ...prev,
                    invoice: { ...prev.invoice, status: e.target.value },
                }))
            }
        >
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
        </select>

        {/* Items */}
        <h4>Invoice Items</h4>
        {formState.invoice.items.map((item, index) => (
            <div key={index} className="invoice-item">
                <input
                    type="text"
                    placeholder="Item Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Quantity"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10))}
                />
                <input
                    type="number"
                    placeholder="Unit Price"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
                />
                <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="remove-item-button"
                >
                    Remove Item
                </button>
            </div>
        ))}
        <button type="button" onClick={addItem} className="add-item-button">
            Add Item
        </button>

        {/* File Upload */}
        <h4>Upload Invoice File</h4>
        <input type="file" onChange={handleFileChange} className="file-upload" />

        {/* Total Display */}
        <h4>
            Total: $
            {formState.invoice.items.reduce(
                (sum, item) => sum + item.quantity * item.price,
                0
            ).toFixed(2)}
        </h4>

        {/* Action Buttons */}
        <div className="form-actions">
            <button onClick={handleSave}>{formState.isEditing ? "Update" : "Add"} Invoice</button>
            <button onClick={handleGeneratePDF} className="generate-pdf-button">
                Generate PDF
            </button>
        </div>
    </div>
);
};

export default InvoiceForm;