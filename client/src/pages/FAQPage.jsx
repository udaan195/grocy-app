import React, { useState } from 'react';
import './StaticPage.css';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="faq-item">
            <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
                <span>{question}</span>
                <span>{isOpen ? '-' : '+'}</span>
            </div>
            {isOpen && (
                <div className="faq-answer">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQPage = () => {
    const faqs = [
        { q: 'How does Grocy work?', a: 'Grocy connects you to nearby vendors. You place an order from your favorite local store, and it gets delivered to your doorstep quickly.' },
        { q: 'What are the delivery charges?', a: 'Delivery charges are set by each vendor and depend on the distance. You can see the final delivery charge on the checkout page before placing your order.' },
        { q: 'How can I track my order?', a: 'You can see the live status of your order (Processing, Shipped, Delivered) in the "My Orders" section of your profile.' },
        { q: 'How do I become a vendor?', a: 'First, register as a customer. Then, go to your profile page and click on the "Become a Vendor" button to fill out your shop details.' }
    ];

    return (
        <div className="static-page-container">
            <h1>Frequently Asked Questions</h1>
            {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}
        </div>
    );
};

export default FAQPage;
