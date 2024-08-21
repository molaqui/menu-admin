import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import foodService from '../../Api/foodService';
import categoryService from '../../Api/CategoryService';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { PencilSquare, Trash, Search, Funnel, PlusSquare, Eye, CloudUpload } from 'react-bootstrap-icons';
import './FoodList.css';
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
    const [showAddImageModal, setShowAddImageModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentFood, setCurrentFood] = useState({
        id: '',
        name: '',
        price: '',
        description: '',
        images: [],
        categoryName: ''
    });
    const [imageToAdd, setImageToAdd] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [foodToDelete, setFoodToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
        setCurrentPage(1); // Reset to first page
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page
    };

    const filteredFoods = foods.filter(food => {
        const matchesSearchTerm = food.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? food.category?.name === selectedCategory : true;
        return matchesSearchTerm && matchesCategory;
    });

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
                setIsDeleting(true);
                await foodService.deleteFood(foodToDelete.id);
                toast.success(t('foodList.deleteFoodSuccess'));
                loadFoods();
                setShowDeleteModal(false);
            } catch (error) {
                toast.error(t('foodList.deleteFoodError') + ': ' + error.message);
            } finally {
                setIsDeleting(false);
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
        setShowModal(true);
    };

    const handleAddImageToFood = (food) => {
        setCurrentFood(food);
        setShowAddImageModal(true);
    };

    const handleViewDetails = (food) => {
        setCurrentFood({
            id: food.id,
            name: food.name,
            price: food.price,
            description: food.description,
            images: food.images || [],
            categoryName: food.category ? food.category.name : t('foodList.noCategory')
        });
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => setShowModal(false);
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleCloseAddImageModal = () => setShowAddImageModal(false);
    const handleCloseDetailsModal = () => setShowDetailsModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentFood(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageToAdd(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        const { id, name, price, description, categoryName } = currentFood;

        if (!name || !price || !description || !categoryName) {
            toast.error("All fields are required.");
            return;
        }

        const foodData = {
            name,
            price,
            description,
            categoryName
        };

        try {
            setIsLoading(true);
            await foodService.updateFood(id, foodData);
            toast.success(t('foodList.updateFoodSuccess'));
            loadFoods();
            handleCloseModal();
        } catch (error) {
            console.error("Error updating food:", error.response ? error.response.data : error.message);
            toast.error(t('foodList.updateFoodError') + ': ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAddImage = async (e) => {
        e.preventDefault();
        const { id } = currentFood;

        if (!imageToAdd) {
            toast.error("Please select an image to upload.");
            return;
        }

        try {
            setIsLoading(true);
            await foodService.addImageToFood(id, imageToAdd);
            toast.success(t('foodList.addImageSuccess'));
            loadFoods();
            handleCloseAddImageModal();
        } catch (error) {
            console.error("Error adding image:", error.response ? error.response.data : error.message);
            toast.error(t('foodList.addImageError') + ': ' + error.message);
        } finally {
            setIsLoading(false);
            setImagePreview(null);
        }
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
                                            <button className="btn btn-info me-2" onClick={() => handleUpdateFood(food)}>
                                                <PencilSquare className="icon" />
                                            </button>
                                            <button className="btn btn-success me-2" onClick={() => handleAddImageToFood(food)}>
                                                <PlusSquare className="icon" />
                                            </button>
                                            <button className="btn btn-primary" onClick={() => handleViewDetails(food)}>
                                                <Eye className="icon" />
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
                                <a className="page-link" href="#" aria-label="Previous" onClick={() => currentPage > 1 && paginate(currentPage - 1)}>
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
                                <a className="page-link" href="#" aria-label="Next" onClick={() => currentPage < Math.ceil(filteredFoods.length / itemsPerPage) && paginate(currentPage + 1)}>
                                    <span aria-hidden="true">&raquo;</span>
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <Modal show={showModal} onHide={handleCloseModal} className="custom-modal">
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
                                <br />
                                <Button variant="primary" type="submit" disabled={isLoading}>
                                    {isLoading ? <Spinner animation="border" size="sm" /> : t('foodList.saveChanges')}
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    <Modal show={showAddImageModal} onHide={handleCloseAddImageModal} className="custom-modal">
                        <Modal.Header closeButton>
                            <Modal.Title>{t('foodList.addImage')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleSubmitAddImage}>
                                <Form.Group>
                                    <label className="custom-file-upload">
                                        <CloudUpload className="upload-icon" />
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            required
                                        />
                                        <span>{t('foodList.uploadImage')}</span>
                                    </label>
                                </Form.Group>
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                                <br />
                                <Button variant="primary" type="submit" disabled={isLoading}>
                                    {isLoading ? <Spinner animation="border" size="sm" /> : t('foodList.addImageButton')}
                                </Button>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} className="custom-modal">
                        <Modal.Header closeButton>
                            <Modal.Title>{t('foodList.foodDetails')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h5>{t('foodList.name')}: {currentFood.name}</h5>
                            <h5>{t('foodList.price')}: {currentFood.price}</h5>
                            <h5>{t('foodList.description')}: {currentFood.description}</h5>
                            <h5>{t('foodList.category')}: {currentFood.categoryName}</h5>
                            <h5>{t('foodList.images')}:</h5>
                            {currentFood.images.length > 0 ? (
                                currentFood.images.map((image, index) => (
                                    <img key={index} src={`data:image/jpeg;base64,${image.image}`} alt={`image-${index}`} style={{ width: '100px', height: 'auto', margin: '5px' }} />
                                ))
                            ) : (
                                <p>{t('foodList.noImage')}</p>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDetailsModal}>{t('foodList.close')}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="custom-modal">
                        <Modal.Header closeButton>
                            <Modal.Title>{t('foodList.confirmDeletion')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>{t('foodList.confirmDeletionText')}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseDeleteModal}>{t('foodList.cancel')}</Button>
                            <Button variant="danger" onClick={handleDeleteFood} disabled={isDeleting}>
                                {isDeleting ? <Spinner animation="border" size="sm" /> : t('foodList.delete')}
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default FoodList;