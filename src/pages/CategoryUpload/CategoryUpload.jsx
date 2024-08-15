import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CategoryUpload.css';
import CategoryService from '../../Api/CategoryService';
import { useTranslation } from 'react-i18next'; // Importer useTranslation

function CategoryUpload() {
    const { t } = useTranslation(); // Initialiser useTranslation
    const [file, setFile] = useState(null);
    const [name, setName] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const onFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
        }
    };

    const onNameChange = (event) => {
        setName(event.target.value);
    };

    const handleRemoveImage = () => {
        setFile(null);
        setImagePreview(null);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        if (!file) {
            toast.error(t('categoryUpload.selectImageError')); // Utiliser la traduction
            return;
        }

        try {
            await CategoryService.uploadImage(file, name);
            toast.success(t('categoryUpload.uploadSuccess')); // Utiliser la traduction
            setFile(null);
            setName('');
            setImagePreview(null);
        } catch (error) {
            toast.error(t('categoryUpload.uploadError', { error: error.message })); // Utiliser la traduction
        }
    };

    return (
        <div className="p-3">
            <ToastContainer />
            <div className="page-header">
                <div className="page-title">
                    <h4>{t('categoryUpload.addCategoryTitle')}</h4> {/* Utiliser la traduction */}
                    <h6>{t('categoryUpload.addCategorySubtitle')}</h6> {/* Utiliser la traduction */}
                </div>
            </div>
            <div className="card ml-3">
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        <h2 className="mb-4 text-center">{t('categoryUpload.newCategory')}</h2> {/* Utiliser la traduction */}
                        <div className="form-group mb-3">
                            <label htmlFor="categoryName">{t('categoryUpload.categoryName')}</label> {/* Utiliser la traduction */}
                            <input
                                type="text"
                                className="form-control"
                                id="categoryName"
                                placeholder={t('categoryUpload.categoryNamePlaceholder')} 
                                value={name}
                                onChange={onNameChange}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label htmlFor="categoryImage">{t('categoryUpload.categoryImage')}</label> {/* Utiliser la traduction */}
                            <div className="image-upload">
                                <input
                                    type="file"
                                    className="form-control"
                                    id="categoryImage"
                                    onChange={onFileChange}
                                    required
                                />
                                {imagePreview && (
                                    <div className="image-preview-container">
                                        <img src={imagePreview} alt={t('categoryUpload.previewAlt')} className="image-preview" /> {/* Utiliser la traduction */}
                                        <button
                                            type="button"
                                            className="btn-remove-image"
                                            onClick={handleRemoveImage}
                                        >
                                            {t('categoryUpload.removeImageButton')} {/* Utiliser la traduction */}
                                        </button>
                                    </div>
                                )}
                                {!imagePreview && (
                                    <div className="image-uploads">
                                        <img src="assets/img/icons/upload.svg" alt="img" />
                                        <h4>{t('categoryUpload.dragDropInstruction')}</h4> {/* Utiliser la traduction */}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">{t('categoryUpload.uploadButton')}</button> {/* Utiliser la traduction */}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CategoryUpload;
