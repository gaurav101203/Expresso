// ShipmentsContext.js
import React, { createContext, useState } from 'react';

const ShipmentsContext = createContext();

export const ShipmentsProvider = ({ children }) => {
    const [shipments, setShipments] = useState([]);

    const addShipment = (newShipment) => {
        setShipments((prevShipments) => [...prevShipments, newShipment]);
    };

    const deleteShipment = (id) => {
        setShipments((prevShipments) => prevShipments.filter(shipment => shipment.id !== id));
    };

    return (
        <ShipmentsContext.Provider value={{ shipments, addShipment, deleteShipment }}>
            {children}
        </ShipmentsContext.Provider>
    );
};

export default ShipmentsContext;
