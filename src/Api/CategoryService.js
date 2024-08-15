import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://faithful-charisma-production.up.railway.app/api/categories';

const getUserId = () => {
  return Cookies.get('userId');
};

const getAllCategories = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/${userId}`);
};

const uploadImage = (image, name) => {
  const userId = getUserId();
  const formData = new FormData();
  formData.append('image', image);
  formData.append('name', name);
  formData.append('userId', userId);

  return axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
};

const getAllCategoryNames = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/names/${userId}`);
};

const deleteCategory = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};


// Nouvelle méthode pour obtenir le nombre de catégories
const getCategoryCountByUserId = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/count/${userId}`);
};
export default {
  getAllCategories,
  uploadImage,
  getAllCategoryNames,
  deleteCategory,
  getCategoryCountByUserId
};
