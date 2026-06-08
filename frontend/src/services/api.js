const API_URL = 'http://localhost:5001/api';

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('cloudroom_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Handle response errors
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }
  return data;
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(response);
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const getRooms = async () => {
  const response = await fetch(`${API_URL}/rooms`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getReservations = async () => {
  const response = await fetch(`${API_URL}/reservations`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createReservation = async (reservationData) => {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reservationData),
  });
  return handleResponse(response);
};

export const deleteReservation = async (id) => {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateReservation = async (id, reservationData) => {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(reservationData),
  });
  return handleResponse(response);
};