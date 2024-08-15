import axios from 'axios';
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies

const API_URL = 'https://spring-menu-production.up.railway.app/api/auth';

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, null, {
    params: { email, password }
  });
  if (response.data) {
    const user = response.data;
    Cookies.set('userId', user.id, { expires: 1 }); // Store userId in a cookie for 1 day
    sessionStorage.setItem('token', 'dummy-token'); // Store token for example purposes
    return user;
  }
  return null;
};

// Fonction pour vérifier si l'email existe
const checkEmailExists = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/check-email`, {
      params: { email }
    });
    return response.data.exists;
  } catch (error) {
    console.error('Email check failed:', error);
    return false;
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, null, {
      params: { email }
    });
    return response.data; // Vérifiez la réponse retournée par l'API
  } catch (error) {
    console.error("Error in forgotPassword service:", error);
    throw error; // Rejette l'erreur pour être capturée dans le composant
  }
};


const getUserByStoreName = (storeName) => {
  return axios.get(`${API_URL}/user/store/${storeName}`);
};

const addUser = async (user, logoFile) => {
  const formData = new FormData();
  formData.append('email', user.email);
  formData.append('password', user.password);
  formData.append('storeName', user.storeName);
  formData.append('phone', user.phone);
  formData.append('city', user.city);
  formData.append('firstName', user.firstName);
  formData.append('lastName', user.lastName);
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  try {
    const response = await axios.post(`${API_URL}/user`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Add user failed:', error);
    throw new Error('Unable to add user.');
  }
};


const getLogoByStoreName = (storeName) => {
  return axios.get(`${API_URL}/user/store/${storeName}/logo`, {
    responseType: 'blob' // Pour gérer la réponse de fichier image
  });
};

export const updateUser = async (userId, userData, logoFile) => {
  try {
      const formData = new FormData();
      
      // Ajouter les données de l'utilisateur
      for (const key in userData) {
          formData.append(key, userData[key]);
      }

      // Ajouter le fichier logo si présent
      if (logoFile) {
          formData.append('logo', logoFile);
      }

      const response = await axios.put(`${API_URL}/user/${userId}`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });

      return response.data;
  } catch (error) {
      console.error('Error updating user:', error);
      throw error;
  }
};
const deleteUser = (userId) => {
  return axios.delete(`${API_URL}/user/${userId}`);
};

const getLogo = (userId) => {
  return axios.get(`${API_URL}/user/${userId}/logo`, {
    responseType: 'blob' // To handle image file response
  });
};


// Get user by ID
const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Get user by ID failed:', error);
    throw new Error('User not found.');
  }
};

export default {
  login,
  forgotPassword,
  getUserByStoreName,
  addUser,
  updateUser,
  deleteUser,
  getLogo,
  getLogoByStoreName,
  getUserById,
  checkEmailExists
};
