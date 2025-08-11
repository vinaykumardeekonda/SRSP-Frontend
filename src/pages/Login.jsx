import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const backendRole = loginType === 'student' ? 'user' : loginType;
    
    console.log("LoginPage: Submitting login form with:", { 
      email, 
      password: '***', 
      loginType, 
      backendRole 
    });
    
    try {
      const response = await login(email, password, backendRole);
      console.log("LoginPage: Response from login function:", JSON.stringify(response, null, 2));
      
      let loggedInUser = null;
      if (response && response.email && response.role) {
        loggedInUser = response;
        console.log("LoginPage: Matched direct user object:", JSON.stringify(response, null, 2));
      } else if (response && response.user) {
        loggedInUser = response.user;
        console.log("LoginPage: Matched response.user:", JSON.stringify(response.user, null, 2));
      } else if (response && response.data && response.data.user) {
        loggedInUser = response.data.user;
        console.log("LoginPage: Matched response.data.user:", JSON.stringify(response.data.user, null, 2));
      }
      
      if (loggedInUser) {
        console.log("LoginPage: Login successful, received user data:", JSON.stringify(loggedInUser, null, 2));
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${loggedInUser.alias || loggedInUser.name || loggedInUser.email}!`,
        });
        if (loggedInUser.role === 'admin') {
          console.log("LoginPage: Navigating to /admin for role:", loggedInUser.role);
          navigate('/admin');
        } else {
          console.log("LoginPage: Navigating to /dashboard for role:", loggedInUser.role);
          navigate('/dashboard');
        }
      } else {
        console.error("LoginPage: Invalid or no user data in response:", JSON.stringify(response, null, 2));
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Unexpected response from server. Please try again.",
        });
      }
    } catch (error) {
      console.error("LoginPage: Error during login:", JSON.stringify(error.response?.data || error.message, null, 2));
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.response?.data?.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("LoginPage: User state on mount or refresh:", JSON.stringify(user, null, 2));
      if (user.role === 'admin' && location.pathname !== '/admin') {
        console.log("LoginPage: Redirecting to /admin on refresh");
        navigate('/admin');
      } else if (user.role !== 'admin' && location.pathname !== '/dashboard') {
        console.log("LoginPage: Redirecting to /dashboard on refresh");
        navigate('/dashboard');
      }
    }
  }, [user, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-floating">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold gradient-text">Welcome Back!</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Login As</Label>
              <RadioGroup
                value={loginType}
                onValueChange={setLoginType}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full button-glow" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account? {" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;