import React from 'react';
import './Dashboard.css'; // Adjust the path if necessary
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Sample data for total sales and shipments
const data = [
  { region: 'North', sales: 4000, shipments: 2400, avgDeliveryTime: 2, performance: 95 },
  { region: 'South', sales: 3000, shipments: 1398, avgDeliveryTime: 3, performance: 90 },
  { region: 'East', sales: 2000, shipments: 9800, avgDeliveryTime: 1, performance: 98 },
  { region: 'West', sales: 2780, shipments: 3908, avgDeliveryTime: 4, performance: 85 },
];

// Sample statistics
const totalSales = 15000;
const totalShipments = 120;
const totalUsers = 50;

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <h2 className="dashboard-title">Welcome to the Admin Panel</h2>

      <div className="stats-container">
        <div className="stat-box">
          <h3>Total Sales</h3>
          <p className="stat-value">${totalSales}</p>
        </div>
        <div className="stat-box">
          <h3>Total Shipments</h3>
          <p className="stat-value">{totalShipments}</p>
        </div>
        <div className="stat-box">
          <h3>Total Users</h3>
          <p className="stat-value">{totalUsers}</p>
        </div>
      </div>

      <div className="dual-chart-container">
        <div className="chart-wrapper">
          <h3 className="chart-title">Average Delivery Time by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgDeliveryTime" fill="#ff7300" name="Average Delivery Time (days)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-wrapper">
          <h3 className="chart-title">Delivery Performance by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="performance" stroke="#387908" name="Delivery Performance (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
