import axios from 'axios'

const API_BASE = 'http://localhost:8080'

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function createBooking(bookingData) {
  const res = await axios.post(`${API_BASE}/api/bookings`, bookingData, {
    headers: authHeaders(),
  })
  return res.data
}

export async function getMyBookings() {
  const res = await axios.get(`${API_BASE}/api/bookings/my`, {
    headers: authHeaders(),
  })
  return res.data
}

export async function getAllBookings(filters = {}) {
  const params = {}
  if (filters.status) params.status = filters.status
  if (filters.date) params.date = filters.date
  if (filters.resourceId) params.resourceId = filters.resourceId

  const res = await axios.get(`${API_BASE}/api/bookings`, {
    headers: authHeaders(),
    params,
  })
  return res.data
}

export async function getBookingById(id) {
  const res = await axios.get(`${API_BASE}/api/bookings/${id}`, {
    headers: authHeaders(),
  })
  return res.data
}

export async function getBookingAnalytics() {
  const res = await axios.get(`${API_BASE}/api/bookings/analytics`, {
    headers: authHeaders(),
  })
  return res.data
}

export async function updateBookingStatus(id, statusData) {
  const res = await axios.put(`${API_BASE}/api/bookings/${id}/status`, statusData, {
    headers: authHeaders(),
  })
  return res.data
}

export async function updateBooking(id, bookingData) {
  const res = await axios.put(`${API_BASE}/api/bookings/${id}`, bookingData, {
    headers: authHeaders(),
  })
  return res.data
}

export async function deleteBooking(id) {
  await axios.delete(`${API_BASE}/api/bookings/${id}`, {
    headers: authHeaders(),
  })
}

export async function getBookingCheckInToken(id) {
  const res = await axios.post(`${API_BASE}/api/bookings/${id}/checkin-token`, null, {
    headers: authHeaders(),
  })
  return res.data
}

export async function checkInBookingByToken(token) {
  const res = await axios.post(`${API_BASE}/api/bookings/checkin`, { token }, {
    headers: authHeaders(),
  })
  return res.data
}
