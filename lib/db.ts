import { Dish, Order, User, CartItem, Booking, Table } from "../types";
import { supabase } from "./supabase";

export const dbService = {
  // ─── Dishes ───────────────────────────────────────────────────────────────

  getDishes: async (): Promise<Dish[]> => {
    const { data, error } = await supabase
      .from("dishes")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // ─── Orders ───────────────────────────────────────────────────────────────

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  addOrder: async (order: Order): Promise<void> => {
    const { error } = await supabase.from("orders").insert([order]);
    if (error) throw error;
  },

  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<void> => {
    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (error) throw error;
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    const { error } = await supabase.from("orders").delete().eq("id", orderId);
    if (error) throw error;
  },

  // ─── Users ────────────────────────────────────────────────────────────────

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  addUser: async (user: User): Promise<void> => {
    const { error } = await supabase.from("users").insert([user]);
    if (error) throw error;
  },

  updateUser: async (userId: number, updates: Partial<User>): Promise<void> => {
    const { error } = await supabase.from("users").update(updates).eq("id", userId);
    if (error) throw error;
  },

  deleteUser: async (userId: number): Promise<void> => {
    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) throw error;
  },

  // ─── Cart ─────────────────────────────────────────────────────────────────

  getCart: async (userId: number): Promise<CartItem[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("cart")
      .eq("id", userId)
      .single();
    if (error) return [];
    return data?.cart || [];
  },

  setCart: async (userId: number, cart: CartItem[]): Promise<void> => {
    const { error } = await supabase.from("users").update({ cart }).eq("id", userId);
    if (error) throw error;
  },

  // ─── Wishlist ─────────────────────────────────────────────────────────────

  getWishlist: async (userId: number): Promise<number[]> => {
    const { data, error } = await supabase
      .from("users")
      .select("wishlist")
      .eq("id", userId)
      .single();
    if (error) return [];
    return data?.wishlist || [];
  },

  setWishlist: async (userId: number, wishlist: number[]): Promise<void> => {
    const { error } = await supabase.from("users").update({ wishlist }).eq("id", userId);
    if (error) throw error;
  },

  // ─── Tables ───────────────────────────────────────────────────────────────

  getTables: async (): Promise<Table[]> => {
    const { data, error } = await supabase
      .from("tables")
      .select("*")
      .order("id", { ascending: true });
    if (error) return [];
    return data || [];
  },

  // ─── Bookings ─────────────────────────────────────────────────────────────

  getBookings: async (): Promise<Booking[]> => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("createdAt", { ascending: false });
    if (error) return [];
    return data || [];
  },

  addBooking: async (booking: Booking): Promise<void> => {
    const { error } = await supabase.from("bookings").insert([booking]);
    if (error) throw error;
  },

  updateBooking: async (bookingId: string, updates: Partial<Booking>): Promise<void> => {
    const { error } = await supabase.from("bookings").update(updates).eq("id", bookingId);
    if (error) throw error;
  },

  deleteBooking: async (bookingId: string): Promise<void> => {
    const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
    if (error) throw error;
  },

  // ─── Export ───────────────────────────────────────────────────────────────

  export: async (): Promise<void> => {
    try {
      const [dishes, orders, users, bookings, tables] = await Promise.all([
        dbService.getDishes(),
        dbService.getOrders(),
        dbService.getUsers(),
        dbService.getBookings(),
        dbService.getTables(),
      ]);

      const dataStr = JSON.stringify({ dishes, orders, users, bookings, tables }, null, 4);
      const url = URL.createObjectURL(new Blob([dataStr], { type: "application/json" }));
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: "supabase_export.json",
      });
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Không thể export database. Vui lòng thử lại.");
    }
  },
};
