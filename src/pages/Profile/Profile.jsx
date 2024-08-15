import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import userService from '../../Api/AuthService';
import './Profile.css';
import { useTranslation } from 'react-i18next';
const Profile = () => {
  const { t } = useTranslation(); // Initialiser useTranslation
  const [user, setUser] = useState(null);
  const [logo, setLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    storeName: '',
    password: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userId = Cookies.get('userId');
      if (userId) {
        try {
          const userData = await userService.getUserById(userId);
          setUser(userData);
          setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            storeName: userData.storeName,
            password: userData.password,
          });

          const logoResponse = await userService.getLogo(userId);
          setLogo(URL.createObjectURL(logoResponse.data));
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.error('No user ID found in cookie');
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setPreviewLogo(URL.createObjectURL(file));
    setLogo(file);
  };

  const handleUpdate = async () => {
    const userId = Cookies.get('userId');
    try {
      await userService.updateUser(userId, formData, logo);
      Swal.fire(t('profile.update_success'), '', 'success');
    } catch (error) {
      Swal.fire(t('profile.update_error'), '', 'error');
    }
  };

  if (!user) return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="page-header">
        <h4 className="page-title">{t('profile.title')}</h4>
        <h6 className="page-subtitle">{t('profile.subtitle')}</h6>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={previewLogo || logo || 'assets/img/customer/customer5.jpg'}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-upload">
              <input type="file" id="imgInp" className="upload-input" onChange={handleLogoChange} />
              <label htmlFor="imgInp" className="upload-label">
                <img src="assets/img/icons/edit-set.svg" alt="Edit" />
              </label>
            </div>
          </div>
          <div className="profile-info">
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{t('profile.update_details')}</p>
          </div>
        </div>

        <div className="profile-body">
          <div className="form-row">
            <div className="form-group">
            <label>{t('profile.first_name')}</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
            <label>{t('profile.last_name')}</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
            <label>{t('profile.email')}</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
            </div>
            <div className="form-group">
            <label>{t('profile.phone')}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
            <label>{t('profile.store_name')}</label>
              <input type="text" name="storeName" value={formData.storeName} onChange={handleInputChange} />
            </div>
            <div className="form-group">
            <label>{t('profile.password')}</label>
              <div className="password-group">
                <input type="password" name="password" className="pass-input" value={formData.password} onChange={handleInputChange} />
                <span className="toggle-password fas fa-eye-slash"></span>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-submit" onClick={handleUpdate}>{t('profile.submit')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
