import React, { useState, useEffect } from "react";
import { fetchCollection, addToCollection, updateDocument, deleteDocument } from "../../Firebase/firestore";
import { useAuth } from "../../AutherisationFunctions/Contexts/AuthContext";
import Sidebar from "../Sidebar"; 
import "./ClientManagement.css";

const ClientManagement = () => {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState(null);

  // ✅ Ensure client ID is correctly stored
  const initialClientState = {
    id: "", 
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    notes: "",
  };

  const [clientForm, setClientForm] = useState(initialClientState);

// ✅ Load clients from Firestore (Ensures correct collection structure)
useEffect(() => {
  if (!currentUser) return;

  const loadClients = async () => {
    try {
      const data = await fetchCollection(currentUser.uid, "clients");

      // ✅ Ensure each client has an 'id' field by using the Firestore document ID
      const clientsWithId = data.map(client => ({
        ...client,
        id: client.id || client.firestoreId || "",  // Ensure the ID exists
      }));

      setClients(clientsWithId);
      console.log("🔥 Clients Loaded from Firestore:", clientsWithId);
    } catch (error) {
      console.error("❌ Error loading clients:", error);
    }
  };

  loadClients();
}, [currentUser]);

  // ✅ Handle input changes
  const handleInputChange = (e) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  // ✅ Open modal for editing or adding
  const openModal = (client = null) => {
    if (client) {
      setEditingClientId(client.id); 
      setClientForm(client);
    } else {
      setEditingClientId(null);
      setClientForm(initialClientState);
    }
    setIsModalOpen(true);
  };

  // ✅ Close modal & reset form
  const closeModal = () => {
    setEditingClientId(null);
    setClientForm(initialClientState);
    setIsModalOpen(false);
  };

  // ✅ Handle form submission (Edit or Add)
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!clientForm.name.trim() || !clientForm.email.trim()) {
    alert("❌ Name and Email are required.");
    return;
  }

  try {
    if (editingClientId) {
      // ✅ Updating an existing client
      console.log(`🔥 Updating client ${editingClientId} in Firestore...`);
      await updateDocument(currentUser.uid, "clients", editingClientId, { ...clientForm });

      // ✅ Update the client in local state
      setClients(clients.map(client => 
        client.id === editingClientId ? { ...clientForm, id: editingClientId } : client
      ));
    } else {
      // ✅ Adding a new client
      console.log("🔥 Adding new client to Firestore...");
      const newId = await addToCollection(currentUser.uid, "clients", clientForm);

      // ✅ Ensure Firestore ID is assigned to the new client
      setClients([...clients, { ...clientForm, id: newId }]);
    }

    closeModal();
  } catch (error) {
    console.error("❌ Error saving client:", error);
  }
};

  // ✅ Handle delete operation (Ensures correct Firestore path)
  const handleDelete = async (clientId) => {
    if (!window.confirm("❗ Are you sure you want to delete this client? This cannot be undone.")) return;
    try {
      console.log(`🔥 Deleting client ${clientId} from Firestore...`);
      await deleteDocument(currentUser.uid, "clients", clientId);
      
      // ✅ Remove client from state immediately after successful deletion
      setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
      console.log(`✅ Client ${clientId} deleted successfully from Firestore.`);
    } catch (error) {
      console.error("❌ Error deleting client:", error);
    }
  };

  return (
    <div className="client-management">
      <Sidebar />

      {/* Main Content */}
      <div className="client-container">
        <h1>Client Management</h1>
        <button className="add-client-btn" onClick={() => openModal()}>+ Add New Client</button>

        {/* Client List Table */}
        <div className="client-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan="5" className="no-clients">No clients added yet.</td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.company}</td>
                    <td className="client-actions">
                      <button onClick={() => openModal(client)}>Edit</button>
                      <button onClick={() => handleDelete(client.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding/Editing Clients */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingClientId ? "Edit Client" : "Add New Client"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Name:</label>
              <input type="text" name="name" value={clientForm.name} onChange={handleInputChange} required />

              <label>Email:</label>
              <input type="email" name="email" value={clientForm.email} onChange={handleInputChange} required />

              <label>Phone:</label>
              <input type="text" name="phone" value={clientForm.phone} onChange={handleInputChange} />

              <label>Company:</label>
              <input type="text" name="company" value={clientForm.company} onChange={handleInputChange} />

              <div className="address-group">
                <label>Address:</label>
                <input type="text" name="address" value={clientForm.address} onChange={handleInputChange} />
                <input type="text" name="city" value={clientForm.city} onChange={handleInputChange} />
                <input type="text" name="state" value={clientForm.state} onChange={handleInputChange} />
                <input type="text" name="zip" value={clientForm.zip} onChange={handleInputChange} />
                <input type="text" name="country" value={clientForm.country} onChange={handleInputChange} />
              </div>

              <label>Notes:</label>
              <textarea name="notes" value={clientForm.notes} onChange={handleInputChange}></textarea>

              <div className="form-buttons">
                <button type="submit">{editingClientId ? "Update Client" : "Save Client"}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
