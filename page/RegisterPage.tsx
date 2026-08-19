import React, { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../types";

interface RegisterPageProps {
   onRegister: (data: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
   }) => Promise<{ user?: unknown; error?: string }>;
}

const RegisterPage = ({ onRegister }: RegisterPageProps) => {
   const navigate = useNavigate();
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const { error: err } = await onRegister({
         name,
         email,
         password,
         role: "customer",
      });
      if (err) {
         setError(err);
         return;
      }
      navigate("/");
   };

   return (
      <div className="min-h-screen flex w-full">
         {/* Right Side Form */}
         <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background order-2 lg:order-1">
            <div className="w-full max-w-md">
               <button
                  type="button"
                  className="flex items-center gap-2 mb-8 justify-center lg:justify-start cursor-pointer"
                  onClick={() => navigate('/')}
               >
                  <div className="bg-primary p-2 rounded-lg text-white"><UtensilsCrossed size={24} /></div>
                  <span className="text-2xl font-bold text-textMain">Foodie Delight</span>
               </button>

               <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                  <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
                  <p className="text-center text-gray-500 mb-6 text-sm">Join us to start your delicious journey</p>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                     <div className="space-y-2">
                        <label className="text-sm font-bold" htmlFor="fullName">Full Name</label>
                        <input
                           type="text"
                           id="fullName"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="John Doe"
                           className="w-full rounded-xl border-gray-200 bg-background h-12 px-4 focus:ring-primary focus:border-primary"
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold" htmlFor="email">Email</label>
                        <input
                           type="email"
                           id="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="name@example.com"
                           className="w-full rounded-xl border-gray-200 bg-background h-12 px-4 focus:ring-primary focus:border-primary"
                           required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold" htmlFor="password">Password</label>
                        <input
                           type="password"
                           id="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Create a password"
                           className="w-full rounded-xl border-gray-200 bg-background h-12 px-4 focus:ring-primary focus:border-primary"
                           required
                        />
                     </div>

                     {error && (
                        <p className="text-sm text-red-500 font-semibold">
                           {error}
                        </p>
                     )}
                     <button
                        type="submit"
                        className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-primaryDark transition-all mt-2"
                     >
                        Sign Up
                     </button>
                  </form>

                  <div className="mt-6 text-center">
                     <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">
                           Login
                        </button>
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Left Side Image */}
         <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 order-1 lg:order-2">
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Restaurant Background" />
            <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
               <h1 className="text-5xl font-bold mb-4">Join The Club</h1>
               <p className="text-xl opacity-90 max-w-md">Get exclusive access to secret menus, special events and more.</p>
            </div>
         </div>
      </div>
   );
};

export default RegisterPage;
