// @ts-check
// --- वेंडर को भेजे जाने वाले नए ऑर्डर का टेम्पलेट ---
const getNewOrderEmailForVendor = (order, shippingAddress, vendor) => {
    // सुरक्षा के लिए, हम एड्रेस ऑब्जेक्ट से फोन नंबर हटा देंगे
    const { phoneNumber, ...addressForVendor } = shippingAddress;

    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2>🔔 New Order for ${vendor.shopName}!</h2>
                <p><b>Order ID:</b> ${order._id.toString()}</p>
                <hr>
                <h3>--- Customer Details ---</h3>
                <p>
                    <b>Name:</b> ${addressForVendor.fullName}<br>
                    <b>Address:</b> ${addressForVendor.houseNo}, ${addressForVendor.area}, ${addressForVendor.city}, ${addressForVendor.state} - ${addressForVendor.pincode}
                </p>
                <hr>
                <h3>--- Order Items ---</h3>
                ${order.items.map(item => `
                    <p style="border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        <b>${item.name}</b><br>
                        (${item.quantityValue}${item.quantityUnit}) x ${item.quantity} | ₹${item.price.toFixed(2)}
                    </p>
                `).join('')}
                <hr>
                <h3>--- Payment Summary ---</h3>
                <p>Items Total: ₹${order.itemsTotal.toFixed(2)}</p>
                <p>Delivery Charge: ₹${order.deliveryCharge.toFixed(2)}</p>
                <p><b>Grand Total: ₹${order.totalAmount.toFixed(2)}</b></p>
                <hr>
                <h3>Payment Method: ${order.paymentMethod}</h3>
            </div>
        </div>
    `;
};

// --- ग्राहक को भेजे जाने वाले नए ऑर्डर का टेम्पलेट ---
const getNewOrderEmailForCustomer = (order, vendor) => {
    return `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
             <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
                <h2>✅ Your order with ${vendor.shopName} is confirmed!</h2>
                <p>Thank you for your purchase. Your order details are below:</p>
                <p><b>Order ID:</b> ${order._id.toString()}</p>
                <hr>
                <h3>--- Order Items ---</h3>
                ${order.items.map(item => `
                    <div style="display:flex; align-items:center; margin-bottom:10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                        <img src="${item.image}" width="60" style="margin-right:15px; border-radius:4px;" />
                        <div>
                            <b>${item.name}</b><br>
                            (${item.quantityValue}${item.quantityUnit}) x ${item.quantity} | ₹${item.price.toFixed(2)}
                        </div>
                    </div>
                `).join('')}
                <hr>
                <h3>--- Payment Summary ---</h3>
                <p>Items Total: ₹${order.itemsTotal.toFixed(2)}</p>
                <p>Delivery Charge: ₹${order.deliveryCharge.toFixed(2)}</p>
                <p><b>Grand Total: ₹${order.totalAmount.toFixed(2)}</b></p>
                <hr>
                <p>You will be notified when the status of your order changes.</p>
            </div>
        </div>
    `;
};

// --- ग्राहक को स्टेटस अपडेट का टेम्पलेट ---
const getStatusUpdateEmailForCustomer = (order) => {
    return `
       <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
               <h2>🚚 Your Order Status has been Updated!</h2>
               <p>Hi, the status for your order #${order._id.toString().slice(-6)} is now:</p>
               <h1 style="background-color: #f0f2f5; padding: 15px; text-align: center; border-radius: 8px;">${order.orderStatus}</h1>
               <p>Thank you for shopping with us!</p>
           </div>
       </div>
   `;
};

module.exports = { getNewOrderEmailForVendor, getNewOrderEmailForCustomer, getStatusUpdateEmailForCustomer };
