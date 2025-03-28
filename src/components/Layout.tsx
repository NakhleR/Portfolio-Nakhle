
import { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [contentVisible, setContentVisible] = useState(false);
  
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
  
  return (
    <>
      <div className={`transition-opacity duration-500 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          {children}
        </main>
        <footer className="py-8 border-t">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Nakhle Rizk. All rights reserved.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  GitHub
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  LinkedIn
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Twitter
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
