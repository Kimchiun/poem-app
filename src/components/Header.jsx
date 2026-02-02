import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenTool, Home, Heart } from 'lucide-react';
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
                    <Link to="/likes" className={`nav-link ${location.pathname === '/likes' ? 'active' : ''}`}>
                        <Heart size={20} />
                        <span>Likes</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
