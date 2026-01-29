import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenTool, Home, User } from 'lucide-react';
import '../styles/Header.css';

const Header = () => {
    const location = useLocation();

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    this is for <span className="logo-accent">you</span>
                </Link>

                <nav className="desktop-nav">
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                        <Home size={20} />
                        <span>Home</span>
                    </Link>
                    <Link to="/upload" className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}>
                        <PenTool size={20} />
                        <span>Write</span>
                    </Link>
                    <Link to="/profile" className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}>
                        <User size={20} />
                        <span>Profile</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
