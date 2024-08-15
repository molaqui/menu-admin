import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://faithful-charisma-production.up.railway.app/api/tokens';
const AUTH_URL = 'https://faithful-charisma-production.up.railway.app/api/auth';

const getUserId = () => {
  return Cookies.get('userId');
};

const generateToken = (tableNumber) => {
  return axios.post(`${API_URL}/generate`, { tableNumber })
    .then(response => response.data);
};

const verifyToken = (token) => {
  return axios.get(`${API_URL}/verify`, {
    params: { token }
  })
  .then(response => response.data);
};

const getWebsiteUrl = () => {
  const userId = getUserId();
  return axios.get(`${AUTH_URL}/user/${userId}/website-url`)
    .then(response => response.data);
};

export default {
  generateToken,
  verifyToken,
  getWebsiteUrl
};
