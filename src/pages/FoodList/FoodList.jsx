import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import foodService from '../../Api/foodService';
import categoryService from '../../Api/CategoryService';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { PencilSquare, Trash, Search, Funnel } from 'react-bootstrap-icons';
import './FoodList.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function FoodList() {
    const { t } = useTranslation();
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentFood, setCurrentFood] = useState({
        id: '',
        name: '',
        price: '',
        description: '',
        images: [],
        categoryName: ''
    });
    const [removedImages, setRemovedImages] = useState([]);
    const [foodToDelete, setFoodToDelete] = useState(null);
    const itemsPerPage = 5;

    useEffect(() => {
        loadFoods();
        loadCategories();
    }, []);

    const loadFoods = async () => {
        try {
            const response = await foodService.getAllFoods();
            setFoods(response.data);
        } catch (error) {
            console.error('Error fetching foods', error);
            toast.error(t('foodList.fetchFoodsError'));
        }
    };

    const loadCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories', error);
            toast.error(t('foodList.fetchCategoriesError'));
        }
    };

    const handleCategoryChange = async (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        try {
            if (category) {
                const response = await foodService.getFoodsByCategoryName(category);
                setFoods(response.data);
            } else {
                loadFoods();
            }
        } catch (error) {
            console.error('Error fetching foods by category', error);
            toast.error(t('foodList.fetchFoodsByCategoryError'));
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const filteredFoods = foods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFoods = filteredFoods.slice(indexOfFirstItem, indexOfLastItem);

    const confirmDeleteFood = (food) => {
        setFoodToDelete(food);
        setShowDeleteModal(true);
    };

    const handleDeleteFood = async () => {
        if (foodToDelete) {
            try {
                await foodService.deleteFood(foodToDelete.id);
                toast.success(t('foodList.deleteFoodSuccess'));
                loadFoods();
                setShowDeleteModal(false);
            } catch (error) {
                toast.error(t('foodList.deleteFoodError') + ': ' + error.message);
            }
        }
    };

    const handleUpdateFood = (food) => {
        setCurrentFood({
            id: food.id,
            name: food.name,
            price: food.price,
            description: food.description,
            images: food.images || [],
            categoryName: food.category ? food.category.name : ''
        });
        setRemovedImages([]);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentFood(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [];

        files.forEach(file => {
            resizeImage(file, 360, 280, (resizedBlob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newImages.push({ image: reader.result.split(',')[1] });
                    if (newImages.length === files.length) {
                        setCurrentFood(prevState => ({
                            ...prevState,
                            images: [...prevState.images, ...newImages]
                        }));
                    }
                };
                reader.readAsDataURL(resizedBlob);
            });
        });
    };

    const resizeImage = (file, width, height, callback) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(callback, file.type, 0.8);
            };
        };
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        const { id, name, price, description, categoryName, images } = currentFood;
        const userId = foodService.getUserId(); // Fetch the userId from the service

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price.toString());
        formData.append('description', description);
        formData.append('categoryName', categoryName);
        formData.append('userId', userId);

        images.forEach((image, index) => {
            if (image.image) {
                const byteString = atob(image.image);
                const mimeString = 'image/png';
                const buffer = new ArrayBuffer(byteString.length);
                const data = new Uint8Array(buffer);
                for (let i = 0; i < byteString.length; i++) {
                    data[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([buffer], { type: mimeString });
                formData.append('images', blob, `image-${index}.png`);
            }
        });

        removedImages.forEach((image) => {
            formData.append('removedImageIds', image.id);
        });

        try {
            await axios.put(`https://faithful-charisma-production.up.railway.app/api/foods/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success(t('foodList.updateFoodSuccess'));
            loadFoods();
            handleCloseModal();
        } catch (error) {
            toast.error(t('foodList.updateFoodError') + ': ' + error.message);
        }
    };

    const removeImage = (index) => {
        setRemovedImages(prevState => [...prevState, currentFood.images[index]]);
        setCurrentFood(prevState => ({
            ...prevState,
            images: prevState.images.filter((_, i) => i !== index)
        }));
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mt-5">
            <ToastContainer />
            <div className="page-header">
                <div className="page-title">
                <h4>{t('foodList.title')}</h4>
                <h6>{t('foodList.subtitle')}</h6>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    {/* Filter and Search Section */}
                    <div className="filter-search-container mb-4">
                        <div className="filter-container">
                            <Funnel className="filter-icon" />
                            <select id="categoryFilter" className="filter-select" value={selectedCategory} onChange={handleCategoryChange}>
                                <option value="">{t('foodList.allCategories')}</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="search-container">
                            <Search className="search-icon mb--2" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder={t('foodList.searchPlaceholder')}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                aria-label={t('foodList.searchAriaLabel')}
                            />
                        </div>
                    </div>

                    <table className="table table-hover table-striped">
                        <thead className="thead-custom">
                            <tr>
                                <th>{t('foodList.name')}</th>
                                <th>{t('foodList.price')}</th>
                                <th>{t('foodList.description')}</th>
                                <th>{t('foodList.category')}</th>
                                <th>{t('foodList.image')}</th>
                                <th>{t('foodList.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentFoods.map(food => (
                                <tr key={food.id}>
                                    <td>{food.name}</td>
                                    <td>{food.price}</td>
                                    <td>{food.description}</td>
                                    <td>{food.category ? food.category.name : t('foodList.noCategory')}</td>
                                    <td>
                                        {food.images.length > 0 ? (
                                            <img src={`data:image/jpeg;base64,${food.images[0].image}`} alt={food.name} style={{ width: '100px', height: 'auto' }} />
                                        ) : (
                                            t('foodList.noImage')
                                        )}
                                    </td>
                                    <td>
                                        <div className='d-flex mt-3'>
                                            <button className="btn btn-danger me-2" onClick={() => confirmDeleteFood(food)}>
                                                <Trash className="icon" />
                                            </button>
                                            <button className="btn btn-info" onClick={() => handleUpdateFood(food)}>
                                                <PencilSquare className="icon" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <nav aria-label="Page navigation">
                        <ul className="pagination">
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Previous">
                                    <span aria-hidden="true">&laquo;</span>
                                </a>
                            </li>
                            {Array.from({ length: Math.ceil(filteredFoods.length / itemsPerPage) }, (_, i) => (
                                <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                                    <a className="page-link" href="#" onClick={() => paginate(i + 1)}>
                                        {i + 1}
                                    </a>
                                </li>
                            ))}
                            <li className="page-item">
                                <a className="page-link" href="#" aria-label="Next">
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>

                    {/* Update Food Modal */}
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                         <Modal.Title>{t('foodList.updateFood')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmitUpdate}>
                                <Form.Group>
                                <Form.Label>{t('foodList.name')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={currentFood.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group>
                                <Form.Label>{t('foodList.price')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={currentFood.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group>
                                <Form.Label>{t('foodList.description')}</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        value={currentFood.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group>
                                <Form.Label>{t('foodList.category')}</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="categoryName"
                                        value={currentFood.categoryName}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">{t('foodList.selectCategory')}</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group>
                                <Form.Label>{t('foodList.images')}</Form.Label>
                                    <div className="image-previews">
                                        {currentFood.images.map((image, index) => (
                                            <div key={index} className="preview-container">
                                                <img src={`data:image/jpeg;base64,${image.image}`} alt={`Preview ${index}`} className="preview-image" />
                                                <button
                                                    type="button"
                                                    className="remove-button"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <span className="remove-icon">&times;</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <Form.Control
                                        type="file"
                                        name="images"
                                        onChange={handleImageChange}
                                        multiple
                                    />
                                </Form.Group>
                                <br />
                                <Button variant="primary" type="submit">
                                {t('foodList.saveChanges')}
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Delete Confirmation Modal */}
                    <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                        <Modal.Header closeButton>
                        <Modal.Title>{t('foodList.confirmDeletion')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <p>{t('foodList.confirmDeletionText')}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDeleteModal}>{t('foodList.cancel')}</Button>
                            <Button variant="danger" onClick={handleDeleteFood}>{t('foodList.delete')}</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default FoodList;
