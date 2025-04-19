import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye } from 'react-icons/fa';
import Web3 from 'web3';
import './Shipments.css';

const Shipments = () => {
        const [activeSection, setActiveSection] = useState(null);
        const [locationMessage, setLocationMessage] = useState("");
            const [shipmentIdUpdate, setShipmentIdUpdate] = useState('');
        const [web3, setWeb3] = useState(null);
        const [loadingLocation, setLoadingLocation] = useState(false);
        const [loadingStatus, setLoadingStatus] = useState(false);
        const [chatbotOpen, setChatbotOpen] = useState(false);
        const [chatbotMessages, setChatbotMessages] = useState([]);
        const [userInput, setUserInput] = useState("");
            const [shipmentIdDeliver, setShipmentIdDeliver] = useState('');
        const [contract, setContract] = useState(null);
    const [shipments, setShipments] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');
    const [shipmentId, setShipmentId] = useState('');
    const [locationShipmentId, setLocationShipmentId] = useState("");
    const [statusShipmentId, setStatusShipmentId] = useState("");
    const [newLocation, setNewLocation] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [logisticsContract, setLogisticsContract] = useState(null);

    const contractAddress = '0x0f09ed7f79b2a73342be75298bfd81a71ba34e8c';
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_shipmentId",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_carrier",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_recipient",
                    "type": "string"
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
                    "internalType": "string",
                    "name": "_newLocation",
                    "type": "string"
                }
            ],
            "name": "updateShipmentLocation",
            "outputs": [],
            "stateMutability": "nonpayable",
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
                    "internalType": "string",
                    "name": "carrier",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "recipient",
                    "type": "string"
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
        }
    ];

    // Fetch shipments from backend
    useEffect(() => {
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
    useEffect(() => {
        console.log('Web3 Initialized:', web3);
        console.log('Contract Initialized:', logisticsContract);
    }, [web3, logisticsContract]);
    
    // Initialize Web3 and Contract
    useEffect(() => {
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const contract = new web3Instance.eth.Contract(contractABI, contractAddress);
                    setLogisticsContract(contract);
                } catch (error) {
                    console.error('User denied account access', error);
                }
            } else {
                console.error('No web3 provider detected. Consider using MetaMask.');
            }
        };
        
        
        initWeb3();
    }, []);
    
    const getShipmentLocation = async () => {
        if (!logisticsContract || !locationShipmentId) {
            alert("Please enter a valid shipment ID.");
            return;
        }
        setLoadingLocation(true);
        try {
            const location = await logisticsContract.methods.getShipmentLocation(locationShipmentId).call();
            alert(`Location for shipment ID ${locationShipmentId} is ${location}.`); // Show alert for location
        } catch (error) {
            alert("Error retrieving location: " + error.message); // Show alert for error
            console.error(error);
        } finally {
            setLoadingLocation(false);
        }
    };
    
    const updateShipmentLocation = async () => {
        if (!logisticsContract || !shipmentIdUpdate || !newLocation) {
            alert("Please enter shipment ID and new location.");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const fromAddress = accounts[0];
    
            const transaction = await logisticsContract.methods
                .updateShipmentLocation(shipmentIdUpdate, newLocation)
                .send({ from: fromAddress });
    
            if (transaction.status) {
                alert('Shipment location updated successfully!');
            } else {
                alert('Transaction failed');
            }
        } catch (error) {
            console.error('Error updating shipment location:', error);
            alert('Error: ' + error.message);
        }
    };
    
    const deliverShipment = async () => {
        if (!logisticsContract || !shipmentIdDeliver) {
            alert("Please enter a valid shipment ID.");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const fromAddress = accounts[0];
    
            await logisticsContract.methods.deliverShipment(shipmentIdDeliver).send({ from: fromAddress });
    
            alert('Shipment delivered successfully!');
        } catch (error) {
            console.error('Error delivering shipment:', error);
            alert('Error: ' + error.message);
        }
    };
    
    const deleteShipment = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/shipments/${id}`);
            setShipments(shipments.filter(shipment => shipment._id !== id));
        } catch (error) {
            console.error('Error deleting shipment:', error);
        }
    };
    

    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => {
        setIsPopupOpen(false);
        setShipmentId('');
        setNewLocation('');
        setStatusMessage('');
    };

    const handleOptionChange = (e) => setSelectedOption(e.target.value);

    // Function to toggle popup
const togglePopup = () => {
    setIsPopupOpen((prev) => !prev); // Toggle state
};

const Shipments = () => {
    const [shipments, setShipments] = useState([]);

    // Fetch shipments from the backend
    const fetchShipments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/shipments');
            setShipments(response.data);
        } catch (error) {
            console.error('Error fetching shipments:', error);
        }
    };

    useEffect(() => {
        fetchShipments();  // Initial fetch when component mounts
    }, []);
};
    return (
        <div className="shipments-container">
            <h2>View and Manage Shipments</h2>
            
            <FaEye className="eye-icon" onClick={togglePopup} />


            <div className="table-wrapper">
                <table className="shipments-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Carrier Name</th>
                            <th>Delivery Address</th>
                            <th>Shipment Date</th>
                            <th>Delivery Date</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
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
                                <td>{shipment.productname}</td> {/* Display product name */}
                                <td>{shipment.quantity}</td> {/* Display quantity */}
                                <td>
                                    <button onClick={() => deleteShipment(shipment._id)} className="delete-button">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isPopupOpen && (
    <div className="popup-container">
        <div className="popup-content">
            <h3>Select Action</h3>
            <select value={selectedOption} onChange={handleOptionChange}>
                <option value="">-- Select --</option>
                <option value="deliver">Deliver Shipment</option>
                <option value="location">Current Location</option>
                <option value="update">Update Shipment Location</option>
            </select>

            {selectedOption && (
    <div className="input-section">
        <label>Enter Shipment ID:</label>
        <input 
            type="text" 
            value={selectedOption === "deliver" ? shipmentIdDeliver :
                   selectedOption === "location" ? locationShipmentId :
                   selectedOption === "update" ? shipmentIdUpdate : ""}
            onChange={(e) => {
                if (selectedOption === "deliver") setShipmentIdDeliver(e.target.value);
                else if (selectedOption === "location") setLocationShipmentId(e.target.value);
                else if (selectedOption === "update") setShipmentIdUpdate(e.target.value);
            }}
            placeholder="Enter shipment ID" 
        />
    </div>
)}


            {selectedOption === 'update' && (
                <div className="input-section">
                    <label>Enter New Location:</label>
                    <input 
                        type="text" 
                        value={newLocation} 
                        onChange={(e) => setNewLocation(e.target.value)} 
                        placeholder="Enter new location" 
                    />
                </div>
            )}

            {statusMessage && <p className="status-message">{statusMessage}</p>}

            <div className="popup-actions">
    {selectedOption === 'deliver' && (
        <button onClick={deliverShipment}>Get Delivered</button>
    )}

    {selectedOption === 'location' && (
        <button onClick={getShipmentLocation}>Get Current Location</button>
    )}

    {selectedOption === 'update' && (
        <button onClick={updateShipmentLocation}>Update Location</button>
    )}

            </div>
        </div>
    </div>
)}

        </div>
    );
};

export default Shipments;
