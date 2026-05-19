import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { motion } from "framer-motion";

export default function MainLayout({ children, onSearch, onLogout }) {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  useEffect(() => {
    const handleNavigateAccount = () => setActiveMenu("Account");
    document.addEventListener('navigateAccount', handleNavigateAccount);
    return () => document.removeEventListener('navigateAccount', handleNavigateAccount);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar active={activeMenu} onChange={(menu) => setActiveMenu(menu)} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={onSearch} onLogout={onLogout} onNavigate={(menu) => setActiveMenu(menu)} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto"
          >
            {typeof children === "function" ? children(activeMenu, setActiveMenu) : children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
