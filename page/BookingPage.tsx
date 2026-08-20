import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Users,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  Info,
  CreditCard,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dbService } from "../databaseService";
import { Booking, Table } from "../types";
import { useApp } from "../context/AppContext";

const WEEKEND_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
  "22:30",
];
const WEEKDAY_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
];
const PERIOD_RANGES: Record<
  "morning" | "afternoon" | "evening",
  [number, number]
> = { morning: [8, 12], afternoon: [12, 17], evening: [17, 24] };

const BookingPage = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<
    "morning" | "afternoon" | "evening"
  >("evening");
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 2,
    name: currentUser?.name || "",
    phone: "",
    email: currentUser?.email || "",
    specialRequests: "",
    paymentMethod: "pay_at_restaurant",
    assignedTable: null as Table | null,
  });
  const [tables, setTables] = useState<Table[]>([]);
  const [takenTableIds, setTakenTableIds] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.date || !formData.time) return;
      setIsCheckingAvailability(true);
      try {
        const [allTables, allBookings] = await Promise.all([
          dbService.getTables(),
          dbService.getBookings(),
        ]);
        setTables(allTables);
        const taken = allBookings
          .filter(
            (b) =>
              b.date === formData.date &&
              b.time === formData.time &&
              b.status !== "cancelled" &&
              b.tableId,
          )
          .map((b) => b.tableId);
        setTakenTableIds(taken);
        if (formData.assignedTable) {
          const stillValid =
            allTables.find((t) => t.id === formData.assignedTable?.id) &&
            !taken.includes(formData.assignedTable.id) &&
            formData.assignedTable.capacity >= formData.guests;
          if (!stillValid)
            setFormData((prev) => ({ ...prev, assignedTable: null }));
        }
      } catch (error) {
        console.error("Failed to check availability:", error);
      } finally {
        setIsCheckingAvailability(false);
      }
    };
    const id = setTimeout(fetchAvailability, 300);
    return () => clearTimeout(id);
  }, [formData.date, formData.time, formData.guests]);

  const getTimeSlotsByPeriod = (
    period: "morning" | "afternoon" | "evening",
  ) => {
    if (!formData.date) return [];
    const day = new Date(formData.date).getDay();
    const slots = day === 0 || day === 6 ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
    const [start, end] = PERIOD_RANGES[period];

    const today = new Date().toISOString().split("T")[0];
    const isToday = formData.date === today;
    const now = new Date();
    const nowMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : -1;

    return slots.filter((t) => {
      const [h, m] = t.split(":").map(Number);
      if (h < start || h >= end) return false;
      if (isToday && h * 60 + m <= nowMinutes) return false;
      return true;
    });
  };

  const handleGoToReview = () => {
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) {
      setError("Vui lòng nhập họ và tên hợp lệ.");
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      setError(
        "Số điện thoại không hợp lệ (Bắt đầu bằng 0 hoặc +84, gồm 10 số).",
      );
      return;
    }
    if (
      formData.email &&
      formData.email.trim() &&
      !emailRegex.test(formData.email)
    ) {
      setError("Định dạng email không hợp lệ.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setError("Vui lòng đăng nhập để đặt bàn.");
      return;
    }
    if (!formData.assignedTable) {
      setError("Please select a table to proceed.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const newBooking: Booking = {
        id: `B-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
        userId: currentUser.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        status: "pending",
        specialRequests: formData.specialRequests,
        paymentMethod: formData.paymentMethod,
        tableId: formData.assignedTable.id,
        createdAt: new Date().toISOString(),
      };
      await dbService.addBooking(newBooking);
      setStep(4);
    } catch (err) {
      console.error("Booking failed:", err);
      setError("Failed to submit your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTables = tables.filter(
    (t) =>
      !takenTableIds.includes(t.id) &&
      t.status === "available" &&
      t.capacity >= formData.guests,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Book a Table
          </h1>
          <p className="text-gray-500">
            Reserve your spot and get ready for a delightful culinary
            experience.
          </p>
        </div>

        {step < 4 && (
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`relative z-10 flex flex-col items-center gap-2 ${step >= s ? "text-primary" : "text-gray-400"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 ${step >= s ? "bg-primary text-white border-primary/20" : "bg-white border-gray-200"}`}
                  >
                    {s}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {["Details", "Contact", "Confirm"][s - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {step === 1 && (
            <div className="p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calendar className="text-primary" /> When are you coming?
              </h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Users size={18} /> Number of Guests
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          guests: Math.max(1, p.guests - 1),
                        }))
                      }
                      className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <div className="text-3xl font-extrabold text-gray-900 w-16 text-center">
                      {formData.guests}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({
                          ...p,
                          guests: Math.min(20, p.guests + 1),
                        }))
                      }
                      className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={18} /> Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        date: e.target.value,
                        time: "",
                      })
                    }
                    className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 outline-none transition-colors text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock size={18} /> Time
                    {formData.date && (
                      <span className="text-xs text-gray-500 font-normal">
                        (
                        {new Date(formData.date).getDay() === 0 ||
                        new Date(formData.date).getDay() === 6
                          ? "Sat-Sun: 08:00-23:00"
                          : "Mon-Fri: 09:00-22:00"}
                        )
                      </span>
                    )}
                  </label>
                  {!formData.date ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      Please select a date first
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2 mb-4">
                        {[
                          {
                            id: "morning",
                            label: "🌅 Morning",
                            time: "8AM-12PM",
                          },
                          {
                            id: "afternoon",
                            label: "☀️ Afternoon",
                            time: "12PM-5PM",
                          },
                          {
                            id: "evening",
                            label: "🌙 Evening",
                            time: "5PM-11PM",
                          },
                        ].map((period) => (
                          <button
                            key={period.id}
                            type="button"
                            onClick={() =>
                              setSelectedTimePeriod(period.id as any)
                            }
                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${selectedTimePeriod === period.id ? "border-primary bg-primary text-white shadow-md" : "border-gray-200 text-gray-600 hover:border-primary/50"}`}
                          >
                            <div>{period.label}</div>
                            <div className="text-[10px] opacity-80 font-normal">
                              {period.time}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {getTimeSlotsByPeriod(selectedTimePeriod).map(
                          (time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setFormData({ ...formData, time })}
                              className={`h-11 rounded-lg border-2 font-bold transition-all text-sm ${formData.time === time ? "border-primary bg-primary text-white shadow-md shadow-primary/30" : "border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-primary/5"}`}
                            >
                              {time}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {formData.date && formData.time && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center text-xs">
                        {availableTables.length}
                      </div>
                      Available Tables
                    </span>
                    {isCheckingAvailability && (
                      <span className="text-primary text-xs flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />{" "}
                        Checking...
                      </span>
                    )}
                  </label>
                  {availableTables.length === 0 && !isCheckingAvailability ? (
                    <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="font-bold mb-2">😔 No available tables</p>
                      <p className="text-sm">
                        All tables are booked for this time. Try another time
                        slot.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {tables.map((table) => {
                        const isTaken =
                          takenTableIds.includes(table.id) ||
                          table.status === "unavailable";
                        const isDisabled =
                          isTaken || table.capacity < formData.guests;
                        const isSelected =
                          formData.assignedTable?.id === table.id;
                        return (
                          <div
                            key={table.id}
                            onClick={() =>
                              !isDisabled &&
                              setFormData((prev) => ({
                                ...prev,
                                assignedTable: table,
                              }))
                            }
                            className={`p-4 rounded-xl border-2 transition-all relative overflow-hidden ${isDisabled ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" : isSelected ? "border-primary bg-primary/5 cursor-pointer shadow-sm shadow-primary/10" : "border-gray-200 cursor-pointer hover:border-primary/40 bg-white"}`}
                          >
                            {isDisabled && (
                              <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                <span className="bg-white/90 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                  {isTaken
                                    ? "Booked"
                                    : `Needs ${formData.guests} seats`}
                                </span>
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 text-primary">
                                <Check size={16} strokeWidth={3} />
                              </div>
                            )}
                            <div className="font-bold text-gray-900 mb-1">
                              {table.name}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                              <Users size={10} /> {table.capacity}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-10">
                <button
                  onClick={() => setStep(2)}
                  disabled={
                    !formData.date || !formData.time || !formData.assignedTable
                  }
                  className="w-full h-14 bg-primary text-white font-bold rounded-xl text-lg hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formData.assignedTable
                    ? "Continue to Details"
                    : "Select a table to continue"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="text-primary" /> Your Details
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="0123 456 789"
                        className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <div className="relative">
                    <Info
                      className="absolute left-4 top-4 text-gray-400"
                      size={20}
                    />
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder="Allergies, wheelchair access, special occasion..."
                      className="w-full min-h-[120px] py-4 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 outline-none transition-colors resize-y"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200 animate-in fade-in zoom-in duration-300">
                  {error}
                </div>
              )}
              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  className="w-1/3 h-14 bg-gray-100 text-gray-700 font-bold rounded-xl text-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGoToReview}
                  className="w-2/3 h-14 bg-primary text-white font-bold rounded-xl text-lg hover:bg-primaryDark transition-colors"
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Check className="text-primary" /> Review & Confirm
              </h2>
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
                  Reservation Details
                </h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  {[
                    ["Date", formData.date],
                    ["Time", formData.time],
                    ["Guests", `${formData.guests} People`],
                    [
                      "Table",
                      `${formData.assignedTable?.name} (${formData.assignedTable?.capacity} seats)`,
                    ],
                    ["Name", formData.name],
                    ["Phone", formData.phone],
                  ].map(([label, value]) => (
                    <>
                      <div key={`${label}-l`} className="text-gray-500">
                        {label}
                      </div>
                      <div
                        key={`${label}-v`}
                        className="font-bold text-gray-900 text-right"
                      >
                        {value}
                      </div>
                    </>
                  ))}
                  {formData.specialRequests && (
                    <>
                      <div className="text-gray-500 col-span-2 mt-2">
                        Special Requests
                      </div>
                      <div className="font-medium text-gray-700 col-span-2 bg-white p-3 rounded-lg border border-gray-200 italic">
                        "{formData.specialRequests}"
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: "pay_at_restaurant",
                      label: "Pay at Restaurant",
                      disabled: false,
                    },
                    {
                      value: "pay_now_online",
                      label: "Pay Now (Coming soon)",
                      disabled: true,
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === option.value ? "border-primary bg-orange-50/50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.value}
                        checked={formData.paymentMethod === option.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                        disabled={option.disabled}
                        className="text-primary focus:ring-primary w-5 h-5"
                      />
                      <span
                        className={`font-semibold flex items-center gap-2 ${option.disabled ? "text-gray-400" : "text-gray-800"}`}
                      >
                        <CreditCard size={18} /> {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="w-1/3 h-14 bg-gray-100 text-gray-700 font-bold rounded-xl text-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-2/3 h-14 flex items-center justify-center gap-2 bg-black text-white font-bold rounded-xl text-lg hover:bg-gray-900 transition-colors shadow-xl shadow-black/20 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-10 sm:p-16 text-center">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={48} strokeWidth={3} />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Booking Confirmed!
              </h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Thank you,{" "}
                <span className="font-bold text-gray-900">{formData.name}</span>
                ! Your table ({formData.assignedTable?.name}) for{" "}
                {formData.guests} has been reserved for{" "}
                <strong className="text-gray-900">{formData.date}</strong> at{" "}
                <strong className="text-gray-900">{formData.time}</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/bookings")}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primaryDark transition-colors shadow-lg shadow-primary/20"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => navigate("/menu")}
                  className="px-8 py-4 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Explore Menu
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-primary hover:text-primary transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
