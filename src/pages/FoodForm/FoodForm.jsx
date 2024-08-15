import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import './FoodForm.css'; // Assurez-vous que vos styles spécifiques sont définis ici
import foodService from '../../Api/foodService';
import categoryService from '../../Api/CategoryService';

const initialFormData = {
  name: '',
  price: '',
  description: '',
  images: [],
  categoryName: '',
};

function FoodForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    categoryService
      .getAllCategories()
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error fetching categories', error));
  }, []);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setFormData((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...files],
    }));

    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newImageUrls]);
  };

  const removeImage = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    foodService
      .addFood(formData)
      .then((response) => {
        toast.success(t('foodForm.addSuccess'));
        setFormData(initialFormData); // Reset form
        setImagePreviews([]); // Clear image previews
      })
      .catch((error) => {
        toast.error(t('foodForm.addError') + ': ' + error.message);
        console.error(error);
      });
  };

  return (
    <div className="p-3">
      <ToastContainer />
      <div className="">
        <div className="page-header">
          <div className="page-title">
            <h4>{t('foodForm.addNewFoodTitle')}</h4>
            <h6>{t('foodForm.enterDetailsSubtitle')}</h6>
          </div>
        </div>
        <div className="card ml-3">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">
                  {t('foodForm.nameLabel')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="price" className="form-label">
                  {t('foodForm.priceLabel')}
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label htmlFor="description" className="form-label">
                  {t('foodForm.descriptionLabel')}
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="col-12">
                <label htmlFor="images" className="form-label">
                  {t('foodForm.uploadImagesLabel')}
                </label>
                <div className="image-upload">
                  <input
                    type="file"
                    className="form-control"
                    id="images"
                    name="images"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                  />
                  <div className="image-uploads">
                    <img src="assets/img/icons/upload.svg" alt="img" />
                    <h4>{t('foodForm.dragAndDropText')}</h4>
                  </div>
                </div>
                <div className="image-previews mt-3">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="preview-container position-relative">
                      <img src={src} alt={`Preview ${index}`} className="preview-image" />
                      <button
                        type="button"
                        className="btn btn-danger btn-remove-image"
                        onClick={() => removeImage(index)}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-12">
                <label htmlFor="categoryName" className="form-label">
                  {t('foodForm.selectCategoryLabel')}
                </label>
                <select
                  className="form-select"
                  id="categoryName"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('foodForm.selectCategoryPlaceholder')}</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">
                  {t('foodForm.addFoodButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodForm;
