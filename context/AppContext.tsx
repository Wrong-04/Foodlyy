import React, { createContext, useContext, useState, useEffect } from "react";
import { dbService } from "../databaseService";
import { User, CartItem, Dish } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppContextType {
  currentUser: User | null;
  cart: CartItem[];
  wishlist: number[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: User["role"];
  }) => Promise<{ user?: User; error?: string }>;
  addToCart: (dish: Dish, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  toggleWishlist: (id: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const loadUserFromStorage = (): User | null => {
  try {
    return JSON.parse(localStorage.getItem("foodly_current_user") ?? "null");
  } catch {
    return null;
  }
};

const saveUserToStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem("foodly_current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("foodly_current_user");
  }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(loadUserFromStorage);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);

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

  // Sync cart lên Supabase
  useEffect(() => {
    if (currentUser && currentUser.id === loadedUserId && !isLoading) {
      dbService.setCart(currentUser.id, cart).catch((err) =>
        console.error("Failed to save cart:", err)
      );
    }
  }, [cart, currentUser, isLoading, loadedUserId]);

  // Sync wishlist lên Supabase
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

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const users = await dbService.getUsers();
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
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

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: User["role"];
  }): Promise<{ user?: User; error?: string }> => {
    try {
      const users = await dbService.getUsers();
      const emailExists = users.some(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );
      if (emailExists) {
        return { error: "Email đã tồn tại, vui lòng dùng email khác." };
      }
      const newUser: User = {
        id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        ...data,
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

  const addToCart = (dish: Dish, quantity: number = 1) => {
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

  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const updateQuantity = (id: number, delta: number) =>
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

  const toggleWishlist = (id: number) =>
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

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
};
