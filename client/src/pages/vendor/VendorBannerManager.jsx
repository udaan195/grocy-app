import React, { useState, useEffect } from 'react';
import axios from '../../api.js';

const VendorBannerManager = () => {
  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const convertToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !title) return alert("Image and title required");

    try {
      setUploading(true);
      const imageBase64 = await convertToBase64(imageFile);
      const token = localStorage.getItem('token');
      const payload = {
        title,
        image: imageBase64,
        vendorId: user.role === 'admin' ? user.id : undefined
      };

      await axios.post('/api/banners', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Banner uploaded successfully");
      setTitle('');
      setImagePreview('');
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Upload Banner</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Banner Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        /><br /><br />
        <input type="file" accept="image/*" onChange={handleImageChange} /><br /><br />
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '200px' }} />}
        <br />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default VendorBannerManager;