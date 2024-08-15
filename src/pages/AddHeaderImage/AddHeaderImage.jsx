import React, { useState } from 'react';
import headerImageService from '../../Api/headerImageService';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

const AddHeaderImage = () => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bgImage, setBgImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
    if (!bgImage) {
      Swal.fire('Error', 'Please select a background image.', 'error');
      return;
    }
    try {
      const headerImageData = {
        title,
        subtitle,
        bgImage,
      };

      await headerImageService.saveHeaderImage(headerImageData, userId);
      Swal.fire('Success', 'Header image added successfully', 'success');
      setTitle('');
      setSubtitle('');
      setBgImage(null);
      setPreviewImage(null);
    } catch (error) {
      Swal.fire('Error', `Error adding header image: ${error.message}`, 'error');
    }
  };

  return (
    <div className="content mt-5">
      <ToastContainer />
      <div className="page-header">
        <div className="page-title">
          <h4>Add Header Image</h4>
          <h6>Create new header image entry</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-6 col-sm-12">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter title"
                  />
                </div>
              </div>
              <div className="col-lg-6 col-sm-12">
                <div className="form-group">
                  <label>Subtitle</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    required
                    placeholder="Enter subtitle"
                  />
                </div>
              </div>
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Background Image (1366x768)</label>
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
                        <img src="assets/img/icons/upload.svg" alt="Upload icon" />
                        <h4>Drag and drop a file to upload</h4>
                      </div>
                    )}
                    {previewImage && (
                      <div className="image-previews mt-3">
                        <div className="preview-container position-relative">
                          <img
                            src={previewImage}
                            alt="Preview"
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
                <button type="submit" className="btn btn-submit me-2">
                  Submit
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
