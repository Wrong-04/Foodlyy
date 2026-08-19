import React, { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";

interface LoginPageProps {
   onLogin: (email: string, password: string) => Promise<User | null>;
   currentUser: User | null;
}

const LoginPage = ({ onLogin, currentUser }: LoginPageProps) => {
   const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const user = await onLogin(email, password);
      if (!user) {
         setError("Sai email hoặc mật khẩu.");
         return;
      }
      if (user.role === "admin") {
         navigate("/admin");
      } else {
         navigate("/");
      }
   };

   return (
      <div className="min-h-screen flex w-full">
         {/* Left Side Image */}
         <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
            <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Food Background" />
            <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white">
               <h1 className="text-5xl font-bold mb-4">Welcome Back!</h1>
               <p className="text-xl opacity-90 max-w-md">Discover thousands of delicious dishes and exclusive offers.</p>
            </div>
         </div>

         {/* Right Side Form */}
         <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background">
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
                  <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                  <form className="space-y-4" onSubmit={handleSubmit}>
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
                           placeholder="••••••••"
                           className="w-full rounded-xl border-gray-200 bg-background h-12 px-4 focus:ring-primary focus:border-primary"
                           required
                        />
                     </div>
                     {error && (
                        <p className="text-sm text-red-500 font-semibold">
                           {error}
                        </p>
                     )}
                     <div className="flex justify-end">
                        <button
                           type="button"
                           className="text-primary text-sm font-bold hover:underline"
                           onClick={() => navigate('/forgot-password')}
                        >
                           Forgot password?
                        </button>
                     </div>
                     <button
                        type="submit"
                        className="w-full bg-primary text-white font-bold h-12 rounded-xl hover:bg-primaryDark transition-all"
                     >
                        Sign In
                     </button>
                  </form>

                  <div className="mt-6 text-center">
                     <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <button onClick={() => navigate('/register')} className="text-primary font-bold hover:underline">
                           Create one
                        </button>
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default LoginPage;
