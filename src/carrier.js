import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './carrier.css';
import yourImage from './back.jpg';

// Import your images
import shipmentImage from './create.png';
import updateIcon from './update.png';
import deliverIcon from './deliver.png';
import statusIcon from './status.jpg';
import logo from './Expresso.png';

const LogisticsManagement = () => {
    const [web3, setWeb3] = useState(null);
    const [logisticsContract, setLogisticsContract] = useState(null);
    const [activeForm, setActiveForm] = useState(null);
    const [shipmentIdUpdate, setShipmentIdUpdate] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [shipmentIdDeliver, setShipmentIdDeliver] = useState('');
    const [shipmentIdStatus, setShipmentIdStatus] = useState('');
    const [shipmentIdCreate, setShipmentIdCreate] = useState('');
    const [carrier, setCarrier] = useState('');
    const [recipient, setRecipient] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [isScannerActive, setIsScannerActive] = useState(false);
    const [isQrScannerVisible, setIsQrScannerVisible] = useState(false); // New state for QR scanner visibility
    const [imageFile, setImageFile] = useState(null); // State to hold the uploaded image file

    const contractAddress = '0xff77e3911b7297202ef65ea0a3fbe424b69d94d7';
    const contractABI = [ {
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
    }
    ];

    useEffect(() => {
        initWeb3();
    }, []);

    useEffect(() => {
        if (activeForm) {
            if (isScannerActive) {
                startScanning();
            } else {
                stopScanning();
            }
        } else {
            stopScanning();
        }
    }, [activeForm, isScannerActive]);

    useEffect(() => {
        if (isQrScannerVisible) {
            startScanning();
        } else {
            stopScanning();
        }
    }, [isQrScannerVisible]); // Added useEffect for QR scanner visibility

    const initWeb3 = async () => {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            try {
                await window.ethereum.enable();
                initContract(web3Instance);
            } catch (error) {
                console.error('User denied account access');
            }
        } else {
            console.error('No web3 provider detected. Consider using MetaMask.');
        }
    };

    const initContract = (web3Instance) => {
        const contract = new web3Instance.eth.Contract(contractABI, contractAddress);
        setLogisticsContract(contract);
    };

    const createShipment = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const fromAddress = accounts[0];
            await logisticsContract.methods.createShipment(shipmentIdCreate, carrier, recipient).send({ from: fromAddress });
            alert('Shipment created successfully!');
            closeForm();
        } catch (error) {
            alert('Error creating shipment: ' + error.message);
            console.error('Error creating shipment:', error);
        }
    };

    const updateShipmentLocation = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const fromAddress = accounts[0];
            const transaction = await logisticsContract.methods
                .updateShipmentLocation(shipmentIdUpdate, newLocation)
                .send({ from: fromAddress });

            if (transaction.status) {
                alert('Shipment location updated successfully!');
                closeForm();
            } else {
                alert('Transaction failed');
            }
        } catch (error) {
            console.error('Error updating shipment location:', error);
            alert('Error: ' + error.message);
        }
    };

    const deliverShipment = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const fromAddress = accounts[0];
            await logisticsContract.methods.deliverShipment(shipmentIdDeliver).send({ from: fromAddress });
            alert('Shipment delivered successfully!');
            closeForm();
        } catch (error) {
            console.error('Error delivering shipment:', error);
            alert('Error: ' + error.message);
        }
    };

    const getShipmentStatus = async () => {
        try {
            const status = await logisticsContract.methods.getShipmentStatus(shipmentIdStatus).call();
            const shipmentStatus = status ? 'Delivered' : 'In transit';
            setStatusMessage(shipmentStatus);
        } catch (error) {
            console.error('Error getting shipment status:', error);
            alert('Error: ' + error.message);
        }
    };

    const startScanning = () => {
        const scannerElement = document.getElementById("reader");
        if (scannerElement) {
            let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
            html5QrcodeScanner.render(onScanSuccess);
        } else {
            console.error("Element with id 'reader' not found.");
        }
    };

    const stopScanning = () => {
        const scannerElement = document.getElementById("reader");
        if (scannerElement) {
            scannerElement.innerHTML = ""; // Clear the scanner element
        }
        setIsQrScannerVisible(false); // Hide the QR scanner
    };

    const onScanSuccess = (decodedText) => {
        if (activeForm === 'create') {
            setCarrier(decodedText);
        } else if (activeForm === 'update') {
            setNewLocation(decodedText);
        }
        setIsQrScannerVisible(false); // Hide scanner after a successful scan
    };

    const toggleForm = (form) => {
        setActiveForm(activeForm === form ? null : form);
        setIsScannerActive(false);
    };

    const toggleScanner = () => {
        setIsQrScannerVisible(!isQrScannerVisible); // Toggle QR scanner visibility
    };

    const closeForm = () => {
        setActiveForm(null);
        setShipmentIdUpdate('');
        setNewLocation('');
        setShipmentIdDeliver('');
        setShipmentIdStatus('');
        setShipmentIdCreate('');
        setCarrier('');
        setRecipient('');
        setStatusMessage('');
        setIsQrScannerVisible(false); // Reset QR scanner visibility
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                // Assuming the image is a QR code, we can decode it using a QR code library
                // For example, using `jsqr` or similar libraries
                // Here we should implement the logic to decode the QR code from the image
                // For this placeholder, let's log the file name
                console.log("File uploaded:", file.name);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleLogout = () => {
        // Clear user data
        setCarrier('');
        setRecipient('');
        setShipmentIdCreate('');
        setShipmentIdUpdate('');
        setNewLocation('');
        setShipmentIdDeliver('');
        setShipmentIdStatus('');
        setStatusMessage('');
        setIsQrScannerVisible(false);

        // Redirect to login page
        window.location.href = '/login'; // Adjust as necessary
    };
    return (
        
        <div className="logistics-container">
            <nav className="navbar">
                    <img src={logo} alt="Logo" className="logo" />
                    <h1 className="brand-name">Expresso Logistics</h1>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
            </nav>
            

            <section className="content">
                <div className="section-container">
                    <div className="section" onClick={() => toggleForm('create')}>
                        <img src={shipmentImage} alt="Create Shipment" className="section-image" />
                        <h2>Create</h2>
                    </div>
                    <div className="section" onClick={() => toggleForm('update')}>
                        <img src={updateIcon} alt="Update" className="section-image" />
                        <h2>Update</h2>
                    </div>
                    <div className="section" onClick={() => toggleForm('deliver')}>
                        <img src={deliverIcon} alt="Deliver" className="section-image" />
                        <h2>Deliver</h2>
                    </div>
                    <div className="section" onClick={() => toggleForm('status')}>
                        <img src={statusIcon} alt="Check Status" className="section-image" />
                        <h2>Status</h2>
                    </div>
                </div>

                {/* Forms for different actions */}
                {activeForm && (
                    <div className="form-container active" onClick={closeForm}>
                        <div className="form" onClick={(e) => e.stopPropagation()}>
                            {/* Create Shipment Section */}
                            {activeForm === 'create' && (
                                <>
                                    <h3>Create Shipment</h3>
                                    <input
                                        type="text"
                                        id="shipmentId"
                                        placeholder="Shipment ID"
                                        value={shipmentIdCreate}
                                        onChange={(e) => setShipmentIdCreate(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        id="carrier"
                                        placeholder="Carrier"
                                        value={carrier}
                                        onChange={(e) => setCarrier(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        id="recipient"
                                        placeholder="Recipient"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        required
                                    />
                                    <button onClick={createShipment}>Create Shipment</button>
                                    {/* QR Code Scanner Button */}
                                    <div className="qr-container">
                                        <img src={require('./qr.png')} // Replace with your actual path
                                            alt="Scan QR Code"
                                            className="qr-icon"
                                            onClick={toggleScanner} // Trigger scanner on click
                                            />
                                    </div>
                                        {isQrScannerVisible ? 'Hide Scanner' : 'Scan QR Code'}
                                </>
                            )}

                            {/* Update Shipment Section */}
                            {activeForm === 'update' && (
                                <>
                                    <h3>Update Shipment Location</h3>
                                    <input
                                        type="text"
                                        placeholder="Shipment ID"
                                        value={shipmentIdUpdate}
                                        onChange={(e) => setShipmentIdUpdate(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="New Location"
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        required
                                    />
                                    <button onClick={updateShipmentLocation}>Update Location</button>
                                    {/* QR Code Scanner Button */}
                                    <div className="qr-container">
                                        <img src={require('./qr.png')} // Replace with your actual path
                                            alt="Scan QR Code"
                                            className="qr-icon"
                                            onClick={toggleScanner} // Trigger scanner on click
                                            />
                                    </div>
                                        {isQrScannerVisible ? 'Hide Scanner' : 'Scan QR Code'}
                                    
                                </>
                            )}

                            {/* Deliver Shipment Section */}
                            {activeForm === 'deliver' && (
                                <>
                                    <h3>Deliver Shipment</h3>
                                    <input
                                        type="text"
                                        placeholder="Shipment ID"
                                        value={shipmentIdDeliver}
                                        onChange={(e) => setShipmentIdDeliver(e.target.value)}
                                        required
                                    />
                                    <button onClick={deliverShipment}>Deliver Shipment</button>
                                </>
                            )}

                            {/* Check Shipment Status Section */}
                            {activeForm === 'status' && (
                                <>
                                    <h3>Check Shipment Status</h3>
                                    <input
                                        type="text"
                                        placeholder="Shipment ID"
                                        value={shipmentIdStatus}
                                        onChange={(e) => setShipmentIdStatus(e.target.value)}
                                        required
                                    />
                                    <button onClick={getShipmentStatus}>Get Status</button>
                                    {statusMessage && <p>Status: {statusMessage}</p>}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* QR Scanner Modal */}
                {isQrScannerVisible && (
                    <div className="qr-scanner-container">
                        <div className="qr-scanner">
                            <h3>QR Scanner</h3>
                            <div id="reader"></div>
                            <button onClick={toggleScanner} className="close-scanner-btn">Close</button>
                        </div>
                    </div>
                )}
            </section>

            {/* Footer Section */}
            <footer className="footer">
                <p>&copy; 2024 Expresso Logistics. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default LogisticsManagement;
