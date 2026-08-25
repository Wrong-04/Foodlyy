let memoryDB = null;

export const loadDB = async () => {
  try {
    const res = await fetch('/api/db');
    memoryDB = await res.json();
  } catch (err) {
    console.error("Failed to load DB from API:", err);
  }
};

const getDB = () => {
  if (!memoryDB) {
    return { dishes: [], orders: [], users: [], tables: [], bookings: [] };
  }
  return memoryDB;
};

const saveDB = (data) => {
  memoryDB = data;
  fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error("Failed to save DB to API:", err));
};

export const dbService = {
  // ─── Dishes ───────────────────────────────────────────────────────────────

  getDishes: async () => {
    return getDB().dishes || [];
  },

  getDishesSync: () => {
    return getDB().dishes || [];
  },

  addDish: async (dish) => {
    const db = getDB();
    db.dishes.push(dish);
    saveDB(db);
  },

  updateDish: async (dishId, updates) => {
    const db = getDB();
    db.dishes = db.dishes.map((d) =>
      d.id === dishId ? { ...d, ...updates } : d
    );
    saveDB(db);
  },

  deleteDish: async (dishId) => {
    const db = getDB();
    db.dishes = db.dishes.filter((d) => d.id !== dishId);
    saveDB(db);
  },

  // ─── Orders ───────────────────────────────────────────────────────────────

  getOrders: async () => {
    return getDB().orders || [];
  },

  addOrder: async (order) => {
    const db = getDB();
    db.orders.unshift(order);
    saveDB(db);
  },

  updateOrder: async (orderId, updates) => {
    const db = getDB();
    db.orders = db.orders.map((o) =>
      o.id === orderId ? { ...o, ...updates } : o
    );
    saveDB(db);
  },

  deleteOrder: async (orderId) => {
    const db = getDB();
    db.orders = db.orders.filter((o) => o.id !== orderId);
    saveDB(db);
  },

  // ─── Users ────────────────────────────────────────────────────────────────

  getUsers: async () => {
    return getDB().users || [];
  },

  addUser: async (user) => {
    const db = getDB();
    db.users.push(user);
    saveDB(db);
  },

  updateUser: async (userId, updates) => {
    const db = getDB();
    db.users = db.users.map((u) =>
      u.id === userId ? { ...u, ...updates } : u
    );
    saveDB(db);
  },

  deleteUser: async (userId) => {
    const db = getDB();
    db.users = db.users.filter((u) => u.id !== userId);
    saveDB(db);
  },

  // ─── Cart ─────────────────────────────────────────────────────────────────

  getCart: async (userId) => {
    const users = getDB().users || [];
    const user = users.find((u) => u.id === userId);
    return user ? user.cart || [] : [];
  },

  setCart: async (userId, cart) => {
    const db = getDB();
    db.users = db.users.map((u) =>
      u.id === userId ? { ...u, cart } : u
    );
    saveDB(db);
  },

  // ─── Wishlist ─────────────────────────────────────────────────────────────

  getWishlist: async (userId) => {
    const users = getDB().users || [];
    const user = users.find((u) => u.id === userId);
    return user ? user.wishlist || [] : [];
  },

  setWishlist: async (userId, wishlist) => {
    const db = getDB();
    db.users = db.users.map((u) =>
      u.id === userId ? { ...u, wishlist } : u
    );
    saveDB(db);
  },

  // ─── Tables ───────────────────────────────────────────────────────────────

  getTables: async () => {
    return getDB().tables || [];
  },

  addTable: async (table) => {
    const db = getDB();
    db.tables.push(table);
    saveDB(db);
  },

  updateTable: async (tableId, updates) => {
    const db = getDB();
    db.tables = db.tables.map((t) =>
      t.id === tableId ? { ...t, ...updates } : t
    );
    saveDB(db);
  },

  deleteTable: async (tableId) => {
    const db = getDB();
    db.tables = db.tables.filter((t) => t.id !== tableId);
    saveDB(db);
  },

  // ─── Bookings ─────────────────────────────────────────────────────────────

  getBookings: async () => {
    return getDB().bookings || [];
  },

  addBooking: async (booking) => {
    const db = getDB();
    db.bookings.unshift(booking);
    saveDB(db);
  },

  updateBooking: async (bookingId, updates) => {
    const db = getDB();
    db.bookings = db.bookings.map((b) =>
      b.id === bookingId ? { ...b, ...updates } : b
    );
    saveDB(db);
  },

  deleteBooking: async (bookingId) => {
    const db = getDB();
    db.bookings = db.bookings.filter((b) => b.id !== bookingId);
    saveDB(db);
  },

  // ─── Export ───────────────────────────────────────────────────────────────

  export: async () => {
    try {
      const dataStr = localStorage.getItem("foodly_db") || JSON.stringify(initialData);
      const url = URL.createObjectURL(
        new Blob([dataStr], { type: "application/json" })
      );
      const link = Object.assign(document.createElement("a"), {
        href: url,
        download: "foodly_export.json",
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
