import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://faithful-charisma-production.up.railway.app/api/locations';

const getUserId = () => {
  return Cookies.get('userId'); // Ensure this is set correctly
};

const saveLocation = async ({ mapLink, userId }) => {
  const response = await axios.post(API_URL, { mapLink, userId });
  return response.data;
};

const getLocationByUserId = async (userId) => {
  if (!userId) throw new Error('User ID is undefined');
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};

const deleteLocation = async (locationId) => {
  const response = await axios.delete(`${API_URL}/${locationId}`);
  return response.data;
};

export default {
  saveLocation,
  getLocationByUserId,
  deleteLocation,
};
