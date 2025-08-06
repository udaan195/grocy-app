import React from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaClipboardList, FaStore, FaPlusSquare, FaTags, FaImage } from 'react-icons/fa';

const VendorDashboard = () => {
    const dashboardStyles = {
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '1rem',
    };

    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
    };

    const cardStyles = {
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        textAlign: 'center',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s',
    };

    const iconStyles = {
        fontSize: '2.5rem',
        marginBottom: '1rem',
        color: '#007bff',
    };

    return (
        <div style={dashboardStyles}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Vendor Dashboard</h2>

            <div style={gridStyles}>
                <Link to="/vendor/products" style={cardStyles}>
                    <FaBox style={iconStyles} />
                    <h3>Manage Products</h3>
                    <p>Add, edit, or remove your listed products.</p>
                </Link>

<Link to="/vendor/manage-coupons" style={cardStyles}>
                    <FaTags style={iconStyles} />
                    <h3>Manage Coupons</h3>
                    <p>Create and manage discount coupons.</p>
                    </Link>
                <Link to="/vendor/add-product" style={cardStyles}>
                    <FaPlusSquare style={iconStyles} />
                    <h3>Add New Product</h3>
                    <p>Create a new product and set pricing, images, etc.</p>
                </Link>

                <Link to="/vendor/orders" style={cardStyles}>
                    <FaClipboardList style={iconStyles} />
                    <h3>Manage Orders</h3>
                    <p>View and update status of your orders.</p>
                </Link>
                <Link to="/vendor/banners" style={cardStyles}>
  <FaImage style={iconStyles} />
  <h3>Upload Banner</h3>
  <p>Upload, edit or delete your shop banners.</p>
</Link>


                <Link to="/vendor/manage-shop" style={cardStyles}>
                    <FaStore style={iconStyles} />
                    <h3>Manage Shop</h3>
                    <p>Edit your shop details and availability.</p>
                </Link>
            </div>
        </div>
    );
};

export default VendorDashboard;
