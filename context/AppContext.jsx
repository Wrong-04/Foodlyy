import React, { createContext, useContext, useState, useEffect } from "react";
import { dbService } from "../lib/db";

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

const loadUserFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("foodly_current_user") ?? "null");
  } catch {
    return null;
  }
};

const saveUserToStorage = (user) => {
  if (user) {
    localStorage.setItem("foodly_current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("foodly_current_user");
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(loadUserFromStorage);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState(null);

  // Load cart & wishlist khi user thay đổi
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (currentUser) {
          const [loadedCart, loadedWishlist] = await Promise.all([
            dbService.getCart(currentUser.id),
            dbService.getWishlist(currentUser.id),
          ]);
          setCart(loadedCart);
          setWishlist(loadedWishlist);
          setLoadedUserId(currentUser.id);
        } else {
          setCart([]);
          setWishlist([]);
          setLoadedUserId(null);
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  // Sync cart lên local storage database
  useEffect(() => {
    if (currentUser && currentUser.id === loadedUserId && !isLoading) {
      dbService.setCart(currentUser.id, cart).catch((err) =>
        console.error("Failed to save cart:", err)
      );
    }
  }, [cart, currentUser, isLoading, loadedUserId]);

  // Sync wishlist lên local storage database
  useEffect(() => {
    if (currentUser && currentUser.id === loadedUserId && !isLoading) {
      dbService.setWishlist(currentUser.id, wishlist).catch((err) =>
        console.error("Failed to save wishlist:", err)
      );
    }
  }, [wishlist, currentUser, isLoading, loadedUserId]);

  // Lưu session vào localStorage
  useEffect(() => {
    saveUserToStorage(currentUser);
  }, [currentUser]);

  // ─── Auth ──────────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    try {
      const users = await dbService.getUsers();
      const hashedPassword = await hashPassword(password);
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          (u.password === password || u.password === hashedPassword)
      );
      if (!user) return null;
      setCurrentUser(user);
      return user;
    } catch (err) {
      console.error("Login failed:", err);
      return null;
    }
  };

  const logout = () => setCurrentUser(null);

  const register = async (data) => {
    try {
      const users = await dbService.getUsers();
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );
      if (emailExists) {
        return { error: "Email đã tồn tại, vui lòng dùng email khác." };
      }
      const hashedPassword = await hashPassword(data.password);
      const newUser = {
        id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        ...data,
        password: hashedPassword,
        cart: [],
        wishlist: []
      };
      await dbService.addUser(newUser);
      setCurrentUser(newUser);
      return { user: newUser };
    } catch (err) {
      console.error("Register failed:", err);
      return { error: "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại." };
    }
  };

  // ─── Cart ──────────────────────────────────────────────────────────────────

  const addToCart = (dish, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.id === dish.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...dish, quantity }];
    });
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id, delta) =>
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );

  const clearCart = () => {
    setCart([]);
    if (currentUser) {
      dbService
        .setCart(currentUser.id, [])
        .catch((err) => console.error("Failed to clear cart:", err));
    }
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ─── Wishlist ──────────────────────────────────────────────────────────────

  const toggleWishlist = (id) =>
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        cart,
        wishlist,
        isLoading,
        login,
        logout,
        register,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        toggleWishlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
};
