import Header from '../components/ClientComponents/Header/Header';
import Footer from '../components/ServerComponents/Footer/Footer';
import LoginPage from '../components/ClientComponents/LoginPage/LoginPage';
import SideFlowers from '../components/ServerComponents/SideFlowers/SideFlowers';
import './login-page.css'; 

export default function Login() {
  return (
    <div className="login-page-container">
      <Header isLoggedIn={false}/>
      <SideFlowers />
      <LoginPage />
      <Footer />
    </div>
  );
} 