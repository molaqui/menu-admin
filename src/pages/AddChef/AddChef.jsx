import React, { useState } from 'react';
import chefService from '../../Api/ChefService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'react-i18next';

const AddChef = () => {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const { t } = useTranslation();
  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const options = {
          maxSizeMB: 1, // Max size in MB
          maxWidthOrHeight: 531, // Adjusts to the required height
          useWebWorker: true,
        };

        // Compress the image
        const compressedFile = await imageCompression(file, options);

        // Adjust the aspect ratio and resize to 413x531
        const resizedFile = await resizeImage(compressedFile, 413, 520);

        setImage(resizedFile);

        // Create a preview URL for the image
        setImagePreview(URL.createObjectURL(resizedFile));
      } catch (error) {
        console.error('Error compressing or resizing the image:', error);
        toast.error('Error processing image');
      }
    }
  };

  const resizeImage = (file, targetWidth, targetHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scaleFactor = Math.min(targetWidth / img.width, targetHeight / img.height);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(img, 0, 0, img.width * scaleFactor, img.height * scaleFactor);
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: file.type }));
          },
          file.type,
          0.8 // Control the quality of the output image
        );
      };

      img.onerror = (error) => {
        reject(new Error('Image loading or resizing failed: ' + error.message));
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error(t('errors.no_image'));
      return;
    }
    try {
      const chefData = {
        name,
        designation,
        image,
        facebookUrl,
        instagramUrl,
      };

      await chefService.saveChef(chefData);
      toast.success(t('success.chef_added'));
      setName('');
      setDesignation('');
      setImage(null);
      setImagePreview(null);
      setFacebookUrl('');
      setInstagramUrl('');
    } catch (error) {
      toast.error(t('errors.adding_chef') + ': ' + error.message);
    }
  };


  return (
    <div className="content">
      <ToastContainer />
      <div className="page-header">
        <div className="page-title">
        <h4>{t('add_chef.title')}</h4>
        <h6>{t('add_chef.description')}</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="name">{t('add_chef.name')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="designation">{t('add_chef.designation')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="facebookUrl">{t('add_chef.facebook_url')}</label>
                  <input
                    type="url"
                    className="form-control"
                    id="facebookUrl"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 col-12">
                <div className="form-group">
                <label htmlFor="instagramUrl">{t('add_chef.instagram_url')}</label>
                  <input
                    type="url"
                    className="form-control"
                    id="instagramUrl"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form-group">
                <label htmlFor="image">{t('add_chef.header_image')}</label>
                  <div className="image-upload">
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      onChange={handleImageChange}
                      required
                    />
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100% !important', height: 'auto' }} />
                      
                      </div>
                    )}
                    {!imagePreview && (
                      <div className="image-uploads">
                        <img src="assets/img/icons/upload.svg" alt="img" />
                        <h4>{t('add_chef.drag_and_drop')}</h4>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
              <button type="submit" className="btn btn-submit me-2">{t('add_chef.submit')}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChef;
