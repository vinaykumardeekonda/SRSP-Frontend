// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "../axiosConfig";
import {
  Upload,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Users
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("Dashboard: Fetching data from /api/resources/dashboard");
        const { data } = await axiosInstance.get("/api/resources/dashboard");
        console.log("Dashboard API response:", data);

        if (!data?.stats) {
          throw new Error("Invalid API response: missing stats");
        }

        setStats(data.stats || {});
        setRecentUploads(data.recentUploads || []);
        setErrorMsg("");
      } catch (error) {
        const msg = error.response?.data?.message || error.message || "Failed to fetch data";
        console.error("Dashboard: API Error:", msg);
        setErrorMsg(msg);
        setStats({});
        setRecentUploads([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-success";
      case "pending":
        return "text-warning";
      case "rejected":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-red-500 mb-2">Could not load dashboard</h2>
        <p className="text-muted-foreground mb-6">{errorMsg}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.displayName || user?.alias || "User"}</span>!
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's your learning activity overview
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/upload">
            <Card className="card-floating group cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Upload Resource</h3>
                <p className="text-sm text-muted-foreground">
                  Share your notes and help others learn
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/browse">
            <Card className="card-floating group cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FolderOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Browse Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Discover resources shared by peers
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="card-floating group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Your Points</h3>
              <p className="text-2xl font-bold text-primary">{stats.points || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-floating">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Uploads
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{stats.totalUploads || 0}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.uploadsThisWeek || 0} this week
              </div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-success">
                {stats.approvedUploads || 0}
              </div>
              <div className="mt-2">
                <Progress
                  value={stats.totalUploads ? (stats.approvedUploads / stats.totalUploads) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Downloads
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{stats.totalDownloads || 0}</div>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Users className="w-4 h-4 mr-1" />
                By {stats.totalDownloads ? Math.floor(stats.totalDownloads / 3) : 0} users
              </div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold text-warning">
                {stats.pendingUploads || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Awaiting approval
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Uploads */}
        <Card className="card-floating">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.map((upload, index) => (
                <div
                  key={upload.id || index}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(upload.status)}
                    <div>
                      <h4 className="font-medium">{upload.title || "Untitled"}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {upload.date ? new Date(upload.date).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium capitalize ${getStatusColor(upload.status)}`}
                    >
                      {upload.status || "unknown"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {upload.downloads || 0} downloads
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentUploads.length === 0 && (
              <div className="text-center py-12">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No uploads yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start sharing your knowledge with the community!
                </p>
                <Link to="/upload">
                  <Button variant="glow">
                    <Upload className="w-4 h-4" />
                    Upload Your First Resource
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
