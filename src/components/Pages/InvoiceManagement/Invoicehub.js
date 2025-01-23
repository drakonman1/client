import React, { useState, useEffect, useCallback } from "react";
import {
    fetchCollection,
    addToCollection,
    updateDocument,
    deleteDocument,
} from "../../Firebase/firestore";
import InvoiceTable from "./InvoiceTable";
import InvoiceForm from "./InvoiceForm";
import "./styles/InvoiceHub.css";

const InvoiceHub = ({ userId }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false); // State for toggling the form visibility
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalInvoices: 0,
        unpaidInvoices: 0,
        overdueInvoices: 0,
    });

    const [formState, setFormState] = useState({
        isEditing: false,
        invoice: {
            invoiceNumber: "",
            client: "",
            dateIssued: "",
            dueDate: "",
            status: "Unpaid",
            items: [{ description: "", quantity: 1, price: 0 }],
            total: 0,
        },
    });

    // Fetch invoices for the user
    const loadInvoices = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await fetchCollection(userId, "invoices");
            setInvoices(data);
        } catch (error) {
            console.error("Error fetching invoices:", error.message);
            alert("Failed to fetch invoices.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Calculate analytics
    const calculateAnalytics = useCallback(() => {
        const totalInvoices = invoices.length;
        const unpaidInvoices = invoices.filter((inv) => inv.status === "Unpaid").length;
        const overdueInvoices = invoices.filter((inv) => {
            const today = new Date();
            const dueDate = new Date(inv.dueDate);
            return inv.status === "Unpaid" && dueDate < today;
        }).length;

        setAnalytics({ totalInvoices, unpaidInvoices, overdueInvoices });
    }, [invoices]);

    // Filter invoices based on search term
    const filterInvoices = useCallback(() => {
        if (!searchTerm) {
            setFilteredInvoices(invoices);
        } else {
            const filtered = invoices.filter(
                (invoice) =>
                    invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredInvoices(filtered);
        }
    }, [searchTerm, invoices]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    useEffect(() => {
        calculateAnalytics();
    }, [invoices, calculateAnalytics]);

    useEffect(() => {
        filterInvoices();
    }, [searchTerm, invoices, filterInvoices]);

    const handleAddOrUpdate = async () => {
        const { invoiceNumber, client, dateIssued, dueDate, items } = formState.invoice;

        if (!invoiceNumber || !client || !dateIssued || !dueDate || items.length === 0) {
            alert("Please complete all fields.");
            return;
        }

        const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const newInvoice = { ...formState.invoice, total };

        try {
            if (formState.isEditing) {
                await updateDocument(userId, "invoices", formState.invoice.id, newInvoice);
                alert("Invoice updated successfully!");
            } else {
                await addToCollection(userId, "invoices", newInvoice);
                alert("Invoice added successfully!");
            }
            resetForm();
            loadInvoices();
            setShowForm(false); // Hide the form after saving
        } catch (error) {
            console.error("Error saving invoice:", error.message);
            alert("Failed to save invoice.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await deleteDocument(userId, "invoices", id);
            setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
            alert("Invoice deleted successfully!");
        } catch (error) {
            console.error("Error deleting invoice:", error.message);
            alert("Failed to delete invoice.");
        }
    };

    const resetForm = () => {
        setFormState({
            isEditing: false,
            invoice: {
                invoiceNumber: "",
                client: "",
                dateIssued: "",
                dueDate: "",
                status: "Unpaid",
                items: [{ description: "", quantity: 1, price: 0 }],
                total: 0,
            },
        });
    };

    const handleToggleForm = () => {
        setShowForm((prev) => !prev);
        if (showForm) resetForm(); // Reset the form when hiding it
    };

    return (
        <div className="invoice-hub">
            <h2>Invoice Management</h2>
    
            {/* Tab Bar for Actions */}
            <div className="tab-bar">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search by client or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />
                {/* Add Invoice Button */}
                <button onClick={handleToggleForm} className="tab-button">
                    {showForm ? "Hide Form" : "Add Invoice"}
                </button>
            </div>
    
            {/* Analytics Section */}
            <div className="analytics">
                <p>Total Invoices: {analytics.totalInvoices}</p>
                <p>Unpaid Invoices: {analytics.unpaidInvoices}</p>
                <p>Overdue Invoices: {analytics.overdueInvoices}</p>
            </div>
    
            {/* Conditional Rendering of Invoice Form */}
            {showForm && (
                <InvoiceForm
                    formState={formState}
                    setFormState={setFormState}
                    onSave={handleAddOrUpdate}
                />
            )}
    
            {/* Invoice Table */}
            <InvoiceTable
                invoices={filteredInvoices}
                loading={loading}
                onEdit={(invoice) => {
                    setFormState({
                        isEditing: true,
                        invoice: { ...invoice },
                    });
                    setShowForm(true); // Show form when editing an invoice
                }}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default InvoiceHub;
