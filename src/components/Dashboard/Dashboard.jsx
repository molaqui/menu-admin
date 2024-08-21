import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import the useTranslation hook
import FoodService from '../../Api/foodService';
import VisiteService from '../../Api/VisiteService';
import categoryService from '../../Api/CategoryService';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { Oval } from 'react-loader-spinner';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUtensils, faLayerGroup, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const ITEMS_PER_PAGE = 5;

function Dashboard() {
  const { t } = useTranslation(); // Initialize the useTranslation hook
  const [foodCount, setFoodCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [predefinedCategories, setPredefinedCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingCategoryNames, setExistingCategoryNames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodResponse, categoryNamesResponse, visitResponse, predefinedCategoriesResponse] = await Promise.all([
          FoodService.countFoodsByUserId(),
          categoryService.getAllCategoryNames(),
          VisiteService.getVisitCountByUserId(Cookies.get('userId')),
          categoryService.getPredefinedCategories()
        ]);

        setFoodCount(foodResponse.data);
        setCategoryCount(categoryNamesResponse.data.length);
        setVisitCount(visitResponse);
        setExistingCategoryNames(categoryNamesResponse.data);

        const filteredPredefinedCategories = predefinedCategoriesResponse.data.filter(
          (category) => !categoryNamesResponse.data.includes(category.name)
        );
        setPredefinedCategories(filteredPredefinedCategories);
      } catch (error) {
        setError('Error fetching data');
      }
    };

    fetchData();
  }, []);

  const handleCategorySelection = (categoryId) => {
    const updatedSelectedCategoryIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];

    const categoryFoods = predefinedCategories.find((category) => category.id === categoryId)?.foods.map((food) => food.id) || [];
    
    const updatedSelectedFoodIds = selectedCategoryIds.includes(categoryId)
      ? selectedFoodIds.filter((foodId) => !categoryFoods.includes(foodId))
      : [...new Set([...selectedFoodIds, ...categoryFoods])];

    setSelectedCategoryIds(updatedSelectedCategoryIds);
    setSelectedFoodIds(updatedSelectedFoodIds);
  };

  const handleFoodSelection = (foodId) => {
    setSelectedFoodIds((prevSelected) =>
      prevSelected.includes(foodId)
        ? prevSelected.filter((id) => id !== foodId)
        : [...prevSelected, foodId]
    );
  };

  const handleCategoryExpand = (categoryId) => {
    setExpandedCategories((prevExpanded) =>
      prevExpanded.includes(categoryId)
        ? prevExpanded.filter((id) => id !== categoryId)
        : [...prevExpanded, categoryId]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    Swal.fire({
      title: t('dashboard.addingCategories'),
      text: t('dashboard.waitMessage'),
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const userId = Cookies.get('userId');
      await categoryService.addPredefinedCategoriesToUser(userId, selectedCategoryIds, selectedFoodIds);
      Swal.close();
      Swal.fire(t('dashboard.successTitle'), t('dashboard.successMessage'), 'success');

      const [foodResponse, categoryNamesResponse, predefinedCategoriesResponse] = await Promise.all([
        FoodService.countFoodsByUserId(),
        categoryService.getAllCategoryNames(),
        categoryService.getPredefinedCategories()
      ]);
      setFoodCount(foodResponse.data);
      setCategoryCount(categoryNamesResponse.data.length);
      setExistingCategoryNames(categoryNamesResponse.data);

      const filteredPredefinedCategories = predefinedCategoriesResponse.data.filter(
        (category) => !categoryNamesResponse.data.includes(category.name)
      );
      setPredefinedCategories(filteredPredefinedCategories);
    } catch (error) {
      setError('Error adding predefined categories');
      Swal.close();
      Swal.fire(t('dashboard.errorTitle'), t('dashboard.errorMessage'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFirstImage = (images) => {
    if (images && images.length > 0) {
      return `data:image/jpeg;base64,${images[0].image}`;
    }
    return '';
  };

  const filteredCategories = predefinedCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const displayedCategories = filteredCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="dashboard">
      <link rel="stylesheet" href="Dashboard.css"></link>
      <div className="">
        <div className="row">
          <div className="col-lg-4 col-sm-12 col-12 d-flex">
            <div className="dash-count">
              <div className="dash-counts">
                <h4>{visitCount}</h4>
                <h5>{t('dashboard.visitors')}</h5> {/* Use translation */}
              </div>
              <div className="dash-imgs">
                <FontAwesomeIcon icon={faUser} />
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-sm-12 col-12 d-flex ">
            <div className="dash-count das1">
              <div className="dash-counts">
                <h4>{categoryCount}</h4>
                <h5>{t('dashboard.categories')}</h5> {/* Use translation */}
              </div>
              <div className="dash-imgs">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-12 col-12 d-flex">
            <div className="dash-count das2">
              <div className="dash-counts">
                <h4>{foodCount}</h4>
                <h5>{t('dashboard.articles')}</h5> {/* Use translation */}
              </div>
              <div className="dash-imgs">
                <FontAwesomeIcon icon={faUtensils} />
              </div>
            </div>
          </div>
        </div>
        <div className="predefined-categories">
          <h2>{t('dashboard.boostMenu')}</h2> {/* Use translation */}
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder')} // Use translation
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul>
            {displayedCategories.map((category) => (
              <li key={category.id} className="category-item">
                <div className="category-header">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    className="styled-checkbox"
                    value={category.id}
                    onChange={() => handleCategorySelection(category.id)}
                    checked={selectedCategoryIds.includes(category.id)}
                  />
                  <label htmlFor={`category-${category.id}`}></label>
                  <img src={`data:image/jpeg;base64,${category.image}`} alt={category.name} className="category-image" />
                  <div className="category-info">
                    <span className="category-name">{category.name}</span>
                    <span className="food-count">({category.foods.length} {t('dashboard.articles')})</span> {/* Use translation */}
                  </div>
                  <button onClick={() => handleCategoryExpand(category.id)} className="dropdown-button">
                    {expandedCategories.includes(category.id) ? <FontAwesomeIcon icon={faChevronDown} /> : <FontAwesomeIcon icon={faChevronRight} />}
                  </button>
                </div>
                {expandedCategories.includes(category.id) && (
                  <div className="foods-list">
                    {category.foods.map((food) => (
                      <div key={food.id} className="food-item">
                        <input
                          type="checkbox"
                          id={`food-${food.id}`}
                          className="styled-checkbox"
                          value={food.id}
                          onChange={() => handleFoodSelection(food.id)}
                          checked={selectedFoodIds.includes(food.id)}
                        />
                        <label htmlFor={`food-${food.id}`}></label>
                        <img src={getFirstImage(food.images)} alt={food.name} className="food-image" />
                        <div className="food-info">
                          <span className="food-name">{food.name}</span>
                          <span className="food-description">{food.description}</span>
                          <span className="food-price">${food.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="pagination">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              {t('dashboard.previous')} {/* Use translation */}
            </button>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              {t('dashboard.next')} {/* Use translation */}
            </button>
          </div>
          <button className="submit-button" onClick={handleSubmit} disabled={selectedCategoryIds.length === 0 || loading}>
            {loading ? <Oval color="#fff" height={20} width={20} /> : t('dashboard.addCategories')} {/* Use translation */}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;