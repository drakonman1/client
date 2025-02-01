import React from "react";
import "./styles/InvoiceListModal.css";

const InvoiceListModal = ({ invoices, isOpen, onClose, filter }) => {
    if (!isOpen) return null;

    const filteredInvoices =
        filter === "all" ? invoices : invoices.filter((inv) => inv.status === filter);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>📄 {filter === "all" ? "All Invoices" : `${filter} Invoices`}</h2>
                <button className="close-button" onClick={onClose}>✖</button>

                {filteredInvoices.length > 0 ? (
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice, index) => (
                                <tr key={invoice.id}>
                                    <td>{invoice.invoiceNumber}</td>
                                    <td>{invoice.client}</td>
                                    <td>${invoice.total}</td>
                                    <td className={`status ${invoice.status.toLowerCase()}`}>{invoice.status}</td>
                                    <td>{invoice.dueDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No invoices available.</p>
                )}
            </div>
        </div>
    );
};

export default InvoiceListModal;