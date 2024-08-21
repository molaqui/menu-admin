import React, { useState } from 'react';
import headerImageService from '../../Api/headerImageService';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';

const AddHeaderImage = () => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bgImage, setBgImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement

  const userId = Cookies.get('userId');

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, 1366, 768, (resizedBlob) => {
        setBgImage(resizedBlob);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const resizeImage = (file, width, height, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(callback, file.type, 0.7);
      };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Début du chargement
    if (!bgImage) {
      Swal.fire('Error', t('error.noImageSelected'), 'error');
      return;
    }
    try {
      const headerImageData = {
        title,
        subtitle,
        bgImage,
      };

      await headerImageService.saveHeaderImage(headerImageData, userId);
      setIsLoading(false); // Fin du chargement
      Swal.fire('Success', t('success.imageAdded'), 'success');
      setTitle('');
      setSubtitle('');
      setBgImage(null);
      setPreviewImage(null);
    } catch (error) {
      setIsLoading(false); // Fin du chargement
      Swal.fire('Error', `${t('error.imageAdd')} ${error.message}`, 'error');
    }
  };

  return (
    <div className="content mt-5">
      <ToastContainer />
      <div className="page-header">
        <div className="page-title">
          <h4>{t('addHeaderImage.pageTitle')}</h4>
          <h6>{t('addHeaderImage.pageSubtitle')}</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-6 col-sm-12">
                <div className="form-group">
                  <label>{t('addHeaderImage.titleLabel')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder={t('addHeaderImage.titlePlaceholder')}
                  />
                </div>
              </div>
              <div className="col-lg-6 col-sm-12">
                <div className="form-group">
                  <label>{t('addHeaderImage.subtitleLabel')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    required
                    placeholder={t('addHeaderImage.subtitlePlaceholder')}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form-group">
                  <label>{t('addHeaderImage.bgImageLabel')}</label>
                  <div className="image-upload position-relative">
                    <input
                      type="file"
                      className="form-control"
                      id="bgImage"
                      name="bgImage"
                      onChange={handleBgImageChange}
                      accept="image/*"
                      required
                    />
                    {!previewImage && (
                      <div className="image-uploads text-center">
                        <img src="assets/img/icons/upload.svg" alt={t('addHeaderImage.uploadIconAlt')} />
                        <h4>{t('addHeaderImage.uploadText')}</h4>
                      </div>
                    )}
                    {previewImage && (
                      <div className="image-previews mt-3">
                        <div className="preview-container position-relative">
                          <img
                            src={previewImage}
                            alt={t('addHeaderImage.previewAlt')}
                            className="preview-image img-thumbnail"
                            style={{ width: '100%', height: 'auto', maxHeight: '300px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-remove-image position-absolute top-0 end-0"
                            onClick={() => {
                              setBgImage(null);
                              setPreviewImage(null);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="d-flex col-lg-12">
                <button type="submit" className="btn btn-submit me-2" disabled={isLoading}>
                {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                  t('addHeaderImage.submitButton')
                )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddHeaderImage;
