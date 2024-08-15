import React, { useState, useEffect } from 'react';
import ChefService from '../../Api/ChefService';
import { Modal, Button, Form, Spinner, Card } from 'react-bootstrap';
import Swal from 'sweetalert2';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import Bootstrap icons
import { useTranslation } from 'react-i18next'; // Import useTranslation
function ChefsList() {
  const [chefs, setChefs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);
  const [loadingId, setLoadingId] = useState(null); // Track loading for each action
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const { t } = useTranslation(); // Initialize useTranslation
  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    try {
      setLoadingId('fetch'); // Indicate loading state for fetch
      const data = await ChefService.getAllChefs();
      setChefs(data);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (chefId) => {
    Swal.fire({
      title: t('delete_confirmation.title'),
      text: t('delete_confirmation.text'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('delete_confirmation.confirm'),
      cancelButtonText: t('delete_confirmation.cancel'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoadingId(chefId); // Indicate loading state for the specific chef
        await ChefService.deleteChef(chefId);
        fetchChefs();
        Swal.fire(t('delete_success.title'), t('delete_success.text'), 'success');
      }
    });
  };

  const handleUpdateModal = (chef) => {
    setSelectedChef(chef);
    setPreviewImage(`data:image/jpeg;base64,${chef.image}`);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setPreviewImage(null);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setLoadingId(selectedChef.id);

    const formData = new FormData();
    formData.append('name', selectedChef.name);
    formData.append('designation', selectedChef.designation);
    formData.append('facebookUrl', selectedChef.facebookUrl);
    formData.append('twitterUrl', selectedChef.twitterUrl);
    formData.append('instagramUrl', selectedChef.instagramUrl);

    // Only append the image if it's new
    if (selectedChef.image instanceof File) {
      formData.append('image', selectedChef.image);
    }

    await ChefService.updateChef(selectedChef.id, formData);
    setIsUpdating(false);
    fetchChefs();
    setShowModal(false);
    Swal.fire(t('update_success.title'), t('update_success.text'), 'success');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedChef({ ...selectedChef, image: file }); // Use the file object
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container-xxl pt-5 pb-3">
      <div className="">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h5 className="section-title ff-secondary text-center text-primary fw-normal">{t('chefs_list.section_title')}</h5>
          <h1 className="mb-5">{t('chefs_list.heading')}</h1>
        </div>
        <div className="row g-3">
          {chefs.map((chef, index) => (
            <div key={chef.id} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 + index * 0.2}s`}>
              <Card className="text-center rounded overflow-hidden shadow-sm">
                <div className="rounded-circle overflow-hidden mx-auto mt-3" style={{ width: '282px', height: '300px', cursor: 'pointer' }}>
                  <img
                    className=""
                    src={`data:image/jpeg;base64,${chef.image}`}
                    alt={chef.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s'}}
                    onClick={() => handleUpdateModal(chef)}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
                <Card.Body>
                <Card.Title>{chef.name}</Card.Title>
                <Card.Text>{chef.designation}</Card.Text>
                  <div className="d-flex justify-content-center">
                    <Button variant="outline-primary" className="me-2" onClick={() => handleUpdateModal(chef)} title={t('chefs_list.update_button')}>
                      <i className="bi bi-pencil-square"></i> {t('chefs_list.update')}
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => handleDelete(chef.id)}
                      title="Delete"
                      disabled={loadingId === chef.id}
                    >
                      {loadingId === chef.id ? <Spinner animation="border" size="sm" /> : <i className="bi bi-trash"></i>} {t('chefs_list.delete')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
        <Modal.Title>{t('chefs_list.update_modal_title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedChef && (
            <Form onSubmit={handleSubmitUpdate}>
              <Form.Group className="mb-3">
              <Form.Label>{t('chefs_list.name')}</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={selectedChef.name}
                  onChange={(e) => setSelectedChef({ ...selectedChef, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label>{t('chefs_list.designation')}</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={selectedChef.designation}
                  onChange={(e) => setSelectedChef({ ...selectedChef, designation: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label>{t('chefs_list.facebook_url')}</Form.Label>
                <Form.Control
                  type="url"
                  defaultValue={selectedChef.facebookUrl}
                  onChange={(e) => setSelectedChef({ ...selectedChef, facebookUrl: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label>{t('chefs_list.instagram_url')}</Form.Label>
                <Form.Control
                  type="url"
                  defaultValue={selectedChef.instagramUrl}
                  onChange={(e) => setSelectedChef({ ...selectedChef, instagramUrl: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label>{t('chefs_list.image')}</Form.Label>
                <div>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      style={{ width: '150px', height: '150px', objectFit: 'cover', marginBottom: '10px', cursor: 'pointer', transition: 'transform 0.3s' }}
                      onClick={() => document.getElementById('imageInput').click()}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  )}
                </div>
                <Form.Control
                  type="file"
                  id="imageInput"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={isUpdating}>
                {isUpdating ? <Spinner animation="border" size="sm" /> :  t('chefs_list.save_changes')}
              </Button>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
          {t('chefs_list.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ChefsList;
