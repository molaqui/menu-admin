import React, { useState, useEffect } from 'react';
import locationService from '../../Api/LocationService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
const AddLocation = () => {
  const { t } = useTranslation();
  const [mapLink, setMapLink] = useState('');
  const userId = Cookies.get('userId'); // Ensure this returns a valid ID

  useEffect(() => {
    // Fetch existing location
    const fetchLocation = async () => {
      try {
        const location = await locationService.getLocationByUserId(userId);
        if (location) {
          setMapLink(location.mapLink);
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchLocation();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await locationService.saveLocation({ mapLink, userId });
      toast.success(t('location_added_successfully'));
      setMapLink('');
    } catch (error) {
      toast.error(t('error_adding_map_link') + ': ' + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
      <h2 className="mb-4 text-center">{t('add_map_link')}</h2>
        <div className="form-group mb-3">
          <label htmlFor="mapLink">{t('google_maps_embed_link')}</label>
          <input
            type="text"
            className="form-control"
            id="mapLink"
            value={mapLink}
            onChange={(e) => setMapLink(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">{t('add_location')}</button>
      </form>
    </div>
  );
};

export default AddLocation;
