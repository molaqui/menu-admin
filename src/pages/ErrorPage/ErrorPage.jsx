import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ErrorPage.css'; // Assurez-vous d'ajouter les styles nécessaires dans ce fichier CSS

const ErrorPage = () => {
  const { t } = useTranslation();

  return (
    <div className="error-page">
      <div className="main-wrapper">
        <div className="error-box">
          <h1>{t('error.404')}</h1>
          <h3 className="h2 mb-3">
            <i className="fas fa-exclamation-circle"></i> {t('error.oops')}
          </h3>
          <p className="h4 font-weight-normal">{t('error.description')}</p>
          <NavLink to="/" className="btn btn-primary">
            {t('error.backHome')}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
