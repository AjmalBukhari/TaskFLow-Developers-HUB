import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";

export default function Auth({ onAuth, showToast }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullname: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || (!isLogin && !form.fullname)) {
      return showToast("All fields are required", "warning");
    }
    try {
      setLoading(true);
      if (isLogin) {
        const { data } = await loginUser({ email: form.email, password: form.password });
        localStorage.setItem("token", data.token);
        showToast("Login successful");
        onAuth();
      } else {
        await registerUser({ fullname: form.fullname, email: form.email, password: form.password });
        showToast("Registered successfully. Please login.");
        setIsLogin(true);
        setForm({ fullname: "", email: form.email, password: "" });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 rounded-xl p-6 w-80"
      >
        <h2 className="text-xl font-semibold text-center mb-5 dark:text-white">
          {isLogin ? "Login" : "Create Account"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <input
              name="fullname"
              placeholder="Full Name"
              value={form.fullname}
              onChange={handleChange}
              className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border dark:border-gray-600 p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
          />
          <Link to="/forgot-password" className="text-sm text-center block text-indigo-600 dark:text-indigo-400 hover:underline">
            Forgot Password?
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-center mt-4 cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </p>
      </motion.div>
    </div>
  );
}
