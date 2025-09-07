import { Code2, Database, LogOut, Menu, Monitor, Server, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import EnhancedNotificationBell from '../features/EnhancedNotificationBell';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Floating tech icons - Hidden on small screens */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        <Code2 className="absolute top-20 left-20 w-4 h-4 text-blue-400 opacity-20 animate-float" />
        <Server className="absolute top-40 right-32 w-5 h-5 text-purple-400 opacity-15 animate-float-delay-1" />
        <Database className="absolute bottom-32 left-32 w-4 h-4 text-indigo-400 opacity-20 animate-float-delay-2" />
        <Monitor className="absolute bottom-20 right-20 w-4 h-4 text-cyan-400 opacity-20 animate-float" />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-blue-200 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400 transition-all duration-200"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex items-center space-x-3 ml-2 lg:ml-0">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <h1 className="text-xl font-bold text-white">
                  {title}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <EnhancedNotificationBell />
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-sm font-medium text-white">{user?.name}</div>
                    <div className="text-xs text-blue-200 capitalize">{user?.role}</div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 group"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;