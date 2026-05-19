import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";

export default function Auth({ onAuth, showToast }) {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!form.email || !form.password || (!isLogin && !form.fullname)) {
      return showToast("All fields are required", "warning");
    }

    try {
      setLoading(true);

      if (isLogin) {
        const { data } = await loginUser({
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", data.token);

        showToast("Login successful");
        onAuth();
      } else {
        await registerUser({
          fullname: form.fullname,
          email: form.email,
          password: form.password,
        });

        showToast("Registered successfully. Please login.");

        // Switch to login after register
        setIsLogin(true);

        // Reset password field
        setForm({
          fullname: "",
          email: form.email,
          password: "",
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow-md rounded-xl p-6 w-80"
      >
        {/* TITLE */}
        <h2 className="text-xl font-semibold text-center mb-5">
          {isLogin ? "Login" : "Create Account"}
        </h2>

        {/* FORM */}
        <div className="space-y-3">
          {!isLogin && (
            <input
              name="fullname"
              placeholder="Full Name"
              value={form.fullname}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          {/* FORGOT PASSWORD LINK */}
          <Link
            to="/forgot-password"
            className="text-sm text-center block text-indigo-600 hover:underline"
          >
            Forgot Password?
          </Link>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </div>

        {/* TOGGLE */}
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-center mt-4 cursor-pointer text-indigo-600 hover:underline"
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </motion.div>
    </div>
  );
}
