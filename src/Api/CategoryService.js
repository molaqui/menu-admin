import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://spring-menu-production.up.railway.app/api/categories';

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

// Nouvelle méthode pour obtenir le nombre de catégories
const getCategoryCountByUserId = () => {
  const userId = getUserId();
  return axios.get(`${API_URL}/count/${userId}`);
};


// Nouvelle méthode pour ajouter des catégories prédéfinies à l'utilisateur
const addPredefinedCategoriesToUser = (userId, categoryIds, foodIds) => {
  const payload = {
    userId: userId,
    categoryIds: categoryIds,
    foodIds: foodIds
  };
  console.log("Payload:", payload); // Vérifiez le payload
  return axios.post(`${API_URL}/add-predefined`, payload);
};


// Nouvelle méthode pour obtenir les catégories prédéfinies
const getPredefinedCategories = () => {
  return axios.get(`${API_URL}/predefined`);
};

// Supprimer une catégorie par ID
const deleteCategory = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getAllCategories,
  uploadImage,
  getAllCategoryNames,
  deleteCategory,
  getCategoryCountByUserId,
  addPredefinedCategoriesToUser,
  getPredefinedCategories
};
