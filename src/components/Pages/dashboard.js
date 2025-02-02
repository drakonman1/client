import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth"; // ✅ Add onAuthStateChanged
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Sidebar from "./Sidebar";
import InvoiceListModal from "./InvoiceManagement/InvoiceListModal";
import "./dashboard.css";
import {
    FaFileInvoiceDollar,
    FaUserFriends,
    FaChartBar,
    FaMoneyBillWave,
    FaClock,
    FaUsers,
    FaCheckCircle,
    FaBolt,
    FaBuilding,
    FaChartPie,
    FaCreditCard,
    FaBriefcase,
    FaClipboardList,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronUp
} from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase/firebaseconfig";


const Dashboard = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();

    // ✅ Modal State
    const [isModalOpen, setModalOpen] = useState(false);
    const [modalFilter, setModalFilter] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState({
        analytics: false,
        invoices: false,
        payroll: false,
        businessClients: false
    });
    const [userId, setUserId] = useState(null);
    const [businessId, setBusinessId] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const dashboardStats = {
        
        totalInvoices: invoices.length,
        pendingInvoices: invoices.filter(inv => inv.status === "Unpaid").length,
        paidInvoices: invoices.filter(inv => inv.status === "Paid").length,
        overdueInvoices: invoices.filter(inv => inv.status === "Overdue").length,
        totalRevenue: 10000,
        monthlyRevenue: 2500,
        newClients: 5,
        avgInvoiceAmount: 400,
        payrollPending: 12000,
        payrollCompleted: 9000,
    };

    useEffect(() => {
        const auth = getAuth();
        
        // ✅ Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                await fetchBusinessId(user.uid);  // Fetch business ID dynamically
            } else {
                setUserId(null);
                setBusinessId(null);
                setInvoices([]);
            }
        });

        return () => unsubscribe();
    }, []);
    
    const fetchBusinessId = async (userId) => {
        try {
            const businessCollection = collection(db, `users/${userId}/business`);
            const businessSnapshot = await getDocs(businessCollection);

            if (!businessSnapshot.empty) {
                const businessDoc = businessSnapshot.docs[0]; // Assuming only one business per user
                setBusinessId(businessDoc.id);
                fetchInvoices(userId, businessDoc.id); // Fetch invoices after business ID is set
            }
        } catch (error) {
            console.error("Error fetching business ID:", error);
        }
    };
    const fetchInvoices = async (userId, businessId) => {
        setLoading(true);
        try {
            const invoicesCollection = collection(db, `users/${userId}/business/${businessId}/invoices`);
            const invoicesSnapshot = await getDocs(invoicesCollection);
    
            const fetchedInvoices = invoicesSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    status: data.status || 'Unpaid' // Set default status if missing
                };
            });
    
            setInvoices(fetchedInvoices);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };


    const toggleSection = (section) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const invoiceChartData = {
        labels: ["Paid", "Pending", "Overdue"],
        datasets: [
            {
                label: "Invoices",
                data: [
                    dashboardStats.paidInvoices, 
                    dashboardStats.pendingInvoices, 
                    dashboardStats.overdueInvoices
                ],
                backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
                borderRadius: 6,
            },
        ],
    };

    const expenseChartData = {
        labels: ["Rent", "Salaries", "Utilities", "Marketing", "Software", "Miscellaneous"],
        datasets: [
            {
                label: "Expenses",
                data: [1200, 5000, 800, 1500, 1000, 700],
                backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"],
                borderWidth: 2,
            },
        ],
    };

    const openInvoiceModal = (filter) => {
        setModalFilter(filter);
        setModalOpen(true);
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="dashboard-main">
                <h2>Welcome {user ? user.displayName || "Back!" : "to Your Dashboard"}</h2>
                <p>Get a quick overview of your business performance.</p>
    
                {/* ✅ Insights & Analytics */}
                <section className="dashboard-category">
                    <div className="category-header" onClick={() => toggleSection("analytics")}>
                        <h3 className="category-title">📊 Analytics</h3>
                        {collapsedSections.analytics ? <FaChevronDown /> : <FaChevronUp />}
                    </div>
                    {!collapsedSections.analytics && (
                        <div className="dashboard-charts">
                            <div className="dashboard-graph">
                                <h3 className="graph-title">📊 Invoice Breakdown</h3>
                                <div className="graph-wrapper">
                                    <Bar data={invoiceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>
                            <div className="dashboard-graph">
                                <h3 className="graph-title">💰 Expenses Breakdown</h3>
                                <div className="graph-wrapper">
                                    <Pie data={expenseChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>
                    )}
                </section>
    
                {/* ✅ Invoice Management */}
                <section className="dashboard-category">
                    <div className="category-header" onClick={() => toggleSection("invoices")}>
                        <h3 className="category-title">💰 Invoice Management</h3>
                        {collapsedSections.invoices ? <FaChevronDown /> : <FaChevronUp />}
                    </div>
                    {!collapsedSections.invoices && (
                        <div className="dashboard-cards">
                            <div className="dashboard-card" onClick={() => openInvoiceModal("all")}>
                                <FaFileInvoiceDollar className="dashboard-icon" />
                                <h3>Total Invoices</h3>
                                <p>{dashboardStats.totalInvoices} Issued</p>
                            </div>
                            <div className="dashboard-card paid" onClick={() => openInvoiceModal("Paid")}>
                                <FaCheckCircle className="dashboard-icon" />
                                <h3>Paid</h3>
                                <p>{dashboardStats.paidInvoices} Paid</p>
                            </div>
                            <div className="dashboard-card pending" onClick={() => openInvoiceModal("Unpaid")}>
                                <FaClock className="dashboard-icon" />
                                <h3>Pending</h3>
                                <p>{dashboardStats.pendingInvoices} Awaiting Payment</p>
                            </div>
                            <div className="dashboard-card overdue" onClick={() => openInvoiceModal("Overdue")}>
                                <FaMoneyBillWave className="dashboard-icon" />
                                <h3>Overdue</h3>
                                <p>{dashboardStats.overdueInvoices} Past Due</p>
                            </div>
                        </div>
                    )}
                </section>
    
                {/* ✅ Payroll Management */}
                <section className="dashboard-category">
                    <div className="category-header" onClick={() => toggleSection("payroll")}>
                        <h3 className="category-title">💳 Payroll Management</h3>
                        {collapsedSections.payroll ? <FaChevronDown /> : <FaChevronUp />}
                    </div>
                    {!collapsedSections.payroll && (
                        <div className="dashboard-cards">
                            <div className="dashboard-card payroll" onClick={() => navigate("/payroll/pending")}>
                                <FaClock className="dashboard-icon" />
                                <h3>Pending Payroll</h3>
                                <p>${dashboardStats.payrollPending} Awaiting Processing</p>
                            </div>
                            <div className="dashboard-card payroll" onClick={() => navigate("/payroll/completed")}>
                                <FaCheckCircle className="dashboard-icon" />
                                <h3>Completed Payroll</h3>
                                <p>${dashboardStats.payrollCompleted} Processed</p>
                            </div>
                            <div className="dashboard-card schedule" onClick={() => navigate("/payroll/schedule")}>
                                <FaCalendarAlt className="dashboard-icon" />
                                <h3>Payroll Schedule</h3>
                                <p>View and Manage Upcoming Payroll Dates</p>
                            </div>
                            <div className="dashboard-card directory" onClick={() => navigate("/payroll/employees")}>
                                <FaUserFriends className="dashboard-icon" />
                                <h3>Employee Directory</h3>
                                <p>View and Manage Employee Details</p>
                            </div>
                            <div className="dashboard-card reports" onClick={() => navigate("/payroll/reports")}>
                                <FaFileInvoiceDollar className="dashboard-icon" />
                                <h3>Payroll Reports</h3>
                                <p>Export Reports for Analysis</p>
                            </div>
                        </div>
                    )}
                </section>
    
                {/* ✅ Business & Clients */}
                <section className="dashboard-category">
                    <div className="category-header" onClick={() => toggleSection("businessClients")}>
                        <h3 className="category-title">👥 Business & Clients</h3>
                        {collapsedSections.businessClients ? <FaChevronDown /> : <FaChevronUp />}
                    </div>
                    {!collapsedSections.businessClients && (
                        <div className="dashboard-cards">
                            <div className="dashboard-card" onClick={() => navigate("/clients")}>
                                <FaUsers className="dashboard-icon" />
                                <h3>New Clients</h3>
                                <p>{dashboardStats.newClients} Added This Month</p>
                            </div>
                            <div className="dashboard-card" onClick={() => navigate("/clients/all")}>
                                <FaUserFriends className="dashboard-icon" />
                                <h3>All Clients</h3>
                                <p>View and Manage All Clients</p>
                            </div>
                            <div className="dashboard-card revenue">
                                <FaChartBar className="dashboard-icon" />
                                <h3>Monthly Revenue</h3>
                                <p>${dashboardStats.monthlyRevenue}</p>
                            </div>
                            <div className="dashboard-card analytics" onClick={() => navigate("/analytics/clients")}>
                                <FaChartPie className="dashboard-icon" />
                                <h3>Client Analytics</h3>
                                <p>Track Client Trends and Insights</p>
                            </div>
                            <div className="dashboard-card" onClick={() => navigate("/business")}>
                                <FaBuilding className="dashboard-icon" />
                                <h3>Business Overview</h3>
                                <p>Manage Business Information</p>
                            </div>
                            <div className="dashboard-card notes" onClick={() => navigate("/clients/notes")}>
                                <FaBolt className="dashboard-icon" />
                                <h3>Client Notes</h3>
                                <p>Keep Track of Important Details</p>
                            </div>
                        </div>
                    )}
                </section>
    
                {/* ✅ Invoice List Modal */}
                <InvoiceListModal invoices={invoices} isOpen={isModalOpen} onClose={() => setModalOpen(false)} filter={modalFilter} />
            </main>
        </div>
    );
};    

export default Dashboard;
