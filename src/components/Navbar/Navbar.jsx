import React, { useEffect, useState } from "react";
import AuthService from "../../Api/AuthService";
import MessageService from "../../Api/MessageService";
import Cookies from "js-cookie";
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags';
import { NavLink } from "react-router-dom";

const languages = {
  en: { name: "English", flagCode: "GB" },
  fr: { name: "Français", flagCode: "FR" },
  ar: { name: "العربية", flagCode: "MA" },
  zh: { name: "中文", flagCode: "CN" },
};

function Navbar({ onSignOut }) {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const userId = Cookies.get("userId");
    if (userId) {
      fetchUserById(userId);
      fetchMessages(userId);
    }
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    const userId = Cookies.get("userId");
    if (userId) {
      const intervalId = setInterval(() => {
        fetchMessages(userId);
        fetchUserById(userId);
        console.log("Polling messages");
      }, 30000); // Polling every 30 seconds

      return () => clearInterval(intervalId); // Clean up interval on component unmount
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

  const fetchMessages = async (userId) => {
    try {
      const userMessages = await MessageService.getMessagesByUserId(userId);
      setMessages(userMessages);
      console.log("Messages fetched successfully");
    } catch (error) {
      console.error("Erreur lors de la récupération des messages :", error);
    }
  };

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Sauvegarder la langue dans localStorage
  };

  const currentLang = localStorage.getItem('i18nextLng') || 'en';

  return (
    <div className="header">
      <div className="header-left active">
        <a href="index.html" className="logo">
          <img src="assets/img/logo.png" alt={t('navbar.companyLogo')} />
        </a>
        <a href="index.html" className="logo-small">
          <img src="assets/img/logo-small.png" alt={t('navbar.smallLogo')} />
        </a>
        <a id="toggle_btn" href="javascript:void(0);"></a>
      </div>

      <a id="mobile_btn" className="mobile_btn" href="#sidebar">
        <span className="bar-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </a>

      <ul className="nav user-menu">
        <li className="nav-item">
          <div className="top-nav-search">
            <a href="javascript:void(0);" className="responsive-search">
              <i className="fa fa-search"></i>
            </a>
          </div>
        </li>

        <li className="nav-item dropdown has-arrow flag-nav">
          <a
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            href="javascript:void(0);"
            role="button"
          >
            <Flag code={languages[currentLang].flagCode} className="flag-icon" />
            {languages[currentLang].name}
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            {Object.keys(languages).map((lng) => (
              <a
                key={lng}
                href="javascript:void(0);"
                className="dropdown-item"
                onClick={() => handleLanguageChange(lng)}
              >
                <Flag code={languages[lng].flagCode} className="flag-icon" />
                {languages[lng].name}
              </a>
            ))}
          </div>
        </li>

        <li className="nav-item dropdown">
          <a
            href="javascript:void(0);"
            className="dropdown-toggle nav-link"
            data-bs-toggle="dropdown"
          >
            <img
              src="assets/img/icons/notification-bing.svg"
              alt="Notification Icon"
            />
            <span className="badge rounded-pill">{messages.length}</span>
          </a>
          <div className=" dropdown-menu notifications">
            <div className="topnav-dropdown-header">
              <span className="notification-title">{t('navbar.notifications')}</span>
              
            </div>
            <div className=" noti-content">
              <ul className="notification-list ">
                {messages.map((msg) => (
                  <li key={msg.id} className="notification-message">
                    <a href="javascript:void(0);">
                      <div className="media d-flex">
                        <span className="avatar flex-shrink-0">
                          <img
                            alt="Profile Avatar"
                            src="assets/img/profiles/avatar-02.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <div className="noti-details">
                            <strong>Name:</strong> {msg.name}
                            <br />
                            <strong>Email:</strong> {msg.email}
                            <br />
                            <strong>Subject:</strong> {msg.subject}
                            <br />
                            <strong>Message:</strong> {msg.message}
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="topnav-dropdown-footer">
              <NavLink to="/messages">{t('navbar.viewAllNotifications')}</NavLink>
            </div>
          </div>
        </li>

        <li className="nav-item dropdown has-arrow main-drop">
          <a
            href="javascript:void(0);"
            className="dropdown-toggle nav-link userset"
            data-bs-toggle="dropdown"
          >
            <span className="user-img">
              {user && user.logo ? (
                <img
                  src={`data:image/jpeg;base64,${user.logo}`}
                  alt="User Logo"
                />
              ) : (
                <img
                  src="assets/img/admin.jpg"
                  alt={t('navbar.defaultAvatar')}
                />
              )}
              <span className="status online"></span>
            </span>
          </a>
          <div className="dropdown-menu menu-drop-user">
            <div className="profilename">
              <div className="profileset">
                <span className="user-img">
                  {user && user.logo ? (
                    <img
                      src={`data:image/jpeg;base64,${user.logo}`}
                      alt="User Logo"
                    />
                  ) : (
                    <img
                      src="assets/img/admin.jpg"
                      alt={t('navbar.defaultAvatar')}
                    />
                  )}
                  <span className="status online"></span>
                </span>
                <div className="profilesets">
                  <h6>{user ? user.storeName : "John Doe"}</h6>
                  <h5>{t('navbar.admin')}</h5>
                </div>
              </div>
              <hr className="m-0" />
              <NavLink className="dropdown-item" to="profile">
                <i className="me-2" data-feather="user"></i> {t('navbar.myProfile')}
              </NavLink>
             
              <hr className="m-0" />
              <a
                className="dropdown-item logout pb-0"
                href="#"
                onClick={onSignOut}
              >
                <img
                  src="assets/img/icons/log-out.svg"
                  className="me-2"
                  alt="Logout Icon"
                />
                {t('navbar.logout')}
              </a>
            </div>
          </div>
        </li>
      </ul>

      <div className="dropdown mobile-user-menu">
        <a
          href="javascript:void(0);"
          className="nav-link dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa fa-ellipsis-v"></i>
        </a>
        <div className="dropdown-menu dropdown-menu-right">
          <a className="dropdown-item" href="profile.html">
            {t('navbar.myProfile')}
          </a>
          <a className="dropdown-item" href="generalsettings.html">
            {t('navbar.settings')}
          </a>
          <a className="dropdown-item" href="#" onClick={onSignOut}>
            {t('navbar.logout')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default Navbar;