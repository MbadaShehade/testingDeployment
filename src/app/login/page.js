import Header from '../components/ClientComponents/Header/Header';
import Footer from '../components/ServerComponents/Footer/Footer';
import LoginPage from '../components/ClientComponents/LoginPage/LoginPage';
import './login-page.css'; 
import FlowersRenderer from '../components/ClientComponents/FlowersRenderer/FlowersRenderer';
export default function Login() {
  return (
    <div className="login-page-container">
      <Header isLoggedIn={false}/>
      <FlowersRenderer />
      <LoginPage />
      <Footer />
    </div>
  );
} 