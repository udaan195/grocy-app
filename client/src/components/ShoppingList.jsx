// src/components/ShoppingList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://your-api-url.com/api/groceries', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setItems(response.data); // Assume the API returns an array of items
      } catch (error) {
        console.error("Could not fetch shopping list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <p>Loading your list...</p>;
  }

  return (
    <div>
      <h2>My Shopping List</h2>
      {items.length === 0 ? (
        <p>Your list is empty. Add an item to get started!</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id}>{item.name} - (Quantity: {item.quantity})</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShoppingList;
