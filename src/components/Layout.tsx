
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

declare global {
  interface Window {
    birdsTransitionComplete?: boolean;
  }
}

const Layout = ({ children }: LayoutProps) => {
  const [contentVisible, setContentVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if birds transition is complete or not active
    const checkTransitionStatus = () => {
      // If birdsTransitionComplete is true or undefined (not using the transition)
      if (window.birdsTransitionComplete === true || window.birdsTransitionComplete === undefined) {
        setContentVisible(true);
        return;
      }

      // Otherwise check again in a short interval
      setTimeout(checkTransitionStatus, 100);
    };

    // Start with content hidden
    setContentVisible(false);

    // Wait a brief moment for any transition to initialize
    const timer = setTimeout(() => {
      checkTransitionStatus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <div className={`transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
