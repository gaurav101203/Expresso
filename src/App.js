import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Carrier from './carrier'; 
import AdminPanel from './AdminPanel';
import UserPage from './UserPage'; 
import ManageUsers from './ManageUsers'; 
import Shipments from './Shipments';
import CreateShipment from './CreateShipment';
import Products from './Products';
import Dashboard from './Dashboard';

const App = () => {
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');

    const handleLogin = (role) => {
        setUserRole(role);
    };

    const handleLogout = () => {
        setUserRole(null); // Log out the user
    };

    useEffect(() => {
        // Fetching user data when the component mounts
        const fetchUserData = async () => {
            if (userRole === 'admin') {
                try {
                    const response = await fetch('/api/user'); // Adjust API endpoint as necessary
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setUserName(data.name); // Assuming API returns { name: "Admin" }
                } catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                }
            }
        };

        fetchUserData();
    }, [userRole]); // Fetch user data only when userRole changes

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                
                <Route path="/carrier" element={userRole === 'carrier' ? <Carrier onLogout={handleLogout} /> : <Navigate to="/login" />} />

                <Route path="/adminpanel/*" element={userRole === 'admin' ? <AdminPanel onLogout={handleLogout} userName={userName} /> : <Navigate to="/login" />}>
                    {/* Admin Panel Nested Routes */}
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="manage-users" element={<ManageUsers />} />
                    <Route path="shipments" element={<Shipments />} />
                    <Route path="create-shipment" element={<CreateShipment />} />
                    <Route path="products" element={<Products />} />
                </Route>
                
                <Route path="/userpage" element={userRole === 'user' ? <UserPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
                
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;
