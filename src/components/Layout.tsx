
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Toaster } from "@/components/ui/sonner";
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="flex min-h-screen relative">
      {/* Mobile menu toggle button */}
      {isMobileView && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-background"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}
      
      {/* Sidebar - always visible on desktop, conditionally visible on mobile */}
      <div 
        className={`
          ${isMobileView ? 'fixed z-40 h-full' : 'relative'} 
          ${isMobileView && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'} 
          transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar />
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobileView && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobileMenu}
        />
      )}
      
      {/* Main content */}
      <main className={`flex-1 p-4 md:p-6 overflow-auto ${isMobileView ? 'pt-16' : ''}`}>
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
