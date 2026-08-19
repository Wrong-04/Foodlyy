export type Screen =
  | "home"
  | "login"
  | "register"
  | "menu"
  | "admin-dashboard"
  | "reservation"
  | "cart";

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isBestSeller?: boolean;
}

export interface CartItem extends Dish {
  quantity: number;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type OrderStatus = "Completed" | "Cooking" | "Cancelled" | "Pending";

export interface Order {
  id: string;
  userId: number;
  customer: string;
  items: CartItem[];
  address?: string;
  phone?: string;
  paymentMethod: "cash" | "card";
  deliveryOption: "takeaway" | "delivery";
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "unavailable";
}

export interface Booking {
  id: string;
  userId: number;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  tableId: string;
  status: BookingStatus;
  specialRequests?: string;
  paymentMethod?: string;
  rejectReason?: string;
  createdAt?: string;
}
