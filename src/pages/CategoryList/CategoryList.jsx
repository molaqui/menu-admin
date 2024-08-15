import React, { useState, useEffect } from 'react';
import categoryService from '../../Api/CategoryService';
import Swal from 'sweetalert2';
import { Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

const itemsPerPage = 5;

const CategoryList = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        categoryService.getAllCategories()
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des catégories', error);
            });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

    const handleDeleteCategory = (id) => {
        Swal.fire({
            title: t('categoryList.deleteConfirmationTitle'),
            text: t('categoryList.deleteConfirmationText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: t('categoryList.deleteConfirmationConfirm')
        }).then((result) => {
            if (result.isConfirmed) {
                categoryService.deleteCategory(id)
                    .then(() => {
                        Swal.fire(
                            t('categoryList.deleteSuccess'),
                            '',
                            'success'
                        );
                        loadCategories();
                    })
                    .catch(error => {
                        Swal.fire(
                            'Erreur !',
                            t('categoryList.deleteError'),
                            'error'
                        );
                    });
            }
        });
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mt-5">
            <link rel="stylesheet" href="CategoryList.css"/>

            <div className="page-header">
                <div className="page-title">
                    <h4>{t('categoryList.foodListTitle')}</h4>
                    <h6>{t('categoryList.manageListSubtitle')}</h6>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={t('categoryList.searchPlaceholder')}
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <span className="search-icon">
                                <i className="bi bi-search"></i>
                            </span>
                        </div>
                    </div>

                    <table className="table table-hover table-striped">
                        <thead className="thead-custom">
                            <tr>
                                <th>{t('categoryList.name')}</th>
                                <th>{t('categoryList.image')}</th>
                                <th>{t('categoryList.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCategories.map(category => (
                                <tr key={category.id}>
                                    <td>{category.name}</td>
                                    <td>
                                        {category.image ? (
                                            <img src={`data:image/jpeg;base64,${category.image}`} alt={category.name} className="category-image" />
                                        ) : (
                                            t('categoryList.noImage')
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-link text-danger"
                                            onClick={() => handleDeleteCategory(category.id)}
                                        >
                                            <Trash className="icon-large" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <nav>
                        <ul className="pagination justify-content-center">
                            {Array.from({ length: Math.ceil(filteredCategories.length / itemsPerPage) }, (_, i) => (
                                <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                                    <button onClick={() => paginate(i + 1)} className="page-link">
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default CategoryList;
