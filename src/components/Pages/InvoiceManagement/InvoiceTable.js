import React from "react";
import "./styles/InvoiceTable.css";
import downloadInvoiceAsPDF from "./utils/DownloadInvoicePdf"; // Import your utility function

const InvoiceTable = ({ invoices, loading, onEdit, onDelete }) => {
    if (loading) {
        return <p>Loading invoices...</p>;
    }

    if (invoices.length === 0) {
        return <p>No invoices found.</p>;
    }

    return (
        <table className="invoice-table">
            <thead>
                <tr>
                    <th>Invoice Number</th>
                    <th>Client</th>
                    <th>Date Issued</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{invoice.client}</td>
                        <td>{invoice.dateIssued}</td>
                        <td>{invoice.dueDate}</td>
                        <td>{invoice.status}</td>
                        <td>${invoice.total.toFixed(2)}</td>
                        <td className="actions">
                            <button onClick={() => onEdit(invoice)}>Edit</button>
                            <button onClick={() => onDelete(invoice.id)} className="delete-button">
                                Delete
                            </button>
                            <button onClick={() => downloadInvoiceAsPDF(invoice)} className="pdf-button">
                                Export PDF
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default InvoiceTable;
