import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Flag from 'react-world-flags';
import "./LoginForm.css";
import authService from "../../Api/AuthService";

const languages = {
  en: { name: "English", flagCode: "GB" }, // GB pour le drapeau anglais
  fr: { name: "Français", flagCode: "FR" },
  ar: { name: "العربية", flagCode: "MA" }, // SA pour le drapeau saoudien
  zh: { name: "中文", flagCode: "CN" },
};

const LoginForm = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);

  const navigate = useNavigate();
  const currentLang = i18n.language;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await authService.login(email, password);
      if (user) {
        onLogin();
        navigate("/");
      } else {
        setError(t("login.error.invalidCredentials"));
      }
    } catch (error) {
      setError(t("login.error.failedLogin"));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      Swal.fire({
        icon: 'error',
        title: t('forgotPassword.invalidEmailTitle'),
        text: t('forgotPassword.invalidEmailText'),
      });
      return;
    }

    setIsResetLoading(true);
    try {
      await authService.forgotPassword(resetEmail);
      Swal.fire({
        icon: 'success',
        title: t('forgotPassword.successTitle'),
        text: t('forgotPassword.successText'),
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error in forgotPassword request:", error);
      Swal.fire({
        icon: 'error',
        title: t('forgotPassword.failedTitle'),
        text: t('forgotPassword.failedText'),
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <div className="login-wrapper">
        {/* Menu déroulant pour la sélection de la langue */}
        <div className="language-dropdown">
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              <Flag code={languages[currentLang]?.flagCode || 'GB'} className="flag-icon" />
              {languages[currentLang]?.name || languages.en.name}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {Object.keys(languages)
                .filter((lng) => lng !== currentLang)
                .map((lng) => (
                  <Dropdown.Item
                    key={lng}
                    onClick={() => changeLanguage(lng)}
                  >
                    <Flag code={languages[lng].flagCode} className="flag-icon" />
                    {languages[lng].name}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="login-content">
          <div className="login-userset">
            <div className="login-logo">
              <img src="assets/img/logo.png" alt="img" />
            </div>
            <div className="login-userheading">
              <h3>{t("login.title")}</h3>
              <h4>{t("login.subtitle")}</h4>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-login">
                <label>{t("login.emailLabel")}</label>
                <div className="form-addons">
                  <input
                    type="text"
                    placeholder={t("login.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={error ? "input-error" : ""}
                  />
                  <img src="assets/img/icons/mail.svg" alt="img" />
                </div>
              </div>
              <div className="form-login">
                <label>{t("login.passwordLabel")}</label>
                <div className="pass-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`pass-input ${error ? "input-error" : ""}`}
                    placeholder={t("login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className={`fas toggle-password ${
                      showPassword ? "fa-eye" : "fa-eye-slash"
                    }`}
                    onClick={togglePasswordVisibility}
                  ></span>
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-login">
                <div className="alreadyuser">
                  <h4>
                    <a
                      href="#!"
                      onClick={() => setShowModal(true)}
                      className="hover-a"
                    >
                      {t("login.forgotPasswordLink")}
                    </a>
                  </h4>
                </div>
              </div>
              <div className="form-login">
                <button
                  type="submit"
                  className="btn btn-login"
                  disabled={isLoading}
                >
                  {isLoading ? t("login.signingIn") : t("login.signInButton")}
                </button>
              </div>
            </form>
            <div className="signinform text-center">
              <h4>
                {t("login.noAccountMessage")}{" "}
                <a href="https://lmenu-v1.netlify.app/" className="hover-a">
                  {t("login.signUpLink")}
                </a>
              </h4>
            </div>
            <div className="form-setlogin">
              <h4>{t("login.orSignUpWith")}</h4>
            </div>
            <div className="form-sociallink">
              <ul>
                <li>
                  <a href="#!">
                    <img
                      src="assets/img/icons/google.png"
                      className="me-2"
                      alt="google"
                    />
                    {t("login.signUpWithGoogle")}
                  </a>
                </li>
                <li>
                  <a href="#!">
                    <img
                      src="assets/img/icons/facebook.png"
                      className="me-2"
                      alt="facebook"
                    />
                    {t("login.signUpWithFacebook")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="login-img">
          <img src="assets/img/login.jpg" alt="img" />
        </div>
      </div>

      {/* Modale pour le mot de passe oublié */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t("login.forgotPasswordTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="resetEmail">{t("login.forgotPasswordEmailLabel")}</label>
            <input
              type="email"
              className="form-control"
              id="resetEmail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("login.cancelButton")}
          </Button>
          <Button
            variant="primary"
            onClick={handleForgotPassword}
            disabled={isResetLoading}
          >
            {isResetLoading ? t("login.sendingButton") : t("login.sendResetLinkButton")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LoginForm;
