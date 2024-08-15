import React, { useState, useEffect } from 'react';
import AboutService from '../../Api/AboutService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importation de sweetalert2
import './UpdateAbout.css';
import { useTranslation } from 'react-i18next';
const UpdateAbout = () => {
  const { t } = useTranslation();
  const [aboutData, setAboutData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await AboutService.getAbout();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchAboutData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviews((prevPreviews) => ({
          ...prevPreviews,
          [name]: event.target.result,
        }));
      };
      reader.readAsDataURL(file);

      resizeImage(file, 400, 400, (resizedBlob) => {
        setAboutData((prevData) => ({
          ...prevData,
          [name]: resizedBlob,
        }));
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

  const handleSaveClick = async () => {
    try {
      await AboutService.updateAbout(aboutData);
      setIsEditing(false);
      toast.success(t('about_section_updated_successfully'));
    } catch (error) {
      toast.error(t('error_updating_about_section', { message: error.message }));
    }
  };

  const handleDeleteAllClick = () => {
    Swal.fire({
      title: t('confirmation'),
      text: t('delete_all_confirmation_text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('yes_delete'),
      cancelButtonText: t('cancel'),
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllAboutData();
      }
    });
  };

  const deleteAllAboutData = async () => {
    try {
      await AboutService.deleteAllAbout();
      setAboutData(null);
      Swal.fire({
        title: t('deleted'),
        text: t('about_section_deleted_successfully'),
        icon: 'success',
        confirmButtonText: t('ok'),
      });
    } catch (error) {
      Swal.fire({
        title: t('error'),
        text: t('error_deleting_about_section', { message: error.message }),
        icon: 'error',
        confirmButtonText: t('ok'),
      });
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setImagePreviews({});
  };

  if (!aboutData) {
    return null;
  }

  return (
    <div className="container-xxl py-5">
      <ToastContainer />
      <div className="">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <div className="row g-3">
              <div className="col-6 text-start">
                <img
                  className="img-fluid rounded w-100 wow zoomIn about-image"
                  data-wow-delay="0.1s"
                  src={imagePreviews.image1 || `data:image/jpeg;base64,${aboutData.image1}`}
                  alt="About 1"
                />
                {isEditing && (
                  <input type="file" name="image1" onChange={handleImageChange} />
                )}
              </div>
              <div className="col-6 text-start">
                <img
                  className="img-fluid rounded w-75 wow zoomIn about-image"
                  data-wow-delay="0.3s"
                  src={imagePreviews.image2 || `data:image/jpeg;base64,${aboutData.image2}`}
                  style={{ marginTop: '25%' }}
                  alt="About 2"
                />
                {isEditing && (
                  <input type="file" name="image2" onChange={handleImageChange} />
                )}
              </div>
              <div className="col-6 text-end">
                <img
                  className="img-fluid rounded w-75 wow zoomIn about-image"
                  data-wow-delay="0.5s"
                  src={imagePreviews.image3 || `data:image/jpeg;base64,${aboutData.image3}`}
                  alt="About 3"
                />
                {isEditing && (
                  <input type="file" name="image3" onChange={handleImageChange} />
                )}
              </div>
              <div className="col-6 text-end">
                <img
                  className="img-fluid rounded w-100 wow zoomIn about-image"
                  data-wow-delay="0.7s"
                  src={imagePreviews.image4 || `data:image/jpeg;base64,${aboutData.image4}`}
                  alt="About 4"
                />
                {isEditing && (
                  <input type="file" name="image4" onChange={handleImageChange} />
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            {isEditing ? (
              <>
                <textarea
                  name="description"
                  className="form-control mb-3"
                  value={aboutData.description}
                  onChange={handleInputChange}
                  placeholder={t('description')}
                />
                <input
                  type="number"
                  name="yearsOfExperience"
                  className="form-control mb-3"
                  value={aboutData.yearsOfExperience}
                  onChange={handleInputChange}
                  placeholder={t('years_of_experience')}
                />
                <input
                  type="number"
                  name="numberOfChefs"
                  className="form-control mb-3"
                  value={aboutData.numberOfChefs}
                  onChange={handleInputChange}
                  placeholder={t('number_of_chefs')}
                />
                <div className="d-flex justify-content-between">
                  <button className="btn btn-primary" onClick={handleSaveClick}>
                    {t('save')}
                  </button>
                  <button className="btn btn-secondary" onClick={handleCancelClick}>
                    {t('cancel')}
                  </button>
                </div>

              </>
            ) : (
              <>
                <h1 className="ff-secondary text-start text-primary fw-normal mb-5">
                {t('about_us')}
                </h1>
                <div className="row g-4 mb-4">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center border-start border-5 border-primary px-3">
                      <h1 className="flex-shrink-0 display-5 text-primary mb-0" data-toggle="counter-up">{aboutData.yearsOfExperience}</h1>
                      <div className="ps-4">
                      <p className="mb-0">{t('years_of')}</p>
                      <h6 className="text-uppercase mb-0">{t('experience')}</h6>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center border-start border-5 border-primary px-3">
                      <h1 className="flex-shrink-0 display-5 text-primary mb-0" data-toggle="counter-up">{aboutData.numberOfChefs}</h1>
                      <div className="ps-4">
                      <p className="mb-0">{t('popular')}</p>
                      <h6 className="text-uppercase mb-0">{t('master_chefs')}</h6>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary me-2" onClick={handleEditClick}>
                <FontAwesomeIcon icon={faEdit} /> {t('edit')}
                </button>
                <br />
              </>
            )}
            <br />
            <button className="btn btn-danger me-2" onClick={handleDeleteAllClick}>
            <FontAwesomeIcon icon={faTrash} /> {t('delete_all')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateAbout;
