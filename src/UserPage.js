import React, { useState, useEffect } from "react";
import Web3 from "web3";
import './UserPage.css';
import chatbotIcon from './chatbot.png'; // Chatbot icon image
import locationImg from './location.jpg';
import statusImg from './status.jpg';
import IconImg from './Expresso.png';

const CONTRACT_ADDRESS = "0xff77e3911b7297202ef65ea0a3fbe424b69d94d7";
const CONTRACT_ABI = [ {
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
    // Your contract ABI here...
];

const LogisticsManagement = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [locationShipmentId, setLocationShipmentId] = useState("");
    const [statusShipmentId, setStatusShipmentId] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [chatbotMessages, setChatbotMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    
    const predefinedQueries = [
        { question: "1. How to track my shipment?", response: "You can track your shipment by entering your Shipment ID in the 'Check Shipment Location' section." },
        { question: "2. How to know the status of my shipment?", response: "You can check the delivery status by entering your Shipment ID in the 'Check Shipment Status' section." },
        { question: "3. How to contact support?", response: "Please email our support at support@expresso.com or call +1234567890." },
    ];

    useEffect(() => {
        // Initialize Web3 and contract
        const initWeb3 = async () => {
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                setWeb3(web3Instance);
                setContract(contractInstance);
            } else {
                alert("Please install MetaMask or another Ethereum wallet.");
            }
        };
        initWeb3();
    }, []);

    const getShipmentLocation = async () => {
        if (!contract || !locationShipmentId) return;
        setLoadingLocation(true);
        try {
            const location = await contract.methods.getShipmentLocation(locationShipmentId).call();
            alert(`Location for shipment ID ${locationShipmentId} is ${location}.`); // Show alert for location
        } catch (error) {
            alert("Error retrieving location: " + error.message); // Show alert for error
            console.error(error);
        } finally {
            setLoadingLocation(false);
        }
    };
    
    
    const getShipmentStatus = async () => {
        if (!contract || !statusShipmentId) return;
        setLoadingStatus(true);
        try {
            const status = await contract.methods.getShipmentStatus(statusShipmentId).call();
            alert(`Status for shipment ID ${statusShipmentId} is ${status ? 'Delivered' : 'Not Delivered'}.`); // Show alert for status
        } catch (error) {
            alert("Error retrieving status: " + error.message); // Show alert for error
            console.error(error);
        } finally {
            setLoadingStatus(false);
        }
    };


    const handleSectionClick = (section) => {
        setActiveSection(section);
    };

    const toggleChatbot = () => {
        setChatbotOpen(!chatbotOpen);
    };

    const handlePredefinedQuery = (response) => {
        setChatbotMessages([...chatbotMessages, { sender: "bot", text: response }]);
    };

    const handleUserInput = () => {
        if (userInput.trim() !== "") {
            setChatbotMessages([...chatbotMessages, { sender: "user", text: userInput }]);
            // Mock bot response based on user input, can be customized based on backend response
            if (userInput === "1") {
                handlePredefinedQuery(predefinedQueries[0].response);
            } else if (userInput === "2") {
                handlePredefinedQuery(predefinedQueries[1].response);
            } else if (userInput === "3") {
                handlePredefinedQuery(predefinedQueries[2].response);
            } else {
                setChatbotMessages([...chatbotMessages, { sender: "bot", text: "I'm here to assist. Please select from the available options or enter a valid query." }]);
            }
            setUserInput("");
        }
    };

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar">
                <div className="contain">
                    <div className="logo-container">
                        <img src={IconImg} alt="Logo" className="logo" />
                    </div>
                    <h1 className="heading">Expresso</h1>
                    <button className="logout-button" onClick={() => window.location.href = '/login'}>Logout</button>
                </div>
            </nav>

            {/* Main Content with clickable sections */}
            <section className="content">
                <div className="section-container">
                    <div className="section" onClick={() => handleSectionClick('location')}>
                        <img src={locationImg} alt="Location" className="section-image" />
                        <h2>Check Shipment Location</h2>
                    </div>
                    <div className="section" onClick={() => handleSectionClick('status')}>
                        <img src={statusImg} alt="Status" className="section-image" />
                        <h2>Check Shipment Status</h2>
                    </div>
                </div>
            </section>

            {/* Form Container for Shipment Location */}
            {activeSection === 'location' && (
                <div className="form-container">
                    <div className="form">
                        <h3>Shipment Location</h3>
                        <label htmlFor="shipmentIdLocation">Shipment ID:</label>
                        <input
                            type="text"
                            id="shipmentIdLocation"
                            value={locationShipmentId}
                            onChange={(e) => setLocationShipmentId(e.target.value)}
                            placeholder="Enter Shipment ID"
                            required
                        />
                        <button onClick={getShipmentLocation} disabled={loadingLocation}>
                            {loadingLocation ? 'Loading...' : 'Check Location'}
                        </button>
                        <p>{locationMessage}</p>
                        <button onClick={() => setActiveSection(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Form Container for Shipment Status */}
            {activeSection === 'status' && (
                <div className="form-container">
                    <div className="form">
                        <h3>Shipment Status</h3>
                        <label htmlFor="shipmentIdStatus">Shipment ID:</label>
                        <input
                            type="text"
                            id="shipmentIdStatus"
                            value={statusShipmentId}
                            onChange={(e) => setStatusShipmentId(e.target.value)}
                            placeholder="Enter Shipment ID"
                            required
                        />
                        <button onClick={getShipmentStatus} disabled={loadingStatus}>
                            {loadingStatus ? 'Loading...' : 'Check Status'}
                        </button>
                        <p>{statusMessage}</p>
                        <button onClick={() => setActiveSection(null)}>Close</button>
                    </div>
                </div>
            )}


            {/* Chatbot Icon */}
            <div className="chatbot-icon" onClick={toggleChatbot}>
                <img src={chatbotIcon} alt="Chatbot" />
            </div>

{/* Chatbot Modal */}
{chatbotOpen && (
    <div className="chatbot-modal">
        <div className="chatbot-content">
            <h3>Chat with Us</h3>
            <div className="chatbot-messages">
                {chatbotMessages.map((msg, index) => (
                    <p key={index} className={msg.sender === "bot" ? "bot-message" : "user-message"}>
                        {msg.text}
                    </p>
                ))}
            </div>
            <div className="predefined-queries">
                <p>Choose from the following options by typing the option number:</p>
                {predefinedQueries.map((query, index) => (
                    <p key={index}>
                        {query.question}
                    </p>
                ))}
            </div>
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type a message or enter an option number"
                className="user-input"
            />
            <button onClick={handleUserInput} className="send-button">Send</button>
            <button onClick={toggleChatbot}>Close Chat</button>
        </div>
    </div>
)}


            {/* Footer */}
            <footer>
                <div className="footer">
                    <p>&copy; 2024 Logistics Management</p>
                </div>
            </footer>
        </div>
    );
};

export default LogisticsManagement;
