import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import backgroundImage from './bg.jpg';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showFirstPage, setShowFirstPage] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setFormData({
            firstName: '',
            lastName: '',
            mobile: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            role: 'user'
        });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: formData.username, password: formData.password, role: formData.role }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.user.role !== formData.role) {
                throw new Error(`You cannot log in as ${formData.role}. Please select the correct role.`);
            }

            onLogin(data.user.role);
            if (data.user.role === 'admin') {
                navigate('/adminpanel');
            } else if (data.user.role === 'carrier') {
                navigate('/carrier');
            } else {
                navigate('/userpage');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
    
        let securityCode = '';
        if (formData.role === 'admin') {
            securityCode = prompt("Enter the security code for admin (default: 5555):");
        } else if (formData.role === 'carrier') {
            securityCode = prompt("Enter the security code for carrier (default: 6666):");
        }
    
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, securityCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
    
            alert('Registration successful! Please log in with your credentials.');
            // Clear the form data
            setFormData({
                firstName: '',
                lastName: '',
                mobile: '',
                email: '',
                username: '',
                password: '',
                confirmPassword: '',
                role: 'user',
            });
            navigate('/login'); // Navigate to the login page
        } catch (error) {
            console.error('Error during registration:', error);
            alert('Registration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
        
    return (
        <div>
            {showFirstPage ? (
                // First Page with Background Image and Banner Section
                <div
                    className="first-page"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                >
                    <section id="banner" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        height: '100vh',
                        paddingTop: '100px',
                    }}>
                        <div className="banner-text" style={{ textAlign: 'center', color: '#fff', paddingTop: '20px' }}>
                            <h1 style={{ fontSize: '130px', fontFamily: "'Kaushan Script', cursive" }}>Logistics & Shipping</h1>
                            <p style={{ fontSize: '20px', fontStyle: 'italic' }}>A best choice for you</p>
                            <div className="banner-btn" style={{ margin: '20px auto 0' }}>
                                <button
                                    className="explore-button"
                                    onClick={() => setShowFirstPage(false)}
                                    style={{
                                        padding: '12px 0',
                                        width: '150px',
                                        fontSize: '20px',
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        border: '.5px solid #fff',
                                        cursor: 'pointer',
                                        transition: 'color 0.5s',
                                    }}
                                >
                                    Explore
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                // Login or Registration Form
                <div className="content">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-md-6 contents">
                                <div className={`form-block ${isLogin ? 'login-form' : 'register-form'}`}>
                                    <h2>{isLogin ? 'Login' : 'Register'}</h2>
                                    <form onSubmit={isLogin ? handleLogin : handleRegister}>

                                        {/* Role Selection for Login */}
                                        {isLogin && (
                                            <div className="form-group">
                                                <label htmlFor="role">Role:</label>
                                                <select
                                                    id="role"
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                    required
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="carrier">Carrier</option>
                                                    <option value="user">User</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Registration Fields */}
                                        {!isLogin && (
                                            <>
                                                <div className="form-group">
                                                    <label htmlFor="role">Role:</label>
                                                    <select
                                                        id="role"
                                                        name="role"
                                                        value={formData.role}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        required
                                                    >
                                                        <option value="admin">Admin</option>
                                                        <option value="carrier">Carrier</option>
                                                        <option value="user">User</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="firstName">First Name:</label>
                                                    <input
                                                        type="text"
                                                        id="firstName"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="lastName">Last Name:</label>
                                                    <input
                                                        type="text"
                                                        id="lastName"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="mobile">Mobile:</label>
                                                    <input
                                                        type="tel"
                                                        id="mobile"
                                                        name="mobile"
                                                        value={formData.mobile}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="email">Email:</label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="form-control"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div className="form-group">
                                            <label htmlFor="username">Username:</label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password">Password:</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>

                                        {/* Confirmation Password Field for Registration */}
                                        {!isLogin && (
                                            <div className="form-group">
                                                <label htmlFor="confirmPassword">Confirm Password:</label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                    required
                                                />
                                            </div>
                                        )}

                                        <button type="submit" className="btn">
                                            {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                                        </button>
                                        <div className="create-account-link">
                                            <span>{isLogin ? "Don't have an account?" : "Already have an account?"} </span>
                                            <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
                                                {isLogin ? 'Sign Up' : 'Login'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
