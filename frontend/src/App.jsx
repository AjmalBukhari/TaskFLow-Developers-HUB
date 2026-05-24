import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import socketService, { useSocket } from "./services/socketService";
import MainLayout from "./components/layout/MainLayout";
import Auth from "./components/Auth";
import Toast from "./components/ui/Toast";
import { NotificationProvider } from "./context/NotificationContext";
import Dashboard from "./components/pages/Dashboard";
import AddTask from "./components/pages/AddTask";
import BinTask from "./components/pages/BinTask";
import ForgotPassword from "./components/pages/ForgotPassword";
import Profile from "./components/pages/Profile";
import AllTasks from "./components/pages/AllTasks";
import Account from "./components/pages/Account";
import Analytics from "./components/pages/Analytics";
import Notifications from "./components/pages/Notifications";

export default function App() {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const [search, setSearch] = useState("");
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const showToast = (message, type = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (isAuth) socketService.connect();
    return () => socketService.disconnect();
  }, [isAuth]);

  useSocket('new_notification', (notification) => {
    showToast(notification.message, 'info');
  });

  useSocket('task_updated', (task) => {
    showToast(`Task "${task.title}" updated`, 'info');
  });

  // useSocket('task_deleted', (taskId) => {
  //   showToast('Task deleted', 'error');
  // });

  if (!isAuth) {
    if (location.pathname === "/forgot-password") {
      return (
        <>
          <ForgotPassword />
          <Toast toasts={toasts} removeToast={removeToast} />
        </>
      );
    }
    return (
      <>
        <Auth onAuth={() => setIsAuth(true)} showToast={showToast} />
        <Toast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <>
      <NotificationProvider>
        <MainLayout onSearch={setSearch} onLogout={() => setIsAuth(false)}>
          {(activeMenu, setActiveMenuPage) => {
            switch (activeMenu) {
              case "Dashboard":
                return <Dashboard showToast={showToast} onChange={setActiveMenuPage} search={search} />;
              case "All Tasks":
                return <AllTasks showToast={showToast} />;
              case "Add Task":
                return <AddTask showToast={showToast} />;
              case "Bin Task":
                return <BinTask showToast={showToast} />;
              case "Contact Us":
                return (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm dark:shadow-gray-900/50">
                    <h2 className="text-xl font-semibold mb-3 dark:text-white">Contact Us</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This section can include a contact form.</p>
                  </div>
                );
              case "Profile":
                return <Profile showToast={showToast} onNavigate={setActiveMenuPage} />;
              case "Account":
                return <Account showToast={showToast} onLogout={() => setIsAuth(false)} />;
              case "Analytics":
                return <Analytics showToast={showToast} />;
              case "Notifications":
                return <Notifications showToast={showToast} />;
              case "Forgot Password":
                return <ForgotPassword />;
              default:
                return <Dashboard showToast={showToast} search={search} />;
            }
          }}
        </MainLayout>
      </NotificationProvider>
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
