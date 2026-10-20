import React from "react";
import { 
  X, 
  Home, 
  Calendar, 
  FolderCheck, 
  Archive, 
  Settings, 
  LogOut,
  GraduationCap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function DrawerMenu({ isOpen, onClose, activeTab, onSelectTab }) {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();

  if (!isOpen) return null;

  const menuItems = [
    { id: "home", labelEn: "Home", labelHi: "होम", icon: Home },
    { id: "calendar", labelEn: "Calendar", labelHi: "कैलेंडर", icon: Calendar },
    { 
      id: "review", 
      labelEn: user?.role === "teacher" ? "To Review" : "Pending Tasks", 
      labelHi: user?.role === "teacher" ? "समीक्षा करें" : "शेष कार्य", 
      icon: FolderCheck 
    },
    { id: "archived", labelEn: "Archived Classes", labelHi: "पुराने क्लास", icon: Archive },
    { id: "settings", labelEn: "Settings", labelHi: "सेटिंग्स", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-72 max-w-[80vw] bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col z-10 transition-transform">
        
        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={user?.avatar} 
              alt={user?.name} 
              className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 dark:border-gray-700 shrink-0" 
            />
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {user?.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                <span>{lang === "hi" ? item.labelHi : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Role Badge & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between text-xs px-2 text-gray-500">
            <span>Role:</span>
            <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">
              {user?.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === "hi" ? "लॉगआउट करें" : "Sign Out"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}