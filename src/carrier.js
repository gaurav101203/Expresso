import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './carrier.css';
import yourImage from './back.jpg';
import axios from 'axios';

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
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedQty, setSelectedQty] = useState(0);
    const [isQrScannerVisible, setIsQrScannerVisible] = useState(false); // New state for QR scanner visibility
    const [imageFile, setImageFile] = useState(null); // State to hold the uploaded image file

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

    const [shipmentData, setShipmentData] = useState({
        shipmentId: '',
        carrierAddress: '',
        deliveryAddress: '',
        shipmentDate: '',
        deliveryDate: '',
        recipientEmail: '',
        productname: '',       // <-- new
        quantity: ''           // <-- new
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setShipmentData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
        // Fetch categories from the backend
        useEffect(() => {
            axios
                .get('http://localhost:5000/api/categories')
                .then((response) => setCategories(response.data))
                .catch((error) => console.error('Error fetching categories:', error));
        }, []);
    
        // Handle category change
        const handleCategoryChange = (categoryId) => {
            setSelectedCategory(categoryId);
            setSelectedProductId('');
            setSelectedQty(0);
            axios
                .get(`http://localhost:5000/api/products/${categoryId}`)
                .then((response) => setProducts(response.data))
                .catch((error) => console.error('Error fetching products:', error));
        };
    
        // Handle product selection
        const handleProductChange = (productId) => {
            setSelectedProductId(productId);
            setSelectedQty(0);
        };
    
        // Handle quantity change
        const handleQtyChange = (e) => {
            setSelectedQty(Number(e.target.value));
        };
	const createShipmentInDatabase = async () => {
		const selectedProduct = products.find(p => p._id === selectedProductId);
	
		if (!selectedProduct) {
			alert("Invalid product selected.");
			return false;
		}
	
		if (selectedQty > selectedProduct.quantity) {
			alert(`Only ${selectedProduct.quantity} units available.`);
			return false;
		}
	
		const shipmentPayload = {
			shipmentId: shipmentData.shipmentId,
			carrierAddress: shipmentData.carrierAddress,
			deliveryAddress: shipmentData.deliveryAddress,
			shipmentDate: shipmentData.shipmentDate,
			deliveryDate: shipmentData.deliveryDate,
			recipientEmail: shipmentData.recipientEmail,
			productname: selectedProduct.name,
			quantity: selectedQty
		};
	
		try {
			const response = await axios.post('http://localhost:5000/api/shipments/create', shipmentPayload);
	
			if (response.status === 201) {
				// Deduct quantity from product
				await axios.put(`http://localhost:5000/api/products/update-quantity/${selectedProduct._id}`, {
					deductedQuantity: selectedQty
				});
	
				// Update local state
				setProducts(prev =>
					prev.map(p =>
						p._id === selectedProductId
							? { ...p, quantity: p.quantity - selectedQty }
							: p
					)
				);
	
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.error('API Error:', error.response ? error.response.data : error.message);
			return false;
		}
	};
    const sendEmailNotification = async () => {
        const subject = 'Shipment Confirmation';
        const body = `Your shipment ${shipmentData.shipmentId} ID has been created and will be delivered to ${shipmentData.deliveryAddress} on ${shipmentData.deliveryDate}.`;

        try {
            const res = await axios.post('http://localhost:5001/api/send-email', {
                subject,
                body,
                recipient: shipmentData.recipientEmail
            });
            console.log('Email sent:', res.data.message);
        } catch (err) {
            console.error('Email Error:', err.response?.data || err.message);
        }
    };
    const resetForm = () => {
		setShipmentData({
			shipmentId: '',
			carrierAddress: '',
			deliveryAddress: '',
			shipmentDate: '',
			deliveryDate: '',
			recipientEmail: '',
			productname: '',    // <-- reset
			quantity: ''        // <-- reset
		});
	};

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
                    if (window.ethereum) {
                        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
                        const web3 = new Web3(window.ethereum);
                        const accounts = await web3.eth.getAccounts();
                        const account = accounts[0];
        
                        const contract = new web3.eth.Contract(contractABI, contractAddress);
                        const shipmentId = parseInt(shipmentData.shipmentId, 10);
        
                        setLoading(true);
        
                        await contract.methods.createShipment(
                            shipmentId,
                            shipmentData.carrierAddress,
                            shipmentData.deliveryAddress
                        ).send({ from: account });
        
                        const dbSuccess = await createShipmentInDatabase();
                        if (dbSuccess) {
                            await sendEmailNotification(); // Send email from Flask
                            alert('Shipment created and email sent!');
                            resetForm();
                        } else {
                            alert('Shipment created on blockchain but DB entry failed.');
                        }
                    } else {
                        alert('Please install MetaMask!');
                    }
                } catch (error) {
                    console.error('Error creating shipment:', error);
                    alert('Failed to create shipment.');
                } finally {
                    setLoading(false);
                }
            };
            const handleSubmit = (e) => {
                e.preventDefault();
                createShipment();
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
                            <form onSubmit={handleSubmit}>
                            <div className="ship-group">
                                <label htmlFor="shipmentId">Shipment ID:</label>
                                <input type="number" id="shipmentId" name="shipmentId" value={shipmentData.shipmentId} onChange={handleChange} required />
                            </div>
                            <div className="ship-group">
                                <label htmlFor="carrierAddress">Carrier Address:</label>
                                <input type="text" id="carrierAddress" name="carrierAddress" value={shipmentData.carrierAddress} onChange={handleChange} required />
                            </div>
                            <div className="ship-group">
                                <label htmlFor="deliveryAddress">Delivery Address:</label>
                                <input type="text" id="deliveryAddress" name="deliveryAddress" value={shipmentData.deliveryAddress} onChange={handleChange} required />
                            </div>
                            <div className="ship-group">
                                <label htmlFor="shipmentDate">Shipment Date:</label>
                                <input type="date" id="shipmentDate" name="shipmentDate" value={shipmentData.shipmentDate} onChange={handleChange} required />
                            </div>
                            <div className="ship-group">
                                <label htmlFor="deliveryDate">Delivery Date:</label>
                                <input type="date" id="deliveryDate" name="deliveryDate" value={shipmentData.deliveryDate} onChange={handleChange} required />
                            </div>
                            <div className="ship-group" style={{ marginBottom: '16px' }}>
                                <label htmlFor="recipientEmail">Recipient Email:</label>
                                <input type="email" id="recipientEmail" name="recipientEmail" value={shipmentData.recipientEmail} onChange={handleChange} required />
                            </div>
                                            {/* Category and product selection */}
                <div className="ship-group">
                    <label htmlFor="category">Category:</label>
                    <select
                        name="category"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
				<div className="ship-group">
				<label htmlFor="product">Product:</label>
				<select
					name="product"
					value={selectedProductId}
					onChange={(e) => handleProductChange(e.target.value)}
					required
				>
					<option value="">Select Product</option>
					{products.map((product) => (
						<option key={product._id} value={product._id}>
							{product.name} (Available: {product.quantity})
						</option>
					))}
				</select>
			</div>
            <div className="ship-group">
                    <label htmlFor="quantity">Quantity:</label>
                    <input type="number" id="quantity" value={selectedQty} onChange={handleQtyChange} required />
                </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Creating Shipment...' : 'Create Shipment'}
                            </button>
                        </form>
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
