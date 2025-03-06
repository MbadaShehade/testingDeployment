import Header from '../components/ClientComponents/Header/Header';
import Footer from '../components/ServerComponents/Footer/Footer';
import LoginPage from '../components/ClientComponents/LoginPage/LoginPage';
import './login-page.css'; // We'll create this file next

export default function Login() {
  return (
    <div className="login-page-container">
      <Header />
      <LoginPage />
      <Footer />
    </div>
  );
} 