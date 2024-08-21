import React, { useState, useEffect } from 'react';
import AboutService from '../../Api/AboutService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddAbout.css'; // Assurez-vous d'importer le fichier CSS personnalisé
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';
const AddAbout = () => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [numberOfChefs, setNumberOfChefs] = useState(0);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // État pour le chargement

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await AboutService.getAbout();
        if (data) {
          setDescription(data.description);
          setYearsOfExperience(data.yearsOfExperience);
          setNumberOfChefs(data.numberOfChefs);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchAboutData();
  }, []);

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, 400, 400, (resizedBlob) => {
        setImage(resizedBlob);
      });
    }
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
        canvas.toBlob(callback, file.type, 0.7);
      };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Début du chargement
    try {
      const aboutData = {
        description,
        yearsOfExperience,
        numberOfChefs
      };

      const images = {
        image1,
        image2,
        image3,
        image4
      };

      await AboutService.saveAbout(aboutData, images);
      setIsLoading(false); // Fin du chargement
      toast.success(t('about_section_updated_successfully'));
    } catch (error) {
      setIsLoading(false); // Fin du chargement
      toast.error(t('error_updating_about_section', { message: error.message }));
    }
  };

  const handleRemoveImage = (setImage) => {
    setImage(null);
  };

  const renderImagePreview = (image, setImage) => {
    if (image) {
      return (
        <div className="image-preview">
          <img src={URL.createObjectURL(image)} alt="Preview" />
          <button type="button" className="remove-btn" onClick={() => handleRemoveImage(setImage)}>
            ✕
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="content">
      <ToastContainer />
      <div className="page-header">
        <div className="page-title">
        <h4>{t('add_about_section')}</h4>
        <h6>{t('create_or_update_about_section')}</h6>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Première ligne */}
              <div className="col-lg-4 col-sm-12">
                <div className="form-group">
                <label htmlFor="description">{t('description')}</label>
                  <textarea
                    className="form-control"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="col-lg-4 col-sm-12">
                <div className="form-group">
                <label htmlFor="yearsOfExperience">{t('years_of_experience')}</label>
                  <input
                    type="number"
                    className="form-control"
                    id="yearsOfExperience"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-lg-4 col-sm-12">
                <div className="form-group">
                <label htmlFor="numberOfChefs">{t('number_of_chefs')}</label>
                  <input
                    type="number"
                    className="form-control"
                    id="numberOfChefs"
                    value={numberOfChefs}
                    onChange={(e) => setNumberOfChefs(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Deuxième ligne */}
              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="image1">{t('image_1')}</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      className="form-control file-input"
                      id="image1"
                      onChange={(e) => handleImageChange(e, setImage1)}
                      required
                    />
                    <div className="image-uploads">
                      <img src="assets/img/icons/upload.svg" alt="Upload icon" />
                      <h6>{t('drag_and_drop_file')}</h6>
                    </div>
                  </div>
                  {renderImagePreview(image1, setImage1)}
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="image2">{t('image_2')}</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      className="form-control file-input"
                      id="image2"
                      onChange={(e) => handleImageChange(e, setImage2)}
                      required
                    />
                    <div className="image-uploads">
                      <img src="assets/img/icons/upload.svg" alt="Upload icon" />
                      <h6>{t('drag_and_drop_file')}</h6>
                    </div>
                  </div>
                  {renderImagePreview(image2, setImage2)}
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="image3">{t('image_3')}</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      className="form-control file-input"
                      id="image3"
                      onChange={(e) => handleImageChange(e, setImage3)}
                      required
                    />
                    <div className="image-uploads">
                      <img src="assets/img/icons/upload.svg" alt="Upload icon" />
                      <h6>{t('drag_and_drop_file')}</h6>
                    </div>
                  </div>
                  {renderImagePreview(image3, setImage3)}
                </div>
              </div>

              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="image4">{t('image_4')}</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      className="form-control file-input"
                      id="image4"
                      onChange={(e) => handleImageChange(e, setImage4)}
                      required
                    />
                    <div className="image-uploads">
                      <img src="assets/img/icons/upload.svg" alt="Upload icon" />
                      <h6>{t('drag_and_drop_file')}</h6>
                    </div>
                  </div>
                  {renderImagePreview(image4, setImage4)}
                </div>
              </div>

              <div className="col-lg-12">
                <button type="submit" className="btn btn-submit me-2" disabled={isLoading}>
                {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
                  t('submit')
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

export default AddAbout;
