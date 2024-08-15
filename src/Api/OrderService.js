import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://spring-menu-production.up.railway.app/api/orders';

const getUserId = () => {
  return Cookies.get('userId');
};

const createOrder = (order) => {
  const userId = getUserId();
  return axios.post(`${API_URL}/create`, order, {
    params: { userId }
  });
};

const getOrdersByTable = (tableNumber) => {
  const userId = getUserId();
  return axios.get(`${API_URL}/table/${tableNumber}/${userId}`);
};

const getDeliveryOrders = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/delivery/${userId}`);
};

const getTableOrders = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/table/${userId}`);
};

const updateOrderStatus = (orderId, status) => {
    const userId = getUserId();
    console.log(`Updating order ${orderId} with status ${status} for user ${userId}`);
    return axios.put(`${API_URL}/${orderId}/status`, { status }, {
      params: { userId },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };
  

const deleteOrder = (orderId) => {
  const userId = getUserId();
  return axios.delete(`${API_URL}/${orderId}/${userId}`);
};

// Nouvelle méthode pour compter les ordres de table
const countTableOrders = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/count/table/${userId}`);
};

// Nouvelle méthode pour compter les ordres de livraison
const countDeliveryOrders = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/count/delivery/${userId}`);
};


export default {
  createOrder,
  getOrdersByTable,
  getDeliveryOrders,
  getTableOrders,
  updateOrderStatus,
  deleteOrder,
  countTableOrders,
  countDeliveryOrders
};
