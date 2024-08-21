import React, { useState, useEffect } from 'react';
import locationService from '../../Api/LocationService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { Card, Spinner, Button, Modal } from 'react-bootstrap';

import './AddLocation.css'; // Custom CSS for styling

const AddLocation = () => {
  const { t } = useTranslation();
  const [mapLink, setMapLink] = useState('');
  const userId = Cookies.get('userId'); // Ensure this returns a valid ID
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    setIsLoading(true);
    try {
      await locationService.saveLocation({ mapLink, userId });
      setIsLoading(false); // Fin du chargement
      toast.success(t('location_added_successfully'));
      setMapLink('');
    } catch (error) {
      setIsLoading(false); // Fin du chargement
      toast.error(t('error_adding_map_link') + ': ' + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <Card className="mb-4 shadow-sm custom-card">
        <Card.Body>
          <h2 className="mb-4 text-center">{t('add_map_link')}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="mapLink">{t('google_maps_embed_link')}</label>
              <input
                type="text"
                className="form-control custom-input"
                id="mapLink"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn custom-add-button w-10" disabled={isLoading}>
              {isLoading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              ) : (
                t('add_location')
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            <Button className="play-video-btn" onClick={() => setShowModal(true)}>
              &#9658; {t('how_to_add_location')}
            </Button>
          </div>
        </Card.Body>
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('how_to_add_location')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="embed-responsive embed-responsive-16by9">
            <iframe
              className="embed-responsive-item"
              width="100%"
              height="600"
              src="https://www.youtube.com/embed/ZYhFXjM3nMY?si=YLeeB7iqFmHXePsL"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AddLocation;