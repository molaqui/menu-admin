import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Sidebar.css';
import tokenService from '../../Api/tokenService';
import { useTranslation } from 'react-i18next';
import reservationService from '../../Api/ReservationService';
import orderService from '../../Api/OrderService';
import messageService from '../../Api/MessageService';
import Cookies from 'js-cookie';
import {
  faTachometerAlt,
  faTags,
  faBox,
  faQrcode,
  faImage,
  faUserCheck,
  faInfoCircle,
  faMapMarkedAlt,
  faExternalLinkAlt,
  faEnvelope,
  faClipboardList,
  faTruck,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';

function Sidebar({ isOpen, toggleSidebar }) {
  const { t } = useTranslation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const navigate = useNavigate();

  const [tableOrderCount, setTableOrderCount] = useState(0);
  const [deliveryOrderCount, setDeliveryOrderCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const fetchCounts = async () => {
    try {
      const userId = Cookies.get('userId'); // Assurez-vous que l'ID utilisateur est correctement récupéré

      const [tableOrders, deliveryOrders, reservations, messages] = await Promise.all([
        orderService.countTableOrders(),
        orderService.countDeliveryOrders(),
        reservationService.countReservationsByUserId(),
        messageService.countMessagesByUserId(userId)
      ]);

      setTableOrderCount(tableOrders?.data || 0);
      setDeliveryOrderCount(deliveryOrders?.data || 0);
      setReservationCount(reservations?.data || 0);
      setMessageCount(messages || 0);
    } catch (error) {
      console.error('Error fetching counts', error);
    }
  };

  useEffect(() => {
    const fetchWebsiteUrl = async () => {
      try {
        const url = await tokenService.getWebsiteUrl();
        setWebsiteUrl(url);
      } catch (error) {
        console.error('Error fetching website URL', error);
      }
    };

    fetchWebsiteUrl();
    fetchCounts(); // Initial fetch

    const intervalId = setInterval(fetchCounts, 30000); // Polling every 30 seconds
    console.log("envoiiiii");
    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  const handleVisitWebsite = () => {
    if (websiteUrl) {
      window.open(websiteUrl, '_blank');
    } else {
      alert(t('sidebar.websiteUrlNotAvailable'));
    }
  };

  const toggleSubmenu = (submenu) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  return (
    <div className={`sidebar bg-white ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sidebar-inner slimscroll">
        <div id="sidebar-menu" className="sidebar-menu">
          <ul>
            <li>
              <NavLink to="/" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faTachometerAlt} className="fa-icon" alt={t('sidebar.dashboard')} />
                <span>{t('sidebar.dashboard')}</span>
              </NavLink>
            </li>
            <li className={`submenu ${activeSubmenu === 'categories' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleSubmenu('categories')}>
                <FontAwesomeIcon icon={faTags} className="fa-icon" alt={t('sidebar.categories')} />
                <span>{t('sidebar.categories')}</span>
                <span className="menu-arrow"></span>
              </a>
              <ul className={`submenu-list ${activeSubmenu === 'categories' ? 'd-block' : 'd-none'}`}>
                <li>
                  <NavLink to="/add-category" onClick={toggleSidebar}>{t('sidebar.addCategory')}</NavLink>
                </li>
                <li>
                  <NavLink to="/categories" onClick={toggleSidebar}>{t('sidebar.listCategories')}</NavLink>
                </li>
              </ul>
            </li>
            <li className={`submenu ${activeSubmenu === 'articles' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleSubmenu('articles')}>
                <FontAwesomeIcon icon={faBox} className="fa-icon" alt={t('sidebar.foods')} />
                <span>{t('sidebar.foods')}</span>
                <span className="menu-arrow"></span>
              </a>
              <ul className={`submenu-list ${activeSubmenu === 'articles' ? 'd-block' : 'd-none'}`}>
                <li>
                  <NavLink to="/food-form" onClick={toggleSidebar}>{t('sidebar.addFood')}</NavLink>
                </li>
                <li>
                  <NavLink to="/food-list" onClick={toggleSidebar}>{t('sidebar.listFoods')}</NavLink>
                </li>
              </ul>
            </li>
            <li>
              <NavLink to="/qr-generator" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faQrcode} className="fa-icon" alt={t('sidebar.qrCode')} />
                <span>{t('sidebar.qrCode')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/table-orders" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faClipboardList} className="fa-icon" alt={t('sidebar.tableOrders')} />
                <span>{t('sidebar.tableOrders')}</span>
                <span className="badg">{tableOrderCount}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/delivery-orders" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faTruck} className="fa-icon" alt={t('sidebar.deliveryOrders')} />
                <span>{t('sidebar.deliveryOrders')}</span>
                <span className="badg">{deliveryOrderCount}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/table-reservation" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faCalendarCheck} className="fa-icon" alt={t('sidebar.reservation')} />
                <span>{t('sidebar.reservation')}</span>
                <span className="badg">{reservationCount}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/messages" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faEnvelope} className="fa-icon" alt={t('sidebar.messages')} />
                <span>{t('sidebar.messages')}</span>
                <span className="badg">{messageCount}</span>
              </NavLink>
            </li>
            <li className={`submenu ${activeSubmenu === 'chefs' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleSubmenu('chefs')}>
                <FontAwesomeIcon icon={faUserCheck} className="fa-icon" alt={t('sidebar.chefs')} />
                <span>{t('sidebar.chefs')}</span>
                <span className="menu-arrow"></span>
              </a>
              <ul className={`submenu-list ${activeSubmenu === 'chefs' ? 'd-block' : 'd-none'}`}>
                <li>
                  <NavLink to="/add-chef" onClick={toggleSidebar}>{t('sidebar.addChef')}</NavLink>
                </li>
                <li>
                  <NavLink to="/chefs-list" onClick={toggleSidebar}>{t('sidebar.listChefs')}</NavLink>
                </li>
              </ul>
            </li>
            <li className={`submenu ${activeSubmenu === 'about' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleSubmenu('about')}>
                <FontAwesomeIcon icon={faInfoCircle} className="fa-icon" alt={t('sidebar.aboutSection')} />
                <span>{t('sidebar.aboutSection')}</span>
                <span className="menu-arrow"></span>
              </a>
              <ul className={`submenu-list ${activeSubmenu === 'about' ? 'd-block' : 'd-none'}`}>
                <li>
                  <NavLink to="/add-about" onClick={toggleSidebar}>{t('sidebar.addAbout')}</NavLink>
                </li>
                <li>
                  <NavLink to="/update-about" onClick={toggleSidebar}>{t('sidebar.updateAbout')}</NavLink>
                </li>
              </ul>
            </li>
            <li>
             
                <NavLink to="/add-header" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faImage} className="fa-icon" alt={t('sidebar.header')} />
                  <span>{t('sidebar.header')}</span>
                </NavLink>
             
              
            </li>
            <li>
            <NavLink to="/location-map" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faMapMarkedAlt} className="fa-icon" alt={t('sidebar.locationMap')} />
                <span>{t('sidebar.locationMap')}</span>
              </NavLink>
            </li>
            <br />
            <br />
            <br />
            <li>
              <NavLink className="sidebar-btn" onClick={handleVisitWebsite}>
                <FontAwesomeIcon icon={faExternalLinkAlt} className="fa-icon" /> {t('sidebar.yourWebsite')}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;