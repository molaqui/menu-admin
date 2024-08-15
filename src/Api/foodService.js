import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://faithful-charisma-production.up.railway.app/api/foods';
const CATEGORY_API_URL = 'https://faithful-charisma-production.up.railway.app/api/categories';

class FoodService {
    getUserId() {
        return Cookies.get('userId');
    }

    getAllFoods() {
        const userId = this.getUserId();
        return axios.get(`${API_URL}/${userId}`);
    }

    getFoodsByCategoryName(categoryName) {
        const userId = this.getUserId();
        return axios.get(`${API_URL}/by-category/${categoryName}/${userId}`);
    }

    getFoodById(id) {
        const userId = this.getUserId();
        return axios.get(`${API_URL}/${id}/${userId}`);
    }

    addFood(foodData) {
        const userId = this.getUserId();
        const formData = new FormData();
        formData.append('name', foodData.name);
        formData.append('price', foodData.price);
        formData.append('description', foodData.description);
        formData.append('categoryName', foodData.categoryName);
        formData.append('userId', userId);

        if (foodData.images && foodData.images.length > 0) {
            foodData.images.forEach((image) => {
                formData.append('images', image); // Append each image
            });
        }

        return axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    updateFood(id, foodData) {
        const userId = this.getUserId();
        const formData = new FormData();
        formData.append('name', foodData.name);
        formData.append('price', foodData.price);
        formData.append('description', foodData.description);
        formData.append('categoryName', foodData.categoryName);
        formData.append('userId', userId);

        if (foodData.images && foodData.images.length > 0) {
            foodData.images.forEach((image) => {
                formData.append('images', image); // Append each image
            });
        }

        if (foodData.removedImageIds && foodData.removedImageIds.length > 0) {
            foodData.removedImageIds.forEach((id) => {
                formData.append('removedImageIds', id); // Append each image ID to be removed
            });
        }

        return axios.put(`${API_URL}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    deleteFood(id) {
        const userId = this.getUserId();
        return axios.delete(`${API_URL}/${id}/${userId}`);
    }

    getCategories() {
        const userId = this.getUserId();
        return axios.get(`${CATEGORY_API_URL}/${userId}`);
    }

    getCategoryNames() {
        const userId = this.getUserId();
        return axios.get(`${CATEGORY_API_URL}/names/${userId}`);
    }

    countFoodsByUserId() {
        const userId = this.getUserId();
        return axios.get(`${API_URL}/count/${userId}`);
    }
}



export default new FoodService();
