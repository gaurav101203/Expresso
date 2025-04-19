import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './CreateShipment.css';

// Contract details
const CONTRACT_ADDRESS = '0x0f09ed7f79b2a73342be75298bfd81a71ba34e8c';
const CONTRACT_ABI = [        {
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
}]; // Define your contract ABI here

const CreateShipment = () => {
    const [shipmentData, setShipmentData] = useState({
        shipmentId: '',
        carrierAddress: '',
        deliveryAddress: '',
        shipmentDate: '',
        deliveryDate: '',
<<<<<<< HEAD
        recipientEmail: '',
        productname: '',
        quantity: ''
    });

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedQty, setSelectedQty] = useState(0);
    const [loading, setLoading] = useState(false);
    const [shipmentItems, setShipmentItems] = useState([]);
=======
        recipientEmail: '' // New field
    });

    const [loading, setLoading] = useState(false);
>>>>>>> dc12128f05b08c8ba8748db46f72fb47c53d087a

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

				const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
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
	
		
    // Handle email notification
    const sendEmailNotification = async () => {
        const subject = 'Shipment Confirmation';
        const body = `Your shipment (${shipmentData.shipmentId}) has been created and will be delivered to ${shipmentData.deliveryAddress} on ${shipmentData.deliveryDate}.`;

        try {
<<<<<<< HEAD
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

    // Reset the form after submission
=======
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];

                const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
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
                    onSuccess();
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

    const createShipmentInDatabase = async () => {
        const shipmentPayload = {
            shipmentId: shipmentData.shipmentId,
            carrierAddress: shipmentData.carrierAddress,
            deliveryAddress: shipmentData.deliveryAddress,
            shipmentDate: shipmentData.shipmentDate,
            deliveryDate: shipmentData.deliveryDate,
            recipientEmail: shipmentData.recipientEmail
        };

        try {
            const response = await axios.post('http://localhost:5000/api/shipments/create', shipmentPayload);
            return response.status === 201;
        } catch (error) {
            console.error('API Error:', error.response ? error.response.data : error.message);
            return false;
        }
    };

    const sendEmailNotification = async () => {
        const subject = 'Shipment Confirmation';
        const body = `Your shipment (${shipmentData.shipmentId}) has been created and will be delivered to ${shipmentData.deliveryAddress} on ${shipmentData.deliveryDate}.`;

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

>>>>>>> dc12128f05b08c8ba8748db46f72fb47c53d087a
    const resetForm = () => {
        setShipmentData({
            shipmentId: '',
            carrierAddress: '',
            deliveryAddress: '',
            shipmentDate: '',
            deliveryDate: '',
<<<<<<< HEAD
            recipientEmail: '',
            productname: '',
            quantity: ''
=======
            recipientEmail: ''
>>>>>>> dc12128f05b08c8ba8748db46f72fb47c53d087a
        });
        setShipmentItems([]);
    };

<<<<<<< HEAD
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
=======
    const handleSubmit = (e) => {
        e.preventDefault();
        createShipmentOnBlockchain();
>>>>>>> dc12128f05b08c8ba8748db46f72fb47c53d087a
    };

    return (
        <div className="create-shipment">
            <h2>Create a New Shipment</h2>
            <form>
                {/* Form fields for shipment data */}
                <div className="ship-group">
                    <label htmlFor="shipmentId">Shipment ID:</label>
                    <input type="number" id="shipmentId" name="shipmentId" value={shipmentData.shipmentId} onChange={handleChange} required />
                </div>
<<<<<<< HEAD
                <div className="ship-group">
                    <label htmlFor="carrierAddress">Carrier Name:</label>
=======
                <div className="form-group">
                    <label htmlFor="carrierAddress">Carrier Address:</label>
>>>>>>> dc12128f05b08c8ba8748db46f72fb47c53d087a
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
<<<<<<< HEAD
=======
                </div>
                <div className="form-group">
                    <label htmlFor="recipientEmail">Recipient Email:</label>
                    <input type="email" id="recipientEmail" name="recipientEmail" value={shipmentData.recipientEmail} onChange={handleChange} required />
>>>>>>> dc12128f05b08c8ba8748db46f72fb47c53d087a
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
                <button type="button" onClick={createShipmentOnBlockchain} disabled={loading}>
                    {loading ? 'Creating Shipment...' : 'Create Shipment'}
                </button>
            </form>
        </div>
    );
};

export default CreateShipment;