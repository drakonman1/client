import { v4 as uuidv4 } from 'uuid';

// Generate Unique Invoice Number with prefix based on type
export const generateInvoiceNumber = (type) => {
    const prefix = type === "Incoming" ? "IN" : "OUT";
    return `${prefix}-${uuidv4().slice(0, 8).toUpperCase()}`;
}; 