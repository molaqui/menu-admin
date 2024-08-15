import React, { useEffect, useState } from 'react';
import { Search, Download, CheckCircle, Trash, HourglassSplit, Funnel } from 'react-bootstrap-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button } from 'react-bootstrap';
import './DeliveryOrders.css'; // Ensure this CSS file is styled to your liking
import OrderService from '../../Api/OrderService';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import AuthService from '../../Api/AuthService';
import Cookies from 'js-cookie';
const DeliveryOrders = () => {
  const { t } = useTranslation(); // Initialize useTranslation

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const itemsPerPage = 5;
  const [userInfo, setUser] = useState(null);


  useEffect(() => {
    const userId = Cookies.get("userId");
    if (userId) {
      fetchUserById(userId);

    }
  }, []);
  const fetchUserById = async (userId) => {
    try {
      const userData = await AuthService.getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur :", error);
    }
  };

  useEffect(() => {
    OrderService.getDeliveryOrders()
      .then((response) => setOrders(response.data))
      .catch((error) => console.error('Error:', error));
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter === '' || (statusFilter === 'completed' && order.status) || (statusFilter === 'pending' && !order.status)) &&
      (order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) => item.foodName.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  const getLanguageFromLocalStorage = () => {
    return localStorage.getItem('i18nextLng') || 'fr'; // Valeur par défaut en français
  };

  // Fonction pour obtenir la date actuelle formatée selon la langue
  const getFormattedDate = () => {
    const now = new Date();
    const language = getLanguageFromLocalStorage();

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    // Définir le format de date selon la langue
    switch (language) {
      case 'ar':
        // Format pour l'arabe
        options.localeMatcher = 'best fit';
        return now.toLocaleDateString('ar-EG', options);
      case 'zh':
        // Format pour le chinois
        return now.toLocaleDateString('zh-CN', options);
      case 'en':
        // Format pour l'anglais
        return now.toLocaleDateString('en-US', options);
      case 'fr':
      default:
        // Format pour le français par défaut
        return now.toLocaleDateString('fr-FR', options);
    }
  };
  const generatePDF = (order) => {
    const doc = new jsPDF();
    
  
  
    const logo = new Image();
    if (userInfo.logo) {
      const logoBase64 = `data:image/jpeg;base64,${userInfo.logo}`;
      logo.src = logoBase64;
    } else {
      logo.src = 'default-logo.png'; // Remplacez par le chemin du logo par défaut si aucune info de logo
    }
  
    logo.onload = () => {
      // Ajoutez le logo de l'utilisateur
      if (userInfo.logo) {
        doc.addImage(logo, 'PNG', 10, 20, 30, 30);
      }
  
      // Ajoutez les informations de l'utilisateur
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(17);
      doc.text(userInfo.storeName, 44, 26);
  
      doc.setFontSize(10);
      doc.setTextColor(70);
      doc.text(userInfo.city, 44, 34);
      doc.text(userInfo.phone, 44, 40);
      doc.text(userInfo.email, 44, 46);
  
      // Ajouter un titre d'énoncé
      doc.setFontSize(20);
      doc.setTextColor(70);
      doc.text(`${t('deliveryInvoice')}`, 150, 26);
  
      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(`${t('orderId')}: ${order.id}`, 160, 40);
      doc.text(`${t('deliveryAddress')}: ${order.customerAddress}`, 160, 48);
      
      // Ajouter la date actuelle formatée
      const formattedDate = getFormattedDate();
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Date: ${formattedDate}`, 160, 56); // Positionnez où vous voulez la date
  
      const columns = [
        { title: t('item'), dataKey: 'foodName' },
        { title: t('price'), dataKey: 'price' },
        { title: t('quantity'), dataKey: 'quantity' },
        { title: t('totalPerItem'), dataKey: 'amount' },
      ];
  
      // Préparer les lignes du tableau
      const rows = order.items.map((item) => ({
        foodName: item.foodName,
        price: item.price.toFixed(2),
        quantity: item.quantity,
        amount: (item.price * item.quantity).toFixed(2),
      }));
  
      // Ajouter le tableau
      doc.autoTable({
        head: [columns.map((col) => col.title)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        startY: 80, // Ajuster la position selon vos besoins
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { horizontal: 10 },
        styles: { overflow: 'linebreak', cellPadding: 3 },
        columnStyles: { description: { cellWidth: 'auto' } },
      });
  
      // Calculer le montant total
      const totalAmount = rows.reduce((acc, row) => acc + parseFloat(row.amount), 0).toFixed(2);
  
      // Ajouter une section pour le montant total
      const finalY = doc.autoTable.previous.finalY + 10;
  
      // Définir les dimensions, la position et le rayon des coins du rectangle de fond
      const backgroundWidth = 50; // Largeur du rectangle
      const backgroundHeight = 10; // Hauteur du rectangle
      const backgroundX = 140; // Position X pour le rectangle de fond
      const backgroundY = finalY - 6; // Position Y pour le rectangle de fond (ajusté pour centrer le texte)
      const borderRadius = 5; // Rayon des coins arrondis
  
      // Dessiner le rectangle avec des coins arrondis
      doc.setFillColor(41, 128, 185); // Couleur de fond
      doc.roundedRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight, borderRadius, borderRadius, 'F'); // Dessiner le rectangle avec coins arrondis
  
      // Ajouter le texte du montant total
      doc.setFontSize(12);
      doc.setTextColor(255); // Couleur du texte (blanc)
      doc.setFont('bold');
      doc.text(`${t('total')}: ${totalAmount} Dhs`, 180, finalY, { align: 'right' });
  
      // Ajouter des messages supplémentaires
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(t('tableOrders.thankYouMessage'), 10, finalY + 10);
  
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(t('tableOrders.visitAgainMessage'), 10, finalY + 20);
  
      doc.save(`Facture_Livraison_${order.id}.pdf`);
    };
  };
  

  const updateOrderStatus = (orderId, status) => {
    setLoadingStatus(orderId);
    OrderService.updateOrderStatus(orderId, status)
      .then((response) => {
        toast.success(t('statusUpdatedSuccess'));
        setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)));
        setLoadingStatus(null);
      })
      .catch((error) => {
        toast.error(t('statusUpdateError') + error.message);
        setLoadingStatus(null);
      });
  };

  const deleteOrder = (orderId) => {
    setShowModal(true);
    setOrderToDelete(orderId);
  };

  const confirmDeleteOrder = () => {
    OrderService.deleteOrder(orderToDelete)
      .then((response) => {
        toast.success(t('orderDeletedSuccess'));
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderToDelete));
        setShowModal(false);
        setOrderToDelete(null);
      })
      .catch((error) => {
        toast.error(t('orderDeleteError') + error.message);
        setShowModal(false);
        setOrderToDelete(null);
      });
  };

  return (
    <div className="content mt-5">
      <ToastContainer />
      <div className="page-header">
        <div className="page-title">
          <h4>{t('deliveryOrdersTitle')}</h4>
          <h6>{t('manageOrders')}</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-top">
            <div className="search-set">
              <div className="filter-container">
                <Funnel className="filter-icon" />
                <select className="filter-select" value={statusFilter} onChange={handleStatusFilterChange}>
                  <option value="">{t('allStatuses')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="completed">{t('completed')}</option>
                </select>
              </div>
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label={t('searchAriaLabel')}
                />
              </div>
            </div>
            <div className="wordset">
              <ul>
                <li>
                  <a href="javascript:void(0);" title={t('pdf')}>
                    <img src="assets/img/icons/pdf.svg" alt={t('pdf')} />
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);" title={t('excel')}>
                    <img src="assets/img/icons/excel.svg" alt={t('excel')} />
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);" title={t('print')}>
                    <img src="assets/img/icons/printer.svg" alt={t('print')} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-striped table-bordered datanew">
              <thead className="thead-custom">
                <tr>
                  <th>{t('customerName')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('address')}</th>
                  <th>{t('total')} (Dhs)</th>
                  <th>{t('items')}</th>
                  <th>{t('status')}</th>
                  <th>{t('invoice')}</th>
                  <th>{t('actions')}</th>
                  <th>{t('delete')}</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.customerName}</td>
                    <td>{order.customerPhone}</td>
                    <td>{order.customerAddress}</td>
                    <td>{order.total} Dhs</td>
                    <td>
                      <ul>
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.foodName} x <span className="quantity">{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      {order.status ? (
                        <span className="badge bg-success">{t('completed')}</span>
                      ) : (
                        <span className="badge bg-warning">{t('pending')}</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-primary" onClick={() => generatePDF(order)}>
                        <Download />
                      </button>
                    </td>
                    <td>
                      {!order.status && (
                        <button className="btn btn-success" onClick={() => updateOrderStatus(order.id, true)}>
                          {loadingStatus === order.id ? <HourglassSplit className="spinner-border spinner-border-sm" /> : <CheckCircle />}
                        </button>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-danger" onClick={() => deleteOrder(order.id)}>
                        <Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
          </div>

          <nav>
            <ul className="pagination justify-content-center">
              {Array.from({ length: Math.ceil(filteredOrders.length / itemsPerPage) }, (_, i) => (
                <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                  <button onClick={() => paginate(i + 1)} className="page-link">
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t('confirmDeleteMessage')}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={confirmDeleteOrder}>
            {t('delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeliveryOrders;
