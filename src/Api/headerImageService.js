import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://spring-menu-production.up.railway.app/api/header-images';

const getUserId = () => {
  return Cookies.get('userId');
};

const saveHeaderImage = async (headerImageData) => {
  const formData = new FormData();
  formData.append('title', headerImageData.title);
  formData.append('subtitle', headerImageData.subtitle);
  formData.append('bgImage', headerImageData.bgImage);

  const userId = getUserId();
  const response = await axios.post(`${API_URL}?userId=${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

const getHeaderImages = async () => {
  const userId = getUserId();
  const response = await axios.get(`${API_URL}?userId=${userId}`);
  return response.data;
};

export default {
  saveHeaderImage,
  getHeaderImages,
};
