import axios from 'axios';
const API_BASE_URL = 'https://faithful-charisma-production.up.railway.app'; 
const VisiteService = {
  incrementVisite: async (storeName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/visite/${storeName}/increment`);
      return response.data; // Le backend ne retourne rien dans ce cas, donc ce return est optionnel
    } catch (error) {
      console.error('Error in incrementing visit:', error);
      throw new Error('Failed to increment visit');
    }
  },

  getVisitCount: async (storeName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/visite/${storeName}/count`);
      return response.data;
    } catch (error) {
      console.error('Error in fetching visit count:', error);
      throw new Error('Failed to fetch visit count');
    }
  },

  getVisitCountByUserId: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/visite/user/${userId}/count`);
      return response.data; // Assurez-vous que response.data contient le nombre de visites
    } catch (error) {
      console.error('Error in fetching visit count by userId:', error);
      throw new Error('Failed to fetch visit count by userId');
    }
  }
  
};

 

export default VisiteService;
