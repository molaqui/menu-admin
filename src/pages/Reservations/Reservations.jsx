import React, { useEffect, useState } from 'react';
import { Search, PencilSquare, Trash } from 'react-bootstrap-icons';
import { Modal, Button, Form } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReservationService from '../../Api/ReservationService';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import './Reservations.css';

const Reservations = () => {
  const { t } = useTranslation(); // Pour accéder aux traductions
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    const userId = Cookies.get('userId');
    ReservationService.getAllReservations(userId)
      .then((response) => setReservations(response.data))
      .catch((error) => console.error('Error fetching reservations:', error));
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredReservations = reservations.filter((reservation) =>
    reservation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleShowModal = (reservation) => {
    setCurrentReservation(reservation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setCurrentReservation(null);
    setShowModal(false);
  };

  const handleShowDeleteModal = (reservation) => {
    setCurrentReservation(reservation);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setCurrentReservation(null);
    setShowDeleteModal(false);
  };

  const handleUpdateReservation = (e) => {
    e.preventDefault();
    const userId = Cookies.get('userId');
    ReservationService.updateReservation(currentReservation.id, currentReservation, userId)
      .then((response) => {
        toast.success(t('reservation.successUpdate'));
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation.id === currentReservation.id ? response.data : reservation
          )
        );
        handleCloseModal();
      })
      .catch((error) => {
        toast.error(t('reservation.errorUpdate') + error.message);
      });
  };

  const handleDeleteReservation = () => {
    const userId = Cookies.get('userId');
    ReservationService.deleteReservation(currentReservation.id, userId)
      .then((response) => {
        toast.success(t('reservation.successDelete'));
        setReservations((prevReservations) =>
          prevReservations.filter((reservation) => reservation.id !== currentReservation.id)
        );
        handleCloseDeleteModal();
      })
      .catch((error) => {
        toast.error(t('reservation.errorDelete') + error.message);
      });
  };

  return (
    <div className="content mt-5">
      <ToastContainer />
      <div className="page-header">
        <div className="page-title">
          <h4>{t('reservation.title')}</h4>
          <h6>{t('reservation.manage')}</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-top">
            <div className="search-set">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('reservation.searchPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label={t('reservation.searchAriaLabel')}
                />
              </div>
            </div>
          </div>

          {reservations.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover table-striped table-bordered datanew">
                  <thead className="thead-custom">
                    <tr>
                      <th>{t('reservation.name')}</th>
                      <th>{t('reservation.phone')}</th>
                      <th>{t('reservation.datetime')}</th>
                      <th>{t('reservation.numberOfPeople')}</th>
                      <th>{t('reservation.message')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>{reservation.name}</td>
                        <td>{reservation.phone}</td>
                        <td>{reservation.datetime}</td>
                        <td>{reservation.numberOfPeople}</td>
                        <td>{reservation.message}</td>
                        <td>
                          <div className="d-flex">
                            <button className="btn btn-primary me-2" onClick={() => handleShowModal(reservation)}>
                              <PencilSquare />
                            </button>
                            <button className="btn btn-danger" onClick={() => handleShowDeleteModal(reservation)}>
                              <Trash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <br />
              </div>

              <nav>
                <ul className="pagination justify-content-center">
                  {Array.from({ length: Math.ceil(filteredReservations.length / itemsPerPage) }, (_, i) => (
                    <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                      <button onClick={() => paginate(i + 1)} className="page-link">
                        {i + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          ) : (
            <p className="text-center">{t('reservation.noReservations')}</p>
          )}

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>{t('reservation.edit')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdateReservation}>
                <Form.Group controlId="formName">
                  <Form.Label>{t('reservation.name')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentReservation?.name || ''}
                    onChange={(e) => setCurrentReservation({ ...currentReservation, name: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formPhone">
                  <Form.Label>{t('reservation.phone')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentReservation?.phone || ''}
                    onChange={(e) => setCurrentReservation({ ...currentReservation, phone: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formDatetime">
                  <Form.Label>{t('reservation.datetime')}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={currentReservation?.datetime || ''}
                    onChange={(e) => setCurrentReservation({ ...currentReservation, datetime: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formNumberOfPeople">
                  <Form.Label>{t('reservation.numberOfPeople')}</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentReservation?.numberOfPeople || ''}
                    onChange={(e) => setCurrentReservation({ ...currentReservation, numberOfPeople: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="formMessage">
                  <Form.Label>{t('reservation.message')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={currentReservation?.message || ''}
                    onChange={(e) => setCurrentReservation({ ...currentReservation, message: e.target.value })}
                  />
                </Form.Group>
                <br />
                <Button variant="primary" type="submit">
                  {t('reservation.save')}
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>{t('reservation.confirmDeleteTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{t('reservation.confirmDeleteMessage')}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseDeleteModal}>
                {t('reservation.cancel')}
              </Button>
              <Button variant="danger" onClick={handleDeleteReservation}>
                {t('reservation.delete')}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
