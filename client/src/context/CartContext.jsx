import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const addToCart = (product) => {
    const existing = cartItems.find((item) => item._id === product._id);
    if (existing) {
      setCartItems(cartItems.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(cartItems.map((item) =>
        item._id === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null); // ✅ free product logic reset
  };

  const applyCoupon = (coupon, freeProduct = null) => {
    setAppliedCoupon({ ...coupon, freeProduct });

    if (coupon.discountType === 'FreeProduct' && freeProduct) {
      const freeId = freeProduct._id + '_free';
      const newFree = {
        ...freeProduct,
        _id: freeId,
        discountedPrice: 0,
        isFreeItem: true,
        quantity: 1,
      };
      setCartItems((prev) => [...prev, newFree]);
    }

    if (coupon.discountType === 'BuyXGetY') {
      const { buyProduct, buyQuantity, getQuantityFree } = coupon;
      const paidItem = cartItems.find((item) => item._id === buyProduct);
      if (!paidItem) return;

      const freeId = buyProduct + '_free';
      const newFree = {
        ...paidItem,
        _id: freeId,
        discountedPrice: 0,
        isFreeItem: true,
        quantity: getQuantityFree,
      };

      setCartItems((prev) => {
        const already = prev.find((item) => item._id === freeId);
        if (already) {
          return prev.map((item) =>
            item._id === freeId ? { ...item, quantity: getQuantityFree } : item
          );
        } else {
          return [...prev, newFree];
        }
      });
    }
  };

  useEffect(() => {
    if (!appliedCoupon) return;

    const { discountType, freeProduct, coupon } = appliedCoupon;

    // ✅ BuyXGetY: add/remove free item based on paid qty
    if (discountType === 'BuyXGetY' && coupon) {
      const { buyProduct, buyQuantity, getQuantityFree } = coupon;
      const paidItem = cartItems.find((item) => item._id === buyProduct);
      const paidQty = paidItem?.quantity || 0;
      const freeId = buyProduct + '_free';
      const freeItem = cartItems.find((item) => item._id === freeId);

      if (paidQty >= buyQuantity) {
        const newFree = {
          ...paidItem,
          _id: freeId,
          discountedPrice: 0,
          isFreeItem: true,
          quantity: getQuantityFree,
        };

        if (!freeItem) {
          setCartItems((prev) => [...prev, newFree]);
        } else if (freeItem.quantity !== getQuantityFree) {
          setCartItems((prev) =>
            prev.map((item) =>
              item._id === freeId ? { ...item, quantity: getQuantityFree } : item
            )
          );
        }
      } else {
        if (freeItem) {
          setCartItems((prev) => prev.filter((item) => item._id !== freeId));
        }
      }
    }

    // ✅ FreeProduct: remove if real product gone
    // 🍬 FreeProduct validity check
// 🍬 FreeProduct validity check (stronger)
if (discountType === 'FreeProduct' && freeProduct) {
  const freeId = freeProduct._id + '_free';

  const realItems = cartItems.filter((item) => !item.isFreeItem);
  const hasRealProduct = realItems.some((item) => item._id === freeProduct._id);

  if (!hasRealProduct) {
    // Free product हटाओ
    setCartItems((prev) => prev.filter((item) => item._id !== freeId));
    setAppliedCoupon(null);
  }
}

  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        appliedCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);