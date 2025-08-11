import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Upload, FolderOpen, Settings, LogOut, Shield, FileText, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Layout = ({ children, showNavigation = true }) => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // DEBUG LOGS: Check user and isAuthenticated state in Layout
  console.log("Layout: Current user state (from AuthContext):", user);
  console.log("Layout: Is authenticated (from AuthContext):", isAuthenticated);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && isAuthenticated && (
        <nav className="bg-card border-b border-border shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link to="/dashboard" className="text-2xl font-bold gradient-text">
                  StudyShare
                </Link>
                
                <div className="hidden md:flex space-x-4">
                  {!isAdmin && (
                    <>
                      <Link to="/dashboard">
                        <Button 
                          variant={location.pathname === "/dashboard" ? "default" : "ghost"} 
                          size="sm" 
                          className="gap-2"
                        >
                          <Home className="w-4 h-4" />
                          Dashboard
                        </Button>
                      </Link>
                      
                      <Link to="/browse">
                        <Button 
                          variant={location.pathname === "/browse" ? "default" : "ghost"} 
                          size="sm" 
                          className="gap-2"
                        >
                          <FolderOpen className="w-4 h-4" />
                          Browse
                        </Button>
                      </Link>
                      
                      <Link to="/upload">
                        <Button 
                          variant={location.pathname === "/upload" ? "default" : "ghost"} 
                          size="sm" 
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload
                        </Button>
                      </Link>
                    </>
                  )}

                  {!isAdmin && (
                    <Link to="/profile">
                      <Button 
                        variant={location.pathname === "/profile" ? "default" : "ghost"} 
                        size="sm" 
                        className="gap-2"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Button>
                    </Link>
                  )}
                  
                  {isAdmin && (
                    <>
                      <Link to="/admin">
                        <Button 
                          variant={location.pathname === "/admin" ? "default" : "ghost"} 
                          size="sm" 
                          className="gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Button>
                      </Link>
                      
                      <Link to="/admin/logs">
                        <Button 
                          variant={location.pathname === "/admin/logs" ? "default" : "ghost"} 
                          size="sm" 
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Logs
                        </Button>
                      </Link>
                      
                      <Link to="/admin/activity">
                        <Button 
                          variant={location.pathname === "/admin/activity" ? "default" : "ghost"} 
                          size="sm" 
                          className="gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Activity
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {user && (
                  <>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://i.pravatar.cc/50?u=${user.alias}`} /> 
                      <AvatarFallback>{user.alias ? user.alias.substring(0, 2).toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      Welcome, {user.alias}
                      {isAdmin && user.name && <span className="ml-1 text-xs text-secondary-foreground">({user.name})</span>}
                    </span>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;