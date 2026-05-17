const API_URL = 'http://localhost:5001/api';

export const getRooms = async () => {
  const response = await fetch(`${API_URL}/rooms`);
  return response.json();
};

export const getReservations = async () => {
  const response = await fetch(`${API_URL}/reservations`);
  return response.json();
};

export const createReservation = async (reservationData) => {
  const response = await fetch(`${API_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservationData),
  });
  return response.json();
};

export const deleteReservation = async (id) => {
  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};