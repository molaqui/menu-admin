import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import CategoryUpload from './pages/CategoryUpload/CategoryUpload';
import FoodForm from './pages/FoodForm/FoodForm';
import FoodList from './pages/FoodList/FoodList';
import QRCodeGenerator from './pages/QRCodeGenerator/QRCodeGenerator';
import AddChef from './pages/AddChef/AddChef';
import AddAbout from './pages/AddAbout/Addabout';
import UpdateAbout from './pages/UpdateAbout/UpdateAbout';
import AddLocation from './pages/AddLocation/AddLocation';
import ChefsList from './pages/ChefsList/ChefsList';
import AddHeaderImage from './pages/AddHeaderImage/AddHeaderImage';
import DeliveryOrders from './pages/DeliveryOrders/DeliveryOrders';
import TableOrders from './pages/TableOrders/TableOrders';
import Reservations from './pages/Reservations/Reservations';
import MessageList from './pages/MessageList/MessageList';
import CategoryList from './pages/CategoryList/CategoryList';
import LoginForm from './pages/LogIn/LoginForm';
import PrivateRoute from './pages/PrivateRoute/PrivateRoute';
import Profile from './pages/Profile/Profile';

function App() {
  const { i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    // Charger la langue à partir du localStorage
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('token');

    // Delete the userId cookie
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    setIsLoggedIn(false);
};


  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng); // Sauvegarder la langue dans localStorage
  };

  return (
 
    <div className="app">
  
        {isLoggedIn ? (
          <>
            <div className="">
              <Routes>
                <Route path="/" element={<Layout onSignOut={handleSignOut} onLanguageChange={handleLanguageChange} />}>
                  <Route index element={<PrivateRoute isLoggedIn={isLoggedIn} element={Dashboard} />} />
                  <Route path="/add-category" element={<PrivateRoute isLoggedIn={isLoggedIn} element={CategoryUpload} />} />
                  <Route path="/delivery-orders" element={<PrivateRoute isLoggedIn={isLoggedIn} element={DeliveryOrders} />} />
                  <Route path="/food-form" element={<PrivateRoute isLoggedIn={isLoggedIn} element={FoodForm} />} />
                  <Route path="/food-list" element={<PrivateRoute isLoggedIn={isLoggedIn} element={FoodList} />} />
                  <Route path="/qr-generator" element={<PrivateRoute isLoggedIn={isLoggedIn} element={QRCodeGenerator} />} />
                  <Route path="/table-reservation" element={<PrivateRoute isLoggedIn={isLoggedIn} element={Reservations} />} />
                  <Route path="/add-chef" element={<PrivateRoute isLoggedIn={isLoggedIn} element={AddChef} />} />
                  <Route path="/add-about" element={<PrivateRoute isLoggedIn={isLoggedIn} element={AddAbout} />} />
                  <Route path="/chefs-list" element={<PrivateRoute isLoggedIn={isLoggedIn} element={ChefsList} />} />
                  <Route path="/table-orders" element={<PrivateRoute isLoggedIn={isLoggedIn} element={TableOrders} />} />
                  <Route path="/update-about" element={<PrivateRoute isLoggedIn={isLoggedIn} element={UpdateAbout} />} />
                  
                  <Route path="/add-header" element={<PrivateRoute isLoggedIn={isLoggedIn} element={AddHeaderImage} />} />
                  <Route path="/messages" element={<PrivateRoute isLoggedIn={isLoggedIn} element={MessageList} />} />
                  <Route path="/categories" element={<PrivateRoute isLoggedIn={isLoggedIn} element={CategoryList} />} />
                  <Route path="/location-map" element={<PrivateRoute isLoggedIn={isLoggedIn} element={AddLocation} />} />
                  <Route path="/profile" element={<PrivateRoute isLoggedIn={isLoggedIn} element={Profile} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Route>
              </Routes>
            </div>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
     
    </div>
  
  );
}

export default App;
