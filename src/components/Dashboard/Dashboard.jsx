import React, { useEffect, useState } from 'react';
import FoodService from '../../Api/foodService'; // Assurez-vous que le chemin est correct
import VisiteService from '../../Api/VisiteService'; // Importez le service pour les visites
import Cookies from 'js-cookie';

function Dashboard() {
  const [foodCount, setFoodCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0); // État pour le nombre de visites
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodCount = async () => {
      try {
        const response = await FoodService.countFoodsByUserId();
        setFoodCount(response.data);
      } catch (error) {
        setError('Error fetching food count');
      }
    };

    const fetchCategoryCount = async () => {
      try {
        const response = await FoodService.getCategoryNames();
        setCategoryCount(response.data.length); // Supposons que response.data soit un tableau de catégories
      } catch (error) {
        setError('Error fetching category count');
      }
    };

    const fetchVisitCount = async () => {
      try {
        const userId = Cookies.get('userId'); // Assurez-vous que le userId est stocké dans un cookie
        if (userId) {
          const response = await VisiteService.getVisitCountByUserId(userId);
          setVisitCount(response); // Accédez aux données spécifiques de la réponse
        }
      } catch (error) {
        setError('Error fetching visit count');
      }
    };

    fetchFoodCount();
    fetchCategoryCount();
    fetchVisitCount();
  }, []);

  return (
    <div>
      <div className="content">
        <div className="row">
          <div className="col-lg-3 col-sm-6 col-12 d-flex">
            <div className="dash-count">
              <div className="dash-counts">
                <h4>{visitCount}</h4> {/* Nombre de visiteurs */}
                <h5>Nombre de visitors</h5>
              </div>
              <div className="dash-imgs">
                <i data-feather="user"></i>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-12 d-flex">
            <div className="dash-count das1">
              <div className="dash-counts">
                <h4>{categoryCount}</h4> {/* Nombre de catégories */}
                <h5>Nombre de category</h5>
              </div>
              <div className="dash-imgs">
                <i data-feather="user-check"></i>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-12 d-flex">
            <div className="dash-count das2">
              <div className="dash-counts">
                <h4>{foodCount}</h4> {/* Nombre de food */}
                <h5>Nombre de articles</h5>
              </div>
              <div className="dash-imgs">
                <i data-feather="file-text"></i>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-12 d-flex">
            <div className="dash-count das3">
              <div className="dash-counts">
                <h4>105</h4> {/* Nombre de factures de vente (remplacez par une donnée réelle si disponible) */}
                <h5>Sales Invoice</h5>
              </div>
              <div className="dash-imgs">
                <i data-feather="file"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
