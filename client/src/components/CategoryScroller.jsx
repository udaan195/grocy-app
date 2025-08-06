import React from 'react';
import { CATEGORIES } from '../constants/categories.js'; // <-- कॉमन लिस्ट इम्पोर्ट करें
import './CategoryScroller.css';

// 'All' को लिस्ट की शुरुआत में जोड़ें
const displayCategories = ['All', ...CATEGORIES];

const CategoryScroller = ({ selectedCategory, onSelectCategory }) => {
    return (
        <div className="category-scroller">
            {displayCategories.map((name, index) => (
                <button 
                    key={index} 
                    className={`category-chip ${selectedCategory === name ? 'active' : ''}`}
                    onClick={() => onSelectCategory(name)}
                >
                    {name}
                </button>
            ))}
        </div>
    );
};
export default CategoryScroller;
