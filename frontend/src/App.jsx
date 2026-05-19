import { useState, useEffect } from "react";
import socketService, { useSocket } from "./services/socketService";

import MainLayout from "./components/layout/MainLayout";
import Auth from "./components/Auth";
import Toast from "./components/ui/Toast";
import { NotificationProvider } from "./context/NotificationContext";

import Dashboard from "./components/pages/Dashboard";
import AddTask from "./components/pages/AddTask";
import BinTask from "./components/pages/BinTask";
import Analytics from "./components/pages/Analytics";

import Profile from "./components/pages/Profile";
import AllTasks from "./components/pages/AllTasks";

import Account from "./components/pages/Account";

export default function App() {
  // ================= AUTH =================
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  // ================= GLOBAL SEARCH =================
  const [search, setSearch] = useState("");

  // ================= TOAST =================
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ================= SOCKET CONNECTION =================
  useEffect(() => {
    if (isAuth) {
      socketService.connect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuth]);

  // Listen for real-time notifications
  useSocket('new_notification', (notification) => {
    showToast(notification.message, 'info');
  });

  // Listen for task updates
  useSocket('task_updated', (task) => {
    showToast(`Task "${task.title}" updated`, 'info');
  });

  // Listen for task creation
  useSocket('task_created', (task) => {
    showToast(`Task "${task.title}" created`, 'success');
  });

  // Listen for task deletion
  useSocket('task_deleted', (taskId) => {
    showToast('Task deleted', 'error');
  });

  // ================= AUTH SCREEN =================
  if (!isAuth) {
    return (
      <>
        <Auth onAuth={() => setIsAuth(true)} showToast={showToast} />

        <Toast toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  // ================= MAIN APP =================
  return (
    <>
      <NotificationProvider>
        <MainLayout onSearch={setSearch} onLogout={() => setIsAuth(false)}>
          {(activeMenu, setActiveMenuPage) => {
            switch (activeMenu) {
              case "Dashboard":
                return (
                  <Dashboard
                    showToast={showToast}
                    onChange={setActiveMenuPage}
                    search={search}
                  />
                );

              case "All Tasks":
                return <AllTasks showToast={showToast} />;

              case "Add Task":
                return <AddTask showToast={showToast} />;

              case "Bin Task":
                return <BinTask showToast={showToast} />;

              case "Contact Us":
                return (
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                    <p className="text-sm text-gray-500">
                      This section can include a contact form.
                    </p>
                  </div>
                );

              case "Profile":
                return <Profile showToast={showToast} />;

              case "Account":
                return (
                  <Account
                    showToast={showToast}
                    onLogout={() => setIsAuth(false)}
                  />
                );

              default:
                return <Dashboard showToast={showToast} search={search} />;
            }
          }}
        </MainLayout>
      </NotificationProvider>

      {/* GLOBAL TOAST */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
