import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc,
    setDoc,
    getDoc 
} from "firebase/firestore";
import app from "./firebaseconfig";

// Initialize Firestore
const db = getFirestore(app);

// Core Firestore Operations
export const firestore = {
    /**
     * Get documents from any collection path
     * @param {string} userId 
     * @param {Array<string>} pathSegments 
     * @returns {Promise<Array<Object>>}
     */
    getCollection: async (userId, ...pathSegments) => {
        try {
            const colRef = collection(db, 'users', userId, ...pathSegments);
            const snapshot = await getDocs(colRef);
            
            if (!snapshot.empty) {
                return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            } else {
                return [];
            }
        } catch (error) {
            console.error(`Error getting collection [users/${userId}/${pathSegments.join('/')}]:`, error);
            throw error;
        }
    },

    /**
     * Add document to any collection path
     * @param {string} userId 
     * @param {Object} data 
     * @param {Array<string>} pathSegments 
     * @returns {Promise<string>} New document ID
     */
    addDocument: async (userId, data, ...pathSegments) => {
        try {
            const colRef = collection(db, 'users', userId, ...pathSegments);
            const docRef = await addDoc(colRef, data);
            return docRef.id;
        } catch (error) {
            console.error(`Error adding to [users/${userId}/${pathSegments.join('/')}]:`, error);
            throw error;
        }
    },

    /**
     * Update any document
     * @param {string} userId 
     * @param {Object} updates 
     * @param {Array<string>} pathSegments 
     */
    updateDocument: async (userId, updates, ...pathSegments) => {
        try {
            const docRef = doc(db, 'users', userId, ...pathSegments);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error(`Error updating document [users/${userId}/${pathSegments.join('/')}]:`, error);
            throw error;
        }
    },

    /**
     * Delete any document
     * @param {string} userId 
     * @param {Array<string>} pathSegments 
     */
    deleteDocument: async (userId, ...pathSegments) => {
        try {
            const docRef = doc(db, 'users', userId, ...pathSegments);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`Error deleting document [users/${userId}/${pathSegments.join('/')}]:`, error);
            throw error;
        }
    }
};

/**
 * Fetch a single document from Firestore
 * @param {string} collectionName 
 * @param {string} docId 
 * @returns {Promise<Object>}
 */
export const fetchDocument = async (collectionName, docId) => {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error(`Document [${collectionName}/${docId}] not found`);
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        throw error;
    }
};

// Invoice-Specific Operations
export const invoiceService = {
    /**
     * Get all invoices for a user
     * @param {string} userId 
     * @returns {Promise<Array<Invoice>>}
     */
    getAll: async (userId) => {
        return firestore.getCollection(userId, 'invoices');
    },

    /**
     * Create new invoice with automatic timestamps
     * @param {string} userId 
     * @param {Object} invoiceData 
     * @returns {Promise<string>} New invoice ID
     */
    create: async (userId, invoiceData) => {
        const dataWithTimestamps = {
            ...invoiceData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        return firestore.addDocument(userId, dataWithTimestamps, 'invoices');
    },

    /**
     * Update existing invoice
     * @param {string} userId 
     * @param {string} invoiceId 
     * @param {Object} updates 
     */
    update: async (userId, invoiceId, updates) => {
        const updatesWithTimestamp = {
            ...updates,
            updatedAt: new Date().toISOString()
        };
        await firestore.updateDocument(userId, updatesWithTimestamp, 'invoices', invoiceId);
    },

    /**
     * Update invoice payment status
     * @param {string} userId 
     * @param {string} invoiceId 
     * @param {number} paidAmount 
     * @param {number} total 
     */
    updateStatus: async (userId, invoiceId, paidAmount, total) => {
        const status = paidAmount >= total ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";
        
        await invoiceService.update(userId, invoiceId, { 
            paidAmount,
            status 
        });
    },

    /**
     * Delete an invoice
     * @param {string} userId 
     * @param {string} invoiceId 
     */
    delete: async (userId, invoiceId) => {
        await firestore.deleteDocument(userId, 'invoices', invoiceId);
    }
};

// Maintain legacy functions for backward compatibility
export const fetchCollection = (userId, collectionName) => 
    firestore.getCollection(userId, collectionName);

export const addToCollection = (userId, collectionName, data) => 
    firestore.addDocument(userId, data, collectionName);

export const updateDocument = (userId, collectionName, id, data) => 
    firestore.updateDocument(userId, data, collectionName, id);

export const deleteDocument = (userId, collectionName, id) => 
    firestore.deleteDocument(userId, collectionName, id);
