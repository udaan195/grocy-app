import React from 'react';
import './StaticPage.css';

const ContactUsPage = () => {
    return (
        <div className="static-page-container">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you! Whether you have a question about our features, a suggestion, or anything else, our team is ready to answer all your questions.</p>
            
            <h2>Get in Touch</h2>
            <p><strong>Email:</strong> support@grocy.com</p>
            <p><strong>Phone:</strong> +91 12345 67890</p>
            <p><strong>Address:</strong> Grocy Headquarters, Gurgaon, Haryana, India</p>

            {/* भविष्य में हम इस फॉर्म को फंक्शनल बना सकते हैं */}
            <h2 style={{marginTop: '2rem'}}>Send us a Message</h2>
            <form style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <input type="text" placeholder="Your Name" disabled />
                <input type="email" placeholder="Your Email" disabled />
                <textarea placeholder="Your Message" rows="5" disabled></textarea>
                <button type="submit" disabled>Send Message (Coming Soon)</button>
            </form>
        </div>
    );
};

export default ContactUsPage;
