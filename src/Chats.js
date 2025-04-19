import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './chats.css';
const Chat = () => {
    const [users, setUsers] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socket = io('http://localhost:5000'); // Connect to backend socket server

    useEffect(() => {
        // Fetch all users from the backend
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/chat/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();

        // Listen for incoming messages
        socket.on('receiveMessage', (data) => {
            if (data.senderId === activeChat?.userId) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            }
        });

        // Cleanup on component unmount
        return () => {
            socket.off('receiveMessage');
        };
    }, [activeChat]);

    // Handle clicking on a user
    const handleUserClick = (user) => {
        setActiveChat(user); // Set the clicked user as the active chat
        socket.emit('joinChat', { userId: user._id, socketId: socket.id }); // Notify the server that the user has joined
    };

    // Handle sending messages
    const handleSendMessage = () => {
        if (message.trim() === '') return;

        socket.emit('sendMessage', {
            senderId: 'user_id_here', // Replace with logged-in user's ID
            message: message,
            receiverId: activeChat._id, // Receiver's user ID
        });

        setMessages((prevMessages) => [...prevMessages, { message, senderId: 'user_id_here' }]);
        setMessage('');
    };

    return (
        <div className="chat-container">
            <div className="user-list">
                <h3>User List</h3>
                {users.map((user) => (
                    <div key={user._id} onClick={() => handleUserClick(user)} className="user-item">
                        <p>{user.username}</p>
                    </div>
                ))}
            </div>

            {activeChat && (
                <div className="chat-box">
                    <h3>Chat with {activeChat.username}</h3>
                    <div className="messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.senderId === 'user_id_here' ? 'sent' : 'received'}`}>
                                <p>{msg.message}</p>
                            </div>
                        ))}
                    </div>
                    <div className="message-input">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
