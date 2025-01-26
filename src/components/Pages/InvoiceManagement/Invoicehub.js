import React, { useReducer, useEffect, useCallback } from "react";
import {
    fetchCollection,
    addToCollection,
    updateDocument,
    deleteDocument,
} from "../../Firebase/firestore";
import InvoiceTable from "./InvoiceTable";
import InvoiceForm from "./InvoiceForm";
import Sidebar from "../Sidebar";
import Loader from "./utils/Loader";
import "./styles/InvoiceHub.css";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const initialState = {
    invoices: [],
    filteredInvoices: [],
    analytics: { totalInvoices: 0, unpaidInvoices: 0, overdueInvoices: 0 },
    recentActivity: [], // New state for recent activity
    loading: false,
    searchTerm: "",
    showForm: false,
    formState: {
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
    },
};


const reducer = (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_INVOICES":
            return { ...state, invoices: action.payload };
        case "SET_FILTERED_INVOICES":
            return { ...state, filteredInvoices: action.payload };
        case "UPDATE_ANALYTICS":
            return { ...state, analytics: action.payload };
        case "UPDATE_FORM_STATE":
            return { ...state, formState: action.payload };
        case "TOGGLE_FORM":
            return { ...state, showForm: !state.showForm };
        case "RESET_FORM":
            return {
                ...state,
                formState: {
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
                },
            };
        case "SET_SEARCH_TERM":
            return { ...state, searchTerm: action.payload };
        default:
            return state;
    }
};

const InvoiceHub = ({ userId }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const loadInvoices = useCallback(async () => {
        if (!userId) return;
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const data = await fetchCollection(userId, "invoices");
            dispatch({ type: "SET_INVOICES", payload: data });
        } catch (error) {
            console.error("Error fetching invoices:", error.message);
            alert("Failed to fetch invoices.");
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    }, [userId]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const calculateAnalytics = useCallback((invoicesList) => {
        const totalInvoices = invoicesList.length;
        const unpaidInvoices = invoicesList.filter((inv) => inv.status === "Unpaid").length;
        const overdueInvoices = invoicesList.filter((inv) => {
            const today = new Date();
            const dueDate = new Date(inv.dueDate);
            return inv.status === "Unpaid" && dueDate < today;
        }).length;

        return { totalInvoices, unpaidInvoices, overdueInvoices };
    }, []);

    useEffect(() => {
        const filtered = state.invoices.filter(
            (invoice) =>
                invoice.client.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                invoice.invoiceNumber.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                invoice.status.toLowerCase().includes(state.searchTerm.toLowerCase())
        );
        const analytics = calculateAnalytics(filtered);

        dispatch({ type: "SET_FILTERED_INVOICES", payload: filtered });
        dispatch({ type: "UPDATE_ANALYTICS", payload: analytics });
    }, [state.invoices, state.searchTerm, calculateAnalytics]);

    const handleAddOrUpdate = async () => {
        const { invoiceNumber, client, dateIssued, dueDate, items } = state.formState.invoice;
    
        if (!invoiceNumber || !client || !dateIssued || !dueDate || items.length === 0) {
            alert("Please complete all fields.");
            return;
        }
    
        const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const newInvoice = { ...state.formState.invoice, total };
        const timestamp = new Date().toLocaleString(); // Track when the action happened
    
        try {
            if (state.formState.isEditing) {
                await updateDocument(userId, "invoices", state.formState.invoice.id, newInvoice);
                dispatch({
                    type: "SET_INVOICES",
                    payload: state.invoices.map((inv) =>
                        inv.id === state.formState.invoice.id ? newInvoice : inv
                    ),
                });
                dispatch({
                    type: "SET_RECENT_ACTIVITY",
                    payload: [
                        ...state.recentActivity,
                        {
                            type: "Updated",
                            invoiceNumber,
                            client,
                            timestamp,
                        },
                    ],
                });
                alert("Invoice updated successfully!");
            } else {
                await addToCollection(userId, "invoices", newInvoice);
                dispatch({
                    type: "SET_RECENT_ACTIVITY",
                    payload: [
                        ...state.recentActivity,
                        {
                            type: "Created",
                            invoiceNumber,
                            client,
                            timestamp,
                        },
                    ],
                });
                alert("Invoice added successfully!");
            }
            dispatch({ type: "RESET_FORM" });
            loadInvoices();
            dispatch({ type: "TOGGLE_FORM" });
        } catch (error) {
            console.error("Error saving invoice:", error.message);
            alert("Failed to save invoice.");
        }
    };

    const handleDelete = async (id) => {
        const invoiceToDelete = state.invoices.find((inv) => inv.id === id);
        const timestamp = new Date().toLocaleString(); // Track when the action happened
    
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;
        try {
            await deleteDocument(userId, "invoices", id);
            dispatch({ type: "SET_INVOICES", payload: state.invoices.filter((inv) => inv.id !== id) });
            dispatch({
                type: "SET_RECENT_ACTIVITY",
                payload: [
                    ...state.recentActivity,
                    {
                        type: "Deleted",
                        invoiceNumber: invoiceToDelete.invoiceNumber,
                        client: invoiceToDelete.client,
                        timestamp,
                    },
                ],
            });
            alert("Invoice deleted successfully!");
        } catch (error) {
            console.error("Error deleting invoice:", error.message);
            alert("Failed to delete invoice.");
        }
    };

    const toggleForm = () => {
        if (state.showForm) {
            dispatch({ type: "RESET_FORM" });
        }
        dispatch({ type: "TOGGLE_FORM" });
    };

    return (
        <div className="dashboard flex bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="main-content w-full p-8">
                <header className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Invoice Manager</h1>
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
                        onClick={toggleForm}
                    >
                        {state.showForm ? "Close Form" : "Add Invoice"}
                    </button>
                </header>
    
                {state.loading ? (
                    <Loader />
                ) : (
                    <><div className="recent-activity bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    {state.recentActivity.length > 0 ? (
                        <ul>
                            {state.recentActivity
                                .slice(-5) // Show the last 5 actions
                                .map((activity, index) => (
                                    <li key={index} className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-gray-800">
                                                <strong>{activity.type}</strong> invoice #{activity.invoiceNumber} for{" "}
                                                <strong>{activity.client}</strong>
                                            </p>
                                            <p className="text-gray-500 text-sm">{activity.timestamp}</p>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No recent activity.</p>
                    )}
                </div>
                        {/* Analytics Row */}
                        <div className="analytics-row grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                            {/* Overview (Bar Chart) */}
{/* Overview (Bar Chart) */}
<div className="analytics-card bg-white p-6 rounded shadow flex flex-col">
    <h3 className="text-xl font-semibold mb-4">Overview</h3>
    <div className="chart-container w-full">
        <ResponsiveContainer width="95%" height={300}>
            <BarChart
                data={[
                    { name: "Total Invoices", value: state.analytics.totalInvoices },
                    { name: "Unpaid Invoices", value: state.analytics.unpaidInvoices },
                    { name: "Overdue Invoices", value: state.analytics.overdueInvoices },
                ]}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
                <XAxis
                    dataKey="name"
                    tick={{ fill: "#374151", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: "#374151", fontSize: 12 }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                    itemStyle={{ color: "#374151" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#3b82f6" barSize={50} />
            </BarChart>
        </ResponsiveContainer>
    </div>
</div>
    
                            {/* Breakdown (Pie Chart) */}
                            <div className="analytics-card bg-white p-6 rounded shadow flex flex-col items-center">
                                <h3 className="text-xl font-semibold mb-4">Breakdown</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {
                                                    name: "Paid",
                                                    value:
                                                        state.analytics.totalInvoices -
                                                        state.analytics.unpaidInvoices,
                                                },
                                                { name: "Unpaid", value: state.analytics.unpaidInvoices },
                                                { name: "Overdue", value: state.analytics.overdueInvoices },
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            <Cell name="Paid" fill="#10b981" />
                                            <Cell name="Unpaid" fill="#f59e0b" />
                                            <Cell name="Overdue" fill="#ef4444" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
    
                            {/* Summary (Table) */}
                            <div className="analytics-card bg-white p-6 rounded shadow">
                                <h3 className="text-xl font-semibold mb-4">Summary</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border-b p-4 text-left">Metric</th>
                                            <th className="border-b p-4 text-right">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="p-4">Total Invoices</td>
                                            <td className="p-4 text-right">{state.analytics.totalInvoices}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Unpaid Invoices</td>
                                            <td className="p-4 text-right">{state.analytics.unpaidInvoices}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4">Overdue Invoices</td>
                                            <td className="p-4 text-right">{state.analytics.overdueInvoices}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
    
                            {/* Insights */}
                            <div className="analytics-card bg-white p-6 rounded shadow">
                                <h3 className="text-xl font-semibold mb-4">Insights</h3>
                                <p className="text-gray-600 mb-2">
                                    You currently have <strong>{state.analytics.totalInvoices}</strong> invoices.
                                </p>
                                <p className="text-gray-600 mb-2">
                                    <strong>{state.analytics.unpaidInvoices}</strong> invoices remain unpaid, which is
                                    <strong> {((state.analytics.unpaidInvoices / state.analytics.totalInvoices) * 100).toFixed(1)}%</strong>{" "}
                                    of your total.
                                </p>
                                <p className="text-gray-600">
                                    <strong>{state.analytics.overdueInvoices}</strong> invoices are overdue, requiring urgent attention.
                                </p>
                            </div>
                        </div>
    
                        {/* Table Section */}
                        <div className="table-container bg-white rounded shadow p-4">
                            <InvoiceTable
                                invoices={state.filteredInvoices}
                                onEdit={(invoice) =>
                                    dispatch({
                                        type: "UPDATE_FORM_STATE",
                                        payload: { isEditing: true, invoice: { ...invoice } },
                                    })
                                }
                                onDelete={handleDelete}
                            />
                        </div>
                    </>
                )}
    
                {state.showForm && (
                    <div className="modal fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
                            <InvoiceForm
                                formState={state.formState}
                                setFormState={(newState) =>
                                    dispatch({ type: "UPDATE_FORM_STATE", payload: newState })
                                }
                                onSave={handleAddOrUpdate}
                            />
                            <button
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                                onClick={toggleForm}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default InvoiceHub;
