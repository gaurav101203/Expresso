import React, { useState, useEffect } from 'react'; // Import useEffect
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import './AdminPanel.css';
import backgroundImage from './bg.jpg'; // Adjust the path as necessary
import introVideo from './Expresso.mp4'; // Adjust the path as needed

const AdminPanel = ({ onLogout }) => {
    const location = useLocation();
    const isAdminPanelRoot = location.pathname === '/adminpanel';
    const [firstName, setFirstName] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard'); // Add this line to define activeSection

    const handleSectionChange = (section) => {
        // This function could be used to handle any specific logic when changing sections
        setActiveSection(section);
    };

    // Fetch user data when the component mounts
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust as needed
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setFirstName(data.firstName);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Failed to fetch user data', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="admin-panel" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <header className="admin-header">
                <h1 onClick={() => handleSectionChange('dashboard')}>Admin Panel</h1> {/* Refresh the dashboard on header click */}
                <button onClick={onLogout} className="logout-btn">Logout</button>
            </header>
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <nav>
                        <ul>
                            <li>
                                <NavLink 
                                    to="/adminpanel/dashboard" 
                                    className={({ isActive }) => (isActive ? "active" : "")} 
                                    title="Dashboard"
                                    onClick={() => handleSectionChange('dashboard')}
                                >
                                    <i className="fas fa-tachometer-alt"></i> Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/adminpanel/manage-users" 
                                    className={({ isActive }) => (isActive ? "active" : "")} 
                                    title="Manage Users"
                                    onClick={() => handleSectionChange('manage-users')}
                                >
                                    <i className="fas fa-users"></i> Manage Users
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/adminpanel/shipments" 
                                    className={({ isActive }) => (isActive ? "active" : "")} 
                                    title="Shipments"
                                    onClick={() => handleSectionChange('shipments')}
                                >
                                    <i className="fas fa-truck"></i> Shipments
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/adminpanel/create-shipment" 
                                    className={({ isActive }) => (isActive ? "active" : "")} 
                                    title="Create Shipment"
                                    onClick={() => handleSectionChange('create-shipment')}
                                >
                                    <i className="fas fa-plus"></i> Create Shipment
                                </NavLink>
                            </li>
                            <li>
                                <NavLink 
                                    to="/adminpanel/products" 
                                    className={({ isActive }) => (isActive ? "active" : "")} 
                                    title="Products"
                                    onClick={() => handleSectionChange('products')}
                                >
                                    <i className="fas fa-box"></i> Products
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <main className="admin-main">
                    {/* Display welcome message on the main Admin Panel page only */}
                    {isAdminPanelRoot && (
                        <div className="welcome-video-container">
                            <video
                                className="welcome-video"
                                autoPlay
                                muted
                                loop
                                playsInline
                            >
                                <source src={introVideo} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
                    <Outlet /> {/* This will render the selected section */}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;
