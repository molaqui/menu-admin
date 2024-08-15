import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://spring-menu-production.up.railway.app/api/reservations';

const getUserId = () => {
  return Cookies.get('userId');
};

const bookTable = (reservation) => {
  const userId = getUserId();
  return axios.post(`${API_URL}/book`, reservation, {
    params: { userId }
  });
};

const getAllReservations = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/all/${userId}`);
};

const getReservationById = (id) => {
  const userId = getUserId();
  return axios.get(`${API_URL}/${id}/${userId}`);
};

const updateReservation = (id, reservationDetails) => {
  const userId = getUserId();
  return axios.put(`${API_URL}/${id}`, reservationDetails, {
    params: { userId }
  });
};

const deleteReservation = (id) => {
  const userId = getUserId();
  return axios.delete(`${API_URL}/${id}/${userId}`);
};

// Nouvelle méthode pour compter les réservations par utilisateur
const countReservationsByUserId = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/count/${userId}`);
};

export default {
  bookTable,
  getAllReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
  countReservationsByUserId
};
