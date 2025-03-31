
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when changing routes
    setMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/work', label: 'Work' },
    { path: '/contact', label: 'Contact' }
  ];

  const handleDownloadCV = () => {
    // Here you would link to your actual CV file
    console.log('Downloading CV...');

    // Create a temporary link to download the CV
    const link = document.createElement('a');
    link.href = '/Nakhle_CV.pdf'; // Replace with actual path to your CV
    link.download = 'Nakhle_Rizk_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out",
        scrolled ? "py-3 bg-background/80 backdrop-blur-lg border-b" : "py-4",
        mobileMenuOpen && isMobile ? "bg-background border-b" : ""
      )}
    >
      <div className="container flex items-center justify-between">
        <Link
          to="/"
          className="text-xl md:text-2xl font-medium tracking-tight transition-opacity hover:opacity-80"
          aria-label="Home"
        >
          Nakhle Rizk
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {menuItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'text-sm tracking-wide transition-colors relative link-underline',
                isActive(path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </Link>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 animated-button"
            onClick={handleDownloadCV}
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download CV</span>
            <span className="sm:hidden">CV</span>
          </Button>

          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleDownloadCV}
          >
            <Download size={14} />
            <span>CV</span>
          </Button>

          <ThemeToggle />

          <button
            className="text-foreground flex items-center justify-center w-10 h-10"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 w-full bg-background border-b transition-all duration-300 overflow-hidden",
          mobileMenuOpen ? "max-h-60 py-4" : "max-h-0 py-0 border-b-0"
        )}
      >
        <div className="container flex flex-col space-y-4">
          {menuItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'text-base py-2 transition-colors',
                isActive(path) ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;