import './globals.css';
import Header from './components/ClientComponents/Header/Header';
import Footer from './components/ServerComponents/Footer/Footer';
import MoreDetails from './components/ServerComponents/MoreDetails/MoreDetails';
import ScrollAnimations from './components/ClientComponents/ScrollAnimations/ScrollAnimations';
import ProblemSection from './components/ServerComponents/ProblemSection/ProblemSection';
import Introduction from './components/ServerComponents/Introduction/Introduction';
import HowItWorksSection from './components/ServerComponents/HowItWorksSection/HowItWorksSection';
import ScrollHandler from './components/ClientComponents/ScrollHandler/ScrollHandler';
import FlowersRenderer from './components/ClientComponents/FlowersRenderer/FlowersRenderer';

export default function Home() {
  return (
    <div className="App">
      <ScrollHandler />
      <Header isLoggedIn={false}/>
      <ScrollAnimations />
      <FlowersRenderer /> {/* only for screens above 1560px */}

      <main className="main-content">
        <Introduction />
        <ProblemSection />
        <HowItWorksSection />
        <MoreDetails />
      </main>
      <Footer />
    </div>
  );
}