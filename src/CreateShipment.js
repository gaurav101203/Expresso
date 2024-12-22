import axios from 'axios';
import React, { useState } from 'react';
import Web3 from 'web3'; // Import Web3
import './CreateShipment.css';

// Define your contract's address and ABI here
const CONTRACT_ADDRESS = '0xff77e3911b7297202ef65ea0a3fbe424b69d94d7'; // Your deployed contract address
const CONTRACT_ABI = [  {
    "anonymous": false,
    "inputs": [
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "shipmentId",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "deliveryTimestamp",
            "type": "uint256"
        }
    ],
    "name": "ShipmentDelivered",
    "type": "event"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_shipmentId",
            "type": "uint256"
        },
        {
            "internalType": "address",
            "name": "_carrier",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "_recipient",
            "type": "address"
        }
    ],
    "name": "createShipment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_shipmentId",
            "type": "uint256"
        }
    ],
    "name": "deliverShipment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_shipmentId",
            "type": "uint256"
        }
    ],
    "name": "getShipmentLocation",
    "outputs": [
        {
            "internalType": "string",
            "name": "",
            "type": "string"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_shipmentId",
            "type": "uint256"
        }
    ],
    "name": "getShipmentStatus",
    "outputs": [
        {
            "internalType": "bool",
            "name": "delivered",
            "type": "bool"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "name": "shipmentLocations",
    "outputs": [
        {
            "internalType": "string",
            "name": "",
            "type": "string"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "name": "shipments",
    "outputs": [
        {
            "internalType": "address",
            "name": "sender",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "carrier",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
        },
        {
            "internalType": "bool",
            "name": "delivered",
            "type": "bool"
        },
        {
            "internalType": "string",
            "name": "currentLocation",
            "type": "string"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_shipmentId",
            "type": "uint256"
        },
        {
            "internalType": "string",
            "name": "_newLocation",
            "type": "string"
        }
    ],
    "name": "updateShipmentLocation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}/* Your contract ABI here */ ];

const CreateShipment = ({ onSuccess }) => {
    const [shipmentData, setShipmentData] = useState({
        shipmentId: '',
        carrierAddress: '',
        deliveryAddress: '',
        shipmentDate: '',
        deliveryDate: ''
    });
    const [loading, setLoading] = useState(false); // Loading state

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShipmentData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const createShipmentOnBlockchain = async () => {
        try {
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];

                // Create contract instance
                const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

                // Convert shipmentId to uint256
                const shipmentId = parseInt(shipmentData.shipmentId, 10);
                console.log('Sending transaction with:', {
                    shipmentId,
                    carrierAddress: shipmentData.carrierAddress,
                    deliveryAddress: shipmentData.deliveryAddress,
                });

                // Set loading state
                setLoading(true);

                // Send the transaction to create the shipment
                const tx = await contract.methods.createShipment(
                    shipmentId,
                    shipmentData.carrierAddress,
                    shipmentData.deliveryAddress,
                ).send({ from: account });

                console.log('Transaction successful:', tx);

                // Call API to create the shipment in the database
                const dbSuccess = await createShipmentInDatabase(); // Call to create shipment in the database

                // Show success message for both operations
                if (dbSuccess) {
                    alert('Shipment created successfully in the blockchain and database!'); // Show success message
                    resetForm(); // Reset form fields
                    onSuccess(); // Call onSuccess to refresh or redirect
                } else {
                    alert('Failed to create shipment in the database. Please try again later.');
                }
            } else {
                alert('Please install MetaMask!');
            }
        } catch (error) {
            console.error('Error creating shipment:', error);
            alert('Failed to create shipment. Please try again later.'); // Show failure message
        } finally {
            setLoading(false); // Reset loading state regardless of success or failure
        }
    };
    const createShipmentInDatabase = async () => {
        const shipmentPayload = {
            shipmentId: shipmentData.shipmentId,
            carrierAddress: shipmentData.carrierAddress,
            deliveryAddress: shipmentData.deliveryAddress,
            shipmentDate: shipmentData.shipmentDate,
            deliveryDate: shipmentData.deliveryDate,
        };
    
        try {
            console.log('Sending API request to create shipment in the database:', shipmentPayload);
            const response = await axios.post('http://localhost:5000/api/shipments/create', shipmentPayload);
            console.log('API Response:', response.data); // Log the successful response
            return response.status === 201; // Check for 201 Created
        } catch (error) {
            console.error('API Error:', error.response ? error.response.data : error.message);
            return false; // Indicate failure
        }
    };
    
    const resetForm = () => {
        setShipmentData({
            shipmentId: '',
            carrierAddress: '',
            deliveryAddress: '',
            shipmentDate: '',
            deliveryDate: ''
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createShipmentOnBlockchain(); // Call the function to create shipment on the blockchain
    };

    return (
        <div className="create-shipment">
            <h2>Create a New Shipment</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="shipmentId">Shipment ID:</label>
                    <input
                        type="number" // Changed to number for shipment ID
                        id="shipmentId"
                        name="shipmentId"
                        value={shipmentData.shipmentId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="carrierAddress">Carrier Address:</label>
                    <input
                        type="text"
                        id="carrierAddress"
                        name="carrierAddress"
                        value={shipmentData.carrierAddress}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="deliveryAddress">Delivery Address:</label>
                    <input
                        type="text"
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={shipmentData.deliveryAddress}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="shipmentDate">Shipment Date:</label>
                    <input
                        type="date"
                        id="shipmentDate"
                        name="shipmentDate"
                        value={shipmentData.shipmentDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="deliveryDate">Delivery Date:</label>
                    <input
                        type="date"
                        id="deliveryDate"
                        name="deliveryDate"
                        value={shipmentData.deliveryDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Creating Shipment...' : 'Create Shipment'}
                </button>
            </form>
        </div>
    );
};

export default CreateShipment;
