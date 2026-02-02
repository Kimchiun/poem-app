import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenTool, Home, Heart } from 'lucide-react';
import '../styles/MobileNav.css';

const MobileNav = () => {
    const location = useLocation();

    return (
        <nav className="mobile-nav">
            <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <Home size={24} />
                <span className="mobile-nav-label">Home</span>
            </Link>

            <Link to="/upload" className="mobile-fab-wrapper">
                <div className={`fab-button ${location.pathname === '/upload' ? 'active' : ''}`}>
                    <PenTool size={24} />
                </div>
            </Link>

            <Link to="/likes" className={`mobile-nav-item ${location.pathname === '/likes' ? 'active' : ''}`}>
                <Heart size={24} />
                <span className="mobile-nav-label">Likes</span>
            </Link>
        </nav>
    );
};

export default MobileNav;
