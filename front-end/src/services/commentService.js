import axios from 'axios';

const BASE = 'http://localhost:8080/api/tickets';

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

const commentService = {
  getComments: async (ticketId) => {
    const response = await axios.get(`${BASE}/${ticketId}/comments`, { headers: authHeaders() });
    return response.data;
  },

  addComment: async (ticketId, content) => {
    const response = await axios.post(
      `${BASE}/${ticketId}/comments`,
      { content },
      { headers: authHeaders() }
    );
    return response.data;
  },

  updateComment: async (ticketId, commentId, content) => {
    const response = await axios.put(
      `${BASE}/${ticketId}/comments/${commentId}`,
      { content },
      { headers: authHeaders() }
    );
    return response.data;
  },

  deleteComment: async (ticketId, commentId) => {
    await axios.delete(`${BASE}/${ticketId}/comments/${commentId}`, { headers: authHeaders() });
  },
};

export default commentService;
