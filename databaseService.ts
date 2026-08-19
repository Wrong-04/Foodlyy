import { Dish, Order, User, CartItem, Booking, Table } from "./types";
import { supabase } from "./supabase";

// Database service API using Supabase
export const dbService = {
  // Get all dishes
  getDishes: async (): Promise<Dish[]> => {
    const { data, error } = await supabase
      .from("dishes")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get all orders
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all users
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get cart for user
  getCart: async (userId: number): Promise<CartItem[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("cart")
      .eq("id", userId)
      .single();

    if (error) return [];
    return data?.cart || [];
  },

  // Set cart for user
  setCart: async (userId: number, cart: CartItem[]): Promise<void> => {
    const { error } = await supabase
      .from("users")
      .update({ cart })
      .eq("id", userId);

    if (error) {
      console.error("Failed to save cart:", error);
      throw error;
    }
  },

  // Get wishlist for user
  getWishlist: async (userId: number): Promise<number[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("wishlist")
      .eq("id", userId)
      .single();

    if (error) return [];
    return data?.wishlist || [];
  },

  // Set wishlist for user
  setWishlist: async (userId: number, wishlist: number[]): Promise<void> => {
    const { error } = await supabase
      .from("users")
      .update({ wishlist })
      .eq("id", userId);

    if (error) {
      console.error("Failed to save wishlist:", error);
      throw error;
    }
  },

  // Add order
  addOrder: async (order: Order): Promise<void> => {
    const { error } = await supabase.from("orders").insert([order]);

    if (error) {
      console.error("Failed to add order:", error);
      throw error;
    }
  },

  // Update order
  updateOrder: async (
    orderId: string,
    updates: Partial<Order>,
  ): Promise<void> => {
    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) {
      console.error("Failed to update order:", error);
      throw error;
    }
  },

  // Delete order
  deleteOrder: async (orderId: string): Promise<void> => {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      console.error("Failed to delete order:", error);
      throw error;
    }
  },

  // Get all tables
  getTables: async (): Promise<Table[]> => {
    const { data, error } = await supabase
      .from("tables")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Failed to get tables:", error);
      return [];
    }
    return data || [];
  },

  // Get all bookings
  getBookings: async (): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Failed to get bookings:", error);
      return [];
    }
    return data || [];
  },

  // Add booking
  addBooking: async (booking: Booking): Promise<void> => {
    const { error } = await supabase.from("bookings").insert([booking]);

    if (error) {
      console.error("Failed to add booking:", error);
      throw error;
    }
  },

  // Update booking
  updateBooking: async (
    bookingId: string,
    updates: Partial<Booking>,
  ): Promise<void> => {
    const { error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", bookingId);

    if (error) {
      console.error("Failed to update booking:", error);
      throw error;
    }
  },

  // Delete booking
  deleteBooking: async (bookingId: string): Promise<void> => {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      console.error("Failed to delete booking:", error);
      throw error;
    }
  },

  // Add user (Sign up)
  addUser: async (user: User): Promise<void> => {
    const { error } = await supabase.from("users").insert([user]);

    if (error) {
      console.error("Failed to add user:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: number, updates: Partial<User>): Promise<void> => {
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  },

  // Export database (Keep logic for JSON download)
  export: async (): Promise<void> => {
    try {
      const [dishes, orders, users, bookings, tables] = await Promise.all([
        dbService.getDishes(),
        dbService.getOrders(),
        dbService.getUsers(),
        dbService.getBookings(),
        dbService.getTables(),
      ]);

      const db = {
        dishes,
        orders,
        users,
        bookings,
        tables,
      };

      const dataStr = JSON.stringify(db, null, 4);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "supabase_export.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export database:", error);
      alert("Không thể export database. Vui lòng thử lại.");
    }
  },
};
