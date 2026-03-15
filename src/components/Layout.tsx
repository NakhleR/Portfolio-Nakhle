
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

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
        <footer className="py-12 border-t border-border/50">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-col items-center md:items-start gap-1">
                <span className="font-heading font-semibold text-lg tracking-tight">Nakhle Rizk</span>
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} All rights reserved.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <a href="https://github.com/NakhleR" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  GitHub
                </a>
                <span className="w-1 h-1 rounded-full bg-border" />
                <a href="https://www.linkedin.com/in/nakhle-rizk-528129256/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
