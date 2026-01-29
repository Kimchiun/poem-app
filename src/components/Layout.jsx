import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import Footer from './Footer';
import '../styles/Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="main-content">
                {children}
            </main>
            <Footer />
            <MobileNav />
        </div>
    );
};

export default Layout;
