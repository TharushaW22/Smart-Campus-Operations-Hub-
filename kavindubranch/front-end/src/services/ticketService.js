import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tickets';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

const ticketService = {
  createTicket: async (ticketData) => {
    const formData = new FormData();
    formData.append('resourceLocation', ticketData.resourceLocation);
    formData.append('category', ticketData.category);
    formData.append('description', ticketData.description);
    formData.append('priority', ticketData.priority);
    formData.append('preferredContactDetails', ticketData.preferredContactDetails);
    if (ticketData.images) {
      ticketData.images.forEach((image) => formData.append('images', image));
    }
    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data', ...authHeaders() },
    });
    return response.data;
  },

  getAllTickets: async () => {
    const response = await axios.get(API_URL, { headers: authHeaders() });
    return response.data;
  },

  getMyTickets: async () => {
    const response = await axios.get(`${API_URL}/my`, { headers: authHeaders() });
    return response.data;
  },

  getAssignedTickets: async () => {
    const response = await axios.get(`${API_URL}/assigned`, { headers: authHeaders() });
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: authHeaders() });
    return response.data;
  },

  updateTicket: async (id, data) => {
    const response = await axios.patch(`${API_URL}/${id}`, data, { headers: authHeaders() });
    return response.data;
  },

  assignTechnician: async (ticketId, technicianId) => {
    const response = await axios.post(
      `${API_URL}/${ticketId}/assign`,
      { technicianId },
      { headers: authHeaders() }
    );
    return response.data;
  },
};

export default ticketService;
