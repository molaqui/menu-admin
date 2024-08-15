import React, { useEffect, useState } from 'react';
import { Search, Download, CheckCircle, Trash, HourglassSplit, Funnel } from 'react-bootstrap-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button } from 'react-bootstrap';
import './TableOrders.css';
import OrderService from '../../Api/OrderService';
import AuthService from '../../Api/AuthService';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
const TableOrders = () => {
  const { t } = useTranslation(); // Ajoutez cette ligne
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const itemsPerPage = 5;
  const [userInfo, setUser] = useState(null);

  // Récupérer l'utilisateur au chargement du composant
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
    const fetchOrders = async () => {
      try {
        const response = await OrderService.getTableOrders();
        setOrders(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchOrders();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const filteredOrders = orders.filter((order) =>
    (statusFilter === '' || (statusFilter === 'completed' && order.status) || (statusFilter === 'pending' && !order.status)) &&
    (order.tableNumber.toString().includes(searchTerm.toLowerCase()) ||
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
    if (userInfo && userInfo.logo) {
      const logoBase64 = `data:image/jpeg;base64,${userInfo.logo}`;
      logo.src = logoBase64;
    }

    logo.onload = () => {
      if (userInfo && userInfo.logo) {
        doc.addImage(logo, 'PNG', 10, 20, 30, 30); // Utilisez le logo de l'utilisateur
      }

      // Ajoutez ici la vérification de la langue
      console.log('Invoice Title:', t('tableOrders.invoiceTitle'));

      doc.setFont('lato');
      doc.setFontSize(17);
      doc.text(userInfo?.storeName, 44, 26);
   

      doc.setFontSize(10);
      doc.setTextColor(70);
      doc.text(userInfo?.city, 44, 34);
      doc.text(userInfo?.phone, 44, 40);
      doc.text(userInfo?.email, 44, 46);
     

      doc.setFontSize(20);
      doc.setTextColor(70);
      doc.text(`${t('tableOrders.invoiceTitle')}`, 150, 26);

      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(`${t('tableOrders.orderId')}: ${order.id}`, 156, 40);
      doc.text(`${t('tableOrders.tableNumber')}: ${order.tableNumber}`, 156, 48);
      

      // Ajouter la date actuelle formatée
      const formattedDate = getFormattedDate();
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`Date: ${formattedDate}`, 156, 56); // Positionnez où vous voulez la date

      const columns = [
        { title: t('tableOrders.item'), dataKey: 'foodName' },
        { title: t('tableOrders.price'), dataKey: 'price' },
        { title: t('tableOrders.quantity'), dataKey: 'quantity' },
        { title: t('tableOrders.totalPerItem'), dataKey: 'amount' },
      ];

      const rows = order.items.map((item) => ({
        foodName: item.foodName,
        price: item.price.toFixed(2),
        quantity: item.quantity,
        amount: (item.price * item.quantity).toFixed(2),
      }));
      
      doc.autoTable({
        head: [columns.map((col) => col.title)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        startY: 90,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { horizontal: 10 },
        styles: { overflow: 'linebreak', cellPadding: 3 },
        columnStyles: { description: { cellWidth: 'auto' } },
      });
      
      // Calculer le montant total
      const totalAmount = rows.reduce((acc, row) => acc + parseFloat(row.amount), 0).toFixed(2);
      
      const finalY = doc.autoTable.previous.finalY + 12;
      
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
      doc.text(`${t('tableOrders.total')}: ${totalAmount} Dhs`, 180, finalY, { align: 'right' });
      
      // Ajouter les autres messages
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(t('tableOrders.thankYouMessage'), 10, finalY + 10);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(t('tableOrders.visitAgainMessage'), 10, finalY + 20);
      
      doc.save(`Facture_Table_${order.tableNumber}.pdf`);
      
    };
  };



  const updateOrderStatus = async (orderId, status) => {
    setLoadingStatus(orderId);
    try {
      await OrderService.updateOrderStatus(orderId, status);
      toast.success(t('tableOrders.orderStatusUpdatedSuccess'));
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === orderId ? { ...order, status } : order)));
    } catch (error) {
      toast.error(t('tableOrders.orderStatusUpdateError') + error.message);
    } finally {
      setLoadingStatus(null);
    }
  };

  const deleteOrder = (orderId) => {
    setShowModal(true);
    setOrderToDelete(orderId);
  };

  const confirmDeleteOrder = async () => {
    try {
      await OrderService.deleteOrder(orderToDelete);
      toast.success(t('tableOrders.orderDeletedSuccess'));
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderToDelete));
    } catch (error) {
      toast.error(t('tableOrders.orderDeleteError') + error.message);
    } finally {
      setShowModal(false);
      setOrderToDelete(null);
    }
  };

  return (
    <div className="content mt-5">
      <ToastContainer />
      <div className="page-header">
        <div className="page-title">
          <h4>{t('tableOrders.pageTitle')}</h4>
          <h6>{t('tableOrders.pageSubtitle')}</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-top">
            <div className="search-set">
              <div className="filter-container">
                <Funnel className="filter-icon" />
                <select className="filter-select" value={statusFilter} onChange={handleStatusFilterChange}>
                  <option value="">{t('tableOrders.allStatuses')}</option>
                  <option value="pending">{t('tableOrders.pending')}</option>
                  <option value="completed">{t('tableOrders.completed')}</option>
                </select>
              </div>
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('tableOrders.searchPlaceholder')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label={t('tableOrders.searchAriaLabel')}
                />
              </div>
            </div>
            <div className="wordset">
              <ul>
                <li>
                  <a href="javascript:void(0);" title={t('tableOrders.pdfTitle')}>
                    <img src="assets/img/icons/pdf.svg" alt={t('tableOrders.pdfAlt')} />
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);" title={t('tableOrders.excelTitle')}>
                    <img src="assets/img/icons/excel.svg" alt={t('tableOrders.excelAlt')} />
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0);" title={t('tableOrders.printTitle')}>
                    <img src="assets/img/icons/printer.svg" alt={t('tableOrders.printAlt')} />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {orders.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover table-striped table-bordered datanew">
                  <thead className="thead-custom">
                    <tr>
                      <th>{t('tableOrders.table')}</th>
                      <th>{t('tableOrders.total')}</th>
                      <th>{t('tableOrders.items')}</th>
                      <th>{t('tableOrders.status')}</th>
                      <th>{t('tableOrders.invoice')}</th>
                      <th>{t('tableOrders.actions')}</th>
                      <th>{t('tableOrders.delete')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.tableNumber}</td>
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
                            <span className="badge bg-success">{t('tableOrders.completed')}</span>
                          ) : (
                            <span className="badge bg-warning">{t('tableOrders.pending')}</span>
                          )}
                        </td>
                        <td>
                          <button className="btn btn-primary" onClick={() => generatePDF(order)}>
                            <Download />
                          </button>
                        </td>
                        <td>
                          {!order.status && (
                            <button
                              className="btn btn-success"
                              onClick={() => updateOrderStatus(order.id, true)}
                              disabled={loadingStatus === order.id}
                            >
                              {loadingStatus === order.id ? <HourglassSplit /> : <CheckCircle />}
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
            </>
          ) : (
            <p className="text-center">{t('tableOrders.noOrdersFound')}</p>
          )}

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{t('tableOrders.confirmDeleteTitle')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{t('tableOrders.confirmDeleteMessage')}</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                {t('tableOrders.cancel')}
              </Button>
              <Button variant="danger" onClick={confirmDeleteOrder}>
                {t('tableOrders.delete')}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default TableOrders;
