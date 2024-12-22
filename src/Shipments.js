import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Shipments.css';

const Shipments = () => {
    const [shipments, setShipments] = useState([]);

    useEffect(() => {
        // Fetch shipments from backend
        const fetchShipments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/shipments');
                setShipments(response.data);
            } catch (error) {
                console.error('Error fetching shipments:', error);
            }
        };

        fetchShipments();
    }, []);

    const deleteShipment = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/shipments/${id}`);
            setShipments(shipments.filter(shipment => shipment._id !== id));
        } catch (error) {
            console.error('Error deleting shipment:', error);
        }
    };

    return (
        <div className="shipments-container">
            <h2>View and Manage Shipments</h2>
            {/* Scrollable Table Container */}
            <div className="table-wrapper">
                <table className="shipments-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Carrier Address</th>
                            <th>Delivery Address</th>
                            <th>Shipment Date</th>
                            <th>Delivery Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map((shipment) => (
                            <tr key={shipment._id}>
                                <td>{shipment.shipmentId}</td>
                                <td>{shipment.carrierAddress}</td>
                                <td>{shipment.deliveryAddress}</td>
                                <td>{new Date(shipment.shipmentDate).toLocaleDateString()}</td>
                                <td>{new Date(shipment.deliveryDate).toLocaleDateString()}</td>
                                <td>
                                    <button onClick={() => deleteShipment(shipment._id)} className="delete-button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Shipments;
