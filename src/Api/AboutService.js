import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://faithful-charisma-production.up.railway.app/api/about';

const getUserId = () => {
  return Cookies.get('userId');
};

const getAbout = async () => {
  const userId = getUserId();
  const response = await axios.get(API_URL, {
    params: { userId }
  });
  return response.data;
};

const saveAbout = async (aboutData, images) => {
  const userId = getUserId();
  const formData = new FormData();
  formData.append('title', aboutData.title);
  formData.append('subtitle', aboutData.subtitle);
  formData.append('description', aboutData.description);
  formData.append('yearsOfExperience', aboutData.yearsOfExperience);
  formData.append('numberOfChefs', aboutData.numberOfChefs);
  formData.append('image1', images.image1);
  formData.append('image2', images.image2);
  formData.append('image3', images.image3);
  formData.append('image4', images.image4);
  formData.append('userId', userId);

  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};


const updateAbout = async (aboutData) => {
  const userId = getUserId();
  const formData = new FormData();
  formData.append('title', aboutData.title);
  formData.append('subtitle', aboutData.subtitle);
  formData.append('description', aboutData.description);
  formData.append('yearsOfExperience', aboutData.yearsOfExperience);
  formData.append('numberOfChefs', aboutData.numberOfChefs);
  if (aboutData.image1) formData.append('image1', aboutData.image1);
  if (aboutData.image2) formData.append('image2', aboutData.image2);
  if (aboutData.image3) formData.append('image3', aboutData.image3);
  if (aboutData.image4) formData.append('image4', aboutData.image4);

  const response = await axios.put(`${API_URL}/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const deleteAboutImage = async (imageKey) => {
  const userId = getUserId();
  await axios.delete(`${API_URL}/${userId}/image/${imageKey}`);
};

const deleteAllAbout = async () => {
  const userId = Cookies.get('userId');
  await axios.delete(`${API_URL}/${userId}`);
};
export default {
  getAbout,
  saveAbout,
  updateAbout,
  deleteAboutImage,
  deleteAllAbout
};
