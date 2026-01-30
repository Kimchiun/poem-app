import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenTool, Home, User } from 'lucide-react';
import '../styles/MobileNav.css';

const MobileNav = () => {
    const location = useLocation();

    return (
        <nav className="mobile-nav">
            <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <Home size={24} />
                <span className="mobile-nav-label">Home</span>
            </Link>
            <Link to="/upload" className={`mobile-nav-item ${location.pathname === '/upload' ? 'active' : ''}`}>
                <div className="fab-container">
                    <div className="fab">
                        <PenTool size={24} />
                    </div>
                </div>
            </Link>
        </nav>
    );
};

export default MobileNav;
