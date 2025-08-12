import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaBoxOpen, FaCog, FaImages, FaChartBar} from 'react-icons/fa';
import './AdminDashboard.css'; // <-- नई CSS फाइल

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div className="dashboard-grid">
                <Link to="/admin/vendors" className="dashboard-card-link">
                    <div className="dashboard-card">
                        <FaUsers className="dashboard-card-icon" />
                        <h3>Manage Vendors</h3>
                        <p>Approve, suspend, or block vendors.</p>
                    </div>
                </Link>
                <Link to="/admin/orders" className="dashboard-card-link">
                    <div className="dashboard-card">
                        <FaClipboardList className="dashboard-card-icon" />
                        <h3>Manage Orders</h3>
                        <p>View and manage all orders.</p>
                    </div>
                </Link>
                <Link to="/admin/products" className="dashboard-card-link">
                    <div className="dashboard-card">
                        <FaBoxOpen className="dashboard-card-icon" />
                        <h3>Manage Products</h3>
                        <p>View or delete any product.</p>
                    </div>
                </Link>
                <Link to="/admin/manage-banners" className="dashboard-card-link">
                    <div className="dashboard-card">
                        <FaImages className="dashboard-card-icon" />
                        <h3>Manage Banners</h3>
                        <p>Add or remove promotional banners.</p>
                    </div>
                </Link>
               
                <Link to="/admin/settings" className="dashboard-card-link">
                    <div className="dashboard-card">
                        <FaCog className="dashboard-card-icon" />
                        <h3>App Settings</h3>
                        <p>Manage delivery rules and more.</p>
                    </div>
                </Link>
                <Link to="/admin/vendor-sales" className="dashboard-card-link">
    <div className="dashboard-card">
        <FaChartBar className="dashboard-card-icon" />
        <h3>Vendor Sales</h3>
        <p>View vendor wise product sales.</p>
    </div>
</Link>
                 <Link to="/admin/summary" className="dashboard-card-link">
                    <div className="dashboard-card">
                        <FaChartBar className="dashboard-card-icon" />
                        <h3>Dashboard Summary</h3>
                        <p>Analytics, Charts, and User Insights</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
