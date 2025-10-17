import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { authAPI, setAuthToken } from "../../utils/api";
import { toast } from "sonner@2.0.3";
import { User, UserRole } from "../../types";
import { Shield } from "lucide-react";

type AuthScreenProps = {
  onAuthSuccess: (user: User) => void;
};

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const DEMO_EMAIL = "coach@demo.com";
  const DEMO_PASSWORD = "coach123";
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "player" as UserRole,
    firstName: "",
    lastName: "",
    phone: "",
    nickname: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.signin(loginData);
      setAuthToken(response.accessToken);
      toast.success("Welcome back!");
      onAuthSuccess(response.user);
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      // Try to login with demo account
      const response = await authAPI.signin({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      setAuthToken(response.accessToken);
      toast.success("Welcome to the demo!");
      onAuthSuccess(response.user);
    } catch (error: any) {
      // If demo account doesn't exist, create it
      try {
        await authAPI.signup({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          role: "coach",
          firstName: "Demo",
          lastName: "Coach",
          phone: "+1 (555) 000-0000",
          nickname: "Coach",
        });

        // Now login
        const loginResponse = await authAPI.signin({
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        });
        setAuthToken(loginResponse.accessToken);
        toast.success("Welcome to the demo!");
        onAuthSuccess(loginResponse.user);
      } catch (createError: any) {
        toast.error("Failed to setup demo account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setLoginData({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.signup({
        email: signupData.email,
        password: signupData.password,
        role: signupData.role,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        phone: signupData.phone,
        nickname: signupData.nickname,
      });

      toast.success("Account created successfully!");
      
      // Auto login
      const loginResponse = await authAPI.signin({
        email: signupData.email,
        password: signupData.password,
      });
      
      setAuthToken(loginResponse.accessToken);
      onAuthSuccess(loginResponse.user);
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>TeamManager</CardTitle>
          <CardDescription>Manage your sports team with ease</CardDescription>
          
          {/* Demo Banner */}
          <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-blue-900 dark:text-blue-100">
              Try the demo account to explore all features!
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Demo Quick Login Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {isLoading ? "Loading Demo..." : "Try Demo Account"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or login with email</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                
                {/* Fill Demo Credentials Link */}
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-xs"
                  onClick={handleFillDemo}
                >
                  Fill demo credentials (coach@demo.com)
                </Button>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={signupData.role} onValueChange={(value: UserRole) => setSignupData({ ...signupData, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    placeholder="Optional"
                    value={signupData.nickname}
                    onChange={(e) => setSignupData({ ...signupData, nickname: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
