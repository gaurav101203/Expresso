// src/ManageUsers.js
import React, { useState, useEffect } from 'react';
import './ManageUsers.css'; // Import the CSS file

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(''); // Track selected role

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users'); // API endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data); // Store all users
            } catch (error) {
                console.error('Error fetching users:', error);
                alert('Error fetching users: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete user');
            }
            // Remove user from state after successful deletion
            setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // Filter users based on the selected role
    const filteredUsers = selectedRole 
        ? users.filter(user => user.role === selectedRole) 
        : users; // Show all users if no role is selected

    return (
        <div className="manage-users-container">
            <h2 className="manage-users-title">Manage Users</h2>
            <div className="filter-container">
                <label htmlFor="role-filter">Filter by Role:</label>
                <select 
                    id="role-filter" 
                    value={selectedRole} 
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="admin">Admin</option>
                    <option value="carrier">Carrier</option>
                    <option value="user">User</option>
                </select>
            </div>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id}>
                            <td>{user.firstName} {user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="delete-button" onClick={() => handleDelete(user._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageUsers;
