import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import './DashboardSummaryPage.css';

const DashboardSummaryPage = () => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const { data } = await axios.get('/api/admin/dashboard-summary', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setSummary(data);
            } catch (err) {
                console.error('Error fetching dashboard summary:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) return <div className="loading">📊 Loading dashboard...</div>;
    if (!summary) return <div className="error">⚠️ Failed to load dashboard data.</div>;

    const pieData = [
        { name: 'Users', value: summary.totalUsers },
        { name: 'Vendors', value: summary.totalVendors },
        { name: 'Products', value: summary.totalProducts },
        { name: 'Orders', value: summary.totalOrders },
    ];

    const barData = [
        { name: 'Users', count: summary.totalUsers },
        { name: 'Vendors', count: summary.totalVendors },
        { name: 'Products', count: summary.totalProducts },
        { name: 'Orders', count: summary.totalOrders },
    ];

    return (
        <div className="dashboard-summary-page">
            <h1>📈 Dashboard Summary</h1>

            <div className="summary-cards">
                <div className="summary-card"><h3>👥 Users</h3><p>{summary.totalUsers}</p></div>
                <div className="summary-card"><h3>🏪 Vendors</h3><p>{summary.totalVendors}</p></div>
                <div className="summary-card"><h3>📦 Products</h3><p>{summary.totalProducts}</p></div>
                <div className="summary-card"><h3>🛒 Orders</h3><p>{summary.totalOrders}</p></div>
            </div>

            <div className="charts-section">
                <div className="chart-box">
                    <h2>📊 Overview (Bar Chart)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-box">
                    <h2>📈 Distribution (Pie Chart)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardSummaryPage;