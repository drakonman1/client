import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import app from "./firebaseconfig"; // Ensure the correct path to your Firebase configuration

// Initialize Firestore
const db = getFirestore(app); // Reuse Firestore instance

/**
 * Fetch all documents for a specific user from a specified Firestore collection.
 * @param {string} userId - The ID of the user whose documents to fetch.
 * @param {string} collectionName - The name of the Firestore collection.
 * @returns {Promise<Array<Object>>} - An array of documents.
 */
export const fetchCollection = async (userId, collectionName) => {
    try {
        const userCollectionPath = `users/${userId}/${collectionName}`;
        const querySnapshot = await getDocs(collection(db, userCollectionPath));
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching collection '${collectionName}' for user '${userId}':`, error.message);
        throw error;
    }
};

/**
 * Add a new document for a specific user to a Firestore collection.
 * @param {string} userId - The ID of the user to add a document for.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Object} data - The data to be added to the collection.
 * @returns {Promise<string>} - The ID of the created document.
 */
export const addToCollection = async (userId, collectionName, data) => {
    try {
        const userCollectionPath = `users/${userId}/${collectionName}`;
        const docRef = await addDoc(collection(db, userCollectionPath), data);
        console.log(`Document added to '${userCollectionPath}' with ID:`, docRef.id);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding to collection '${collectionName}' for user '${userId}':`, error.message);
        throw error;
    }
};

/**
 * Update an existing document for a specific user in a Firestore collection.
 * @param {string} userId - The ID of the user whose document to update.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} id - The ID of the document to update.
 * @param {Object} data - The data to update the document with.
 * @returns {Promise<void>}
 */
export const updateDocument = async (userId, collectionName, id, data) => {
    try {
        const userDocPath = `users/${userId}/${collectionName}/${id}`;
        await updateDoc(doc(db, userDocPath), data);
        console.log(`Document '${id}' updated in '${userDocPath}'.`);
    } catch (error) {
        console.error(`Error updating document '${id}' in collection '${collectionName}' for user '${userId}':`, error.message);
        throw error;
    }
};

/**
 * Delete a document for a specific user from a Firestore collection.
 * @param {string} userId - The ID of the user whose document to delete.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {string} id - The ID of the document to delete.
 * @returns {Promise<void>}
 */
export const deleteDocument = async (userId, collectionName, id) => {
    try {
        const userDocPath = `users/${userId}/${collectionName}/${id}`;
        await deleteDoc(doc(db, userDocPath));
        console.log(`Document '${id}' deleted from '${userDocPath}'.`);
    } catch (error) {
        console.error(`Error deleting document '${id}' from collection '${collectionName}' for user '${userId}':`, error.message);
        throw error;
    }
};

export const updateInvoiceStatus = async (userId, invoiceId, paidAmount, total) => {
    const status = paidAmount >= total ? "Paid" : paidAmount > 0 ? "Partially Paid" : "Unpaid";

    await updateDocument(userId, "invoices", invoiceId, { paidAmount, status });
};