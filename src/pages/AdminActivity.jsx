import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "../axiosConfig";
import {
  FileText, Search, Download, Upload, CheckCircle, XCircle, Users, Activity, Loader2
} from "lucide-react";

const AdminLogs = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [error, setError] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) navigate("/dashboard");
  }, [isAdmin, navigate]);

  // Fetch logs from backend
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/api/admin/logs") // <-- update to match your backend endpoint
      .then(res => {
        // Logs could be res.data.logs, res.data, etc.
        setLogs(res.data.logs || res.data || []);
        setError(null);
      })
      .catch(err => {
        setLogs([]);
        setError("Failed to fetch logs.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case "upload": return <Upload className="w-4 h-4" />;
      case "approval": return <CheckCircle className="w-4 h-4" />;
      case "rejection": return <XCircle className="w-4 h-4" />;
      case "download": return <Download className="w-4 h-4" />;
      case "login": return <Users className="w-4 h-4" />;
      case "registration": return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "upload": return <Badge className="bg-primary/10 text-primary">Upload</Badge>;
      case "approval": return <Badge className="bg-success/10 text-success">Approval</Badge>;
      case "rejection": return <Badge className="bg-destructive/10 text-destructive">Rejection</Badge>;
      case "download": return <Badge className="bg-blue-500/10 text-blue-500">Download</Badge>;
      case "login": return <Badge className="bg-green-500/10 text-green-500">Login</Badge>;
      case "registration": return <Badge className="bg-purple-500/10 text-purple-500">Registration</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  // Filtering logic
  const filteredLogs = logs.filter(log => {
    const details = (log.details || "").toLowerCase();
    const realUser = (log.realUser || "").toLowerCase();
    const user = (log.user || "").toLowerCase();
    const action = log.action;
    const timestamp = log.timestamp || "";

    const matchesSearch = details.includes(searchQuery.toLowerCase()) ||
      realUser.includes(searchQuery.toLowerCase()) ||
      user.includes(searchQuery.toLowerCase());

    const matchesAction = !filterAction || filterAction === "all" || action === filterAction;
    const matchesDate = !filterDate || (timestamp.startsWith(filterDate));

    return matchesSearch && matchesAction && matchesDate;
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  const exportLogs = () => {
    const csv =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Action,Anonymous User,Real User,Details,IP Address\n" +
      filteredLogs
        .map(log =>
          `"${log.timestamp}","${log.action}","${log.user}","${log.realUser}","${log.details}","${log.ipAddress || ""}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute(
      "download",
      `activity_logs_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.setAttribute("href", encodedUri);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Unable to load logs</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Activity Logs</h1>
          <p className="text-muted-foreground text-lg">
            Monitor all platform activities and user interactions
          </p>
        </div>

        {/* Controls */}
        <Card className="card-floating mb-8">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="upload">Uploads</SelectItem>
                  <SelectItem value="approval">Approvals</SelectItem>
                  <SelectItem value="rejection">Rejections</SelectItem>
                  <SelectItem value="download">Downloads</SelectItem>
                  <SelectItem value="login">Logins</SelectItem>
                  <SelectItem value="registration">Registrations</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <Button onClick={exportLogs} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Display */}
        <Card className="card-floating">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Activity Logs
              </div>
              <Badge variant="secondary">{filteredLogs.length} entries</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getActionBadge(log.action)}
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="font-medium mb-1">{log.details}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Anonymous:</span> {log.user}
                        </div>
                        <div>
                          <span className="font-medium">Real User:</span>
                          <span className="text-primary ml-1">{log.realUser}</span>
                        </div>
                        <div>
                          <span className="font-medium">IP:</span> {log.ipAddress}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No logs found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria or check back later.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setFilterAction("all");
                    setFilterDate("");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">
                {logs.filter(log => log.action === "upload").length}
              </div>
              <div className="text-sm text-muted-foreground">Total Uploads</div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-success">
                {logs.filter(log => log.action === "approval").length}
              </div>
              <div className="text-sm text-muted-foreground">Approvals</div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-500">
                {logs.filter(log => log.action === "download").length}
              </div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-500">
                {logs.filter(log => log.action === "registration").length}
              </div>
              <div className="text-sm text-muted-foreground">New Users</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
