import React, { useState, useEffect, useCallback } from "react";
import { uploadFileToFirebaseStorage } from "../../Firebase/storage";
import "./styles/InvoiceForm.css";
import { generateInvoicePDF } from "./utils/InvoiceGenerator";
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { generateInvoiceNumber } from './utils/invoiceUtils';

// Enhanced Invoice Validation Schema
const invoiceSchema = Yup.object().shape({
    invoiceNumber: Yup.string().required("Invoice Number is required"),
    clientName: Yup.string().when('type', {
        is: 'Incoming',
        then: Yup.string().required("Client name is required"),
        otherwise: Yup.string()
    }),
    supplierName: Yup.string().when('type', {
        is: 'Outgoing',
        then: Yup.string().required("Supplier name is required"),
        otherwise: Yup.string()
    }),
    dateIssued: Yup.date().required("Date Issued is required"),
    dueDate: Yup.date()
        .min(Yup.ref('dateIssued'), "Due Date must be after Issue Date")
        .required("Due Date is required"),
    items: Yup.array().of(
        Yup.object().shape({
            description: Yup.string().required("Item description is required"),
            quantity: Yup.number().positive().integer().required("Quantity is required"),
            price: Yup.number().positive().required("Price is required"),
        })
    ).min(1, "At least one item is required"),
    total: Yup.number().min(0).required("Total amount is required"),
    status: Yup.string().oneOf(['Unpaid', 'Paid', 'Overdue']).required("Status is required"),
    fileURL: Yup.string().nullable(),
    notes: Yup.string(),
    taxRate: Yup.number().min(0).max(100),
    type: Yup.string().oneOf(['Incoming', 'Outgoing']).required("Invoice type is required"),
    invoiceDate: Yup.date().when('type', {
        is: 'Outgoing',
        then: Yup.date().required("Invoice date is required for outgoing invoices"),
        otherwise: Yup.date()
    })
});

const InvoiceForm = ({ formState, setFormState, onSave }) => {
    // ALL hooks must be declared first, unconditionally
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [subTotal, setSubTotal] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);

    // Initialize the form state if it's empty - use useCallback to memoize the initialization
    const initializeForm = useCallback(() => {
        if (!formState?.invoice) {
            const initialState = {
                invoice: {
                    type: 'Incoming',
                    invoiceNumber: generateInvoiceNumber('Incoming'),
                    items: [{ description: "", quantity: 1, price: 0 }],
                    status: 'Unpaid',
                    taxRate: 0,
                    dateIssued: new Date().toISOString().split('T')[0],
                    dueDate: '',
                    total: 0,
                    subTotal: 0,
                    taxAmount: 0
                },
                isEditing: false
            };
            setFormState(initialState);
        }
    }, [formState?.invoice, setFormState]);

    // Use the initialization callback in useEffect
    useEffect(() => {
        initializeForm();
    }, [initializeForm]);

    // Initialize values
    useEffect(() => {
        if (formState?.invoice) {
            setTotal(formState.invoice.total || 0);
            setSubTotal(formState.invoice.subTotal || 0);
            setTaxAmount(formState.invoice.taxAmount || 0);
        }
    }, [formState?.invoice]);

    // Calculate totals - wrap the calculation in useCallback
    const calculateTotals = useCallback(() => {
        if (!formState?.invoice?.items) return;

        const newSubTotal = formState.invoice.items.reduce(
            (sum, item) => sum + (Number(item.quantity) * Number(item.price)),
            0
        );
        setSubTotal(newSubTotal);

        const taxRate = Number(formState.invoice.taxRate) || 0;
        const newTaxAmount = (newSubTotal * taxRate) / 100;
        setTaxAmount(newTaxAmount);

        const newTotal = newSubTotal + newTaxAmount;
        setTotal(newTotal);

        setFormState(prev => ({
            ...prev,
            invoice: { 
                ...prev.invoice, 
                subTotal: newSubTotal,
                taxAmount: newTaxAmount,
                total: newTotal 
            }
        }));
    }, [formState?.invoice?.items, formState?.invoice?.taxRate, setFormState]);

    // Use the callback in useEffect
    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    // Load saved templates - wrap in useCallback
    const loadSavedTemplates = useCallback(() => {
        const templates = JSON.parse(localStorage.getItem('invoiceTemplates') || '[]');
        setSavedTemplates(templates);
    }, []);

    // Use the callback in useEffect
    useEffect(() => {
        loadSavedTemplates();
    }, [loadSavedTemplates]);

    // Update the conditional check
    if (!formState?.invoice) {
        return <div>Loading form...</div>;
    }

    const handleItemChange = (index, key, value) => {
        const updatedItems = [...formState.invoice.items];
        updatedItems[index][key] = value;
        setFormState((prev) => ({
            ...prev,
            invoice: { ...prev.invoice, items: updatedItems },
        }));
    };

    const handleFileUploadAndImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        if (['csv', 'xlsx', 'xls'].includes(fileExt)) {
            // Handle Import (CSV or Excel)
            const reader = new FileReader();
            reader.onload = (event) => {
                if (fileExt === 'csv') {
                    Papa.parse(event.target.result, {
                        complete: (results) => {
                            const items = results.data.slice(1).map(row => ({
                                description: row[0],
                                quantity: parseInt(row[1]) || 0,
                                price: parseFloat(row[2]) || 0
                            })).filter(item => item.description);
    
                            setFormState(prev => ({
                                ...prev,
                                invoice: { ...prev.invoice, items: [...prev.invoice.items, ...items] }
                            }));
                            toast.success("Items imported successfully!");
                        }
                    });
                } else {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const items = XLSX.utils.sheet_to_json(firstSheet).map(row => ({
                        description: row.Description,
                        quantity: parseInt(row.Quantity) || 0,
                        price: parseFloat(row.Price) || 0
                    }));
    
                    setFormState(prev => ({
                        ...prev,
                        invoice: { ...prev.invoice, items: [...prev.invoice.items, ...items] }
                    }));
                    toast.success("Items imported successfully!");
                }
            };
            reader.readAsText(file);
        } else {
            // Handle File Upload (PDF, JPG, PNG)
            if (file.size > 5000000) {
                toast.error("File size should not exceed 5MB");
                return;
            }
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                toast.error("Only PDF, JPEG, and PNG files are allowed");
                return;
            }
    
            setFile(file);
            toast.success("File selected successfully!");
        }
    };

    const saveAsTemplate = () => {
        const templateName = prompt("Enter a name for this template:");
        if (templateName) {
            const templates = JSON.parse(localStorage.getItem('invoiceTemplates') || '[]');
            const newTemplate = {
                name: templateName,
                data: { ...formState.invoice }
            };
            templates.push(newTemplate);
            localStorage.setItem('invoiceTemplates', JSON.stringify(templates));
            setSavedTemplates(templates);
            toast.success("Template saved successfully!");
        }
    };
    
    const loadTemplate = (template) => {
        setFormState(prev => ({
            ...prev,
            invoice: { 
                ...template.data, 
                invoiceNumber: generateInvoiceNumber(template.data.type),
                dateIssued: new Date().toISOString().split('T')[0],
                dueDate: ''
            }
        }));
        setSelectedTemplate(template);
        toast.info("Template loaded!");
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
    
    const duplicateItem = (index) => {
        const itemToDuplicate = { ...formState.invoice.items[index] };
        setFormState((prev) => ({
            ...prev,
            invoice: {
                ...prev.invoice,
                items: [...prev.invoice.items.slice(0, index + 1), itemToDuplicate, ...prev.invoice.items.slice(index + 1)],
            },
        }));
    };
    
    const removeItem = (index) => {
        if (formState.invoice.items.length > 1) {
            const updatedItems = formState.invoice.items.filter((_, i) => i !== index);
            setFormState((prev) => ({
                ...prev,
                invoice: { ...prev.invoice, items: updatedItems },
            }));
        } else {
            toast.warning("Cannot remove the last item. At least one item is required.");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.target.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.target.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.target.classList.remove('drag-over');
        const droppedFile = e.dataTransfer.files[0];
        handleFileUploadAndImport(droppedFile);
    };


    const validateForm = async () => {
        try {
            await invoiceSchema.validate(formState.invoice, { abortEarly: false });
            setErrors({});
            return true;
        } catch (validationErrors) {
            const newErrors = {};
            validationErrors.inner.forEach(error => {
                newErrors[error.path] = error.message;
            });
            setErrors(newErrors);
            return false;
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            if (!(await validateForm())) {
                toast.error("Please fix the validation errors");
                setIsLoading(false);
                return;
            }

            let fileURL = null;
            if (file) {
                try {
                    const safeFileName = `${formState.invoice.invoiceNumber}_${Date.now()}_${file.name}`.replace(/[^a-zA-Z0-9.-]/g, '_');
                    fileURL = await uploadFileToFirebaseStorage(file, `invoices/${safeFileName}`);
                    toast.success("File uploaded successfully");
                } catch (error) {
                    console.error("Error uploading file:", error);
                    toast.error("Failed to upload file. Please try again.");
                    setIsLoading(false);
                    return;
                }
            }

            const updatedInvoice = {
                ...formState.invoice,
                dateIssued: formState.invoice.type === "Outgoing" && !formState.invoice.dateIssued
                    ? formatDate(new Date())
                    : formState.invoice.dateIssued,
                fileURL,
                total,
                subTotal,
                taxAmount,
                lastModified: new Date().toISOString()
            };

            setFormState((prev) => ({ ...prev, invoice: updatedInvoice }));
            await onSave(updatedInvoice);
            toast.success("Invoice saved successfully!");
        } catch (error) {
            toast.error("Error saving invoice");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d)) return "";
        return d.toISOString().split('T')[0];
    };

    const handleGeneratePDF = async () => {
        if (!(await validateForm())) {
            toast.error("Please fix the validation errors before generating PDF");
            return;
        }

        const updatedInvoice = {
            ...formState.invoice,
            dateIssued: formState.invoice.type === "Outgoing" && !formState.invoice.dateIssued
                ? formatDate(new Date())
                : formState.invoice.dateIssued,
            total,
            subTotal,
            taxAmount
        };

        try {
            await generateInvoicePDF(updatedInvoice);
            toast.success("PDF generated successfully!");
        } catch (error) {
            toast.error("Error generating PDF");
            console.error(error);
        }
    };

    return (
        <div className="invoice-form">
            <h3>{formState.isEditing ? "Edit Invoice" : "Add Invoice"}</h3>

            {/* Invoice Type */}
            <label htmlFor="invoiceType">Invoice Type:</label>
            <select
                id="invoiceType"
                value={formState.invoice.type || "Incoming"}
                onChange={(e) => {
                    const newType = e.target.value;
                    setFormState((prev) => ({
                        ...prev,
                        invoice: {
                            ...prev.invoice,
                            type: newType,
                            invoiceNumber: generateInvoiceNumber(newType)
                        },
                    }));
                }}
            >
                <option value="Incoming">Send an Invoice to a Client (Incoming)</option>
                <option value="Outgoing">Add an Invoice You Received (Outgoing)</option>
            </select>
            {errors.type && <span className="error-message">{errors.type}</span>}

            {/* Conditional Fields Based on Invoice Type */}
            {formState.invoice.type === "Outgoing" ? (
                <div>
                    <input
                        type="text"
                        placeholder="Supplier Name"
                        value={formState.invoice.supplierName || ''}
                        onChange={(e) =>
                            setFormState((prev) => ({
                                ...prev,
                                invoice: { ...prev.invoice, supplierName: e.target.value },
                            }))
                        }
                    />
                    {errors.supplierName && <span className="error-message">{errors.supplierName}</span>}
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Client Name"
                        value={formState.invoice.clientName || ''}
                        onChange={(e) =>
                            setFormState((prev) => ({
                                ...prev,
                                invoice: { ...prev.invoice, clientName: e.target.value },
                            }))
                        }
                    />
                    {errors.clientName && <span className="error-message">{errors.clientName}</span>}
                </div>
            )}

            {/* Common Fields */}
            <input
                type="text"
                placeholder="Invoice Number"
                value={formState.invoice.invoiceNumber || ''}
                readOnly
            />
            {errors.invoiceNumber && <span className="error-message">{errors.invoiceNumber}</span>}

            {/* Conditionally Render Date Issued */}
            {formState.invoice.type === "Outgoing" && (
                <div>
                    <input
                        type="date"
                        placeholder="Invoice Date"
                        value={formState.invoice.invoiceDate || ''}
                        onChange={(e) =>
                            setFormState((prev) => ({
                                ...prev,
                                invoice: { ...prev.invoice, invoiceDate: e.target.value },
                            }))
                        }
                    />
                    {errors.invoiceDate && <span className="error-message">{errors.invoiceDate}</span>}
                </div>
            )}

            <input
                type="date"
                placeholder="Due Date"
                value={formState.invoice.dueDate || ''}
                min={formState.invoice.dateIssued}
                onChange={(e) =>
                    setFormState((prev) => ({
                        ...prev,
                        invoice: { ...prev.invoice, dueDate: e.target.value },
                    }))
                }
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}

            <select
                value={formState.invoice.status || 'Unpaid'}
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
            {errors.status && <span className="error-message">{errors.status}</span>}

            {/* Invoice Items Section */}
<h4>Invoice Items</h4>
{formState.invoice.items.map((item, index) => (
    <div key={index} className="invoice-item">
        <input
            type="text"
            placeholder="Item Description"
            value={item.description || ''}
            onChange={(e) => handleItemChange(index, "description", e.target.value)}
        />
        <input
            type="number"
            placeholder="Qty"
            min="1"
            value={item.quantity || ''}
            onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value, 10))}
        />
        <input
            type="number"
            placeholder="Unit Price"
            min="0"
            step="0.01"
            value={item.price || ''}
            onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value))}
        />
        {/* Buttons Aligned with Inputs */}
        <button type="button" onClick={() => addItem()} className="add-item-button">➕</button>
        <button type="button" onClick={() => removeItem(index)} className="remove-item-button">❌</button>
        <button type="button" onClick={() => duplicateItem(index)} className="duplicate-item-button">🔁</button>
    </div>
))}

            {/* Tax Rate Input */}
            <div>
                <label htmlFor="taxRate">Tax Rate (%):</label>
                <input
                    type="number"
                    id="taxRate"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formState.invoice.taxRate || 0}
                    onChange={(e) =>
                        setFormState((prev) => ({
                            ...prev,
                            invoice: { ...prev.invoice, taxRate: parseFloat(e.target.value) },
                        }))
                    }
                />
                {errors.taxRate && <span className="error-message">{errors.taxRate}</span>}
            </div>

            {/* File Upload */}
            <h4>Upload Invoice File</h4>
            <div
                className="file-drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    onChange={handleFileUploadAndImport} 
                    className="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                <p>Drag and drop files here or click to select</p>
            </div>
            {errors.fileURL && <span className="error-message">{errors.fileURL}</span>}

            {/* Totals Display */}
            <div className="totals-section">
                <p>Subtotal: ${subTotal.toFixed(2)}</p>
                <p>Tax Amount: ${taxAmount.toFixed(2)}</p>
                <h4>Total: ${total.toFixed(2)}</h4>
            </div>

            {/* Notes */}
            <div>
                <h4>Notes</h4>
                <textarea
                    placeholder="Add any additional notes here..."
                    value={formState.invoice.notes || ''}
                    onChange={(e) =>
                        setFormState((prev) => ({
                            ...prev,
                            invoice: { ...prev.invoice, notes: e.target.value },
                        }))
                    }
                />
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
                <button 
                    onClick={handleSave} 
                    disabled={isLoading}
                >
                    {isLoading ? "Saving..." : formState.isEditing ? "Update" : "Add"} Invoice
                </button>
                <button 
                    onClick={handleGeneratePDF} 
                    className="generate-pdf-button"
                    disabled={isLoading}
                >
                    Generate PDF
                </button>
            </div>
        </div>
    );
};

export default InvoiceForm;