// src/pages/AdminLogs.jsx
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

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) navigate("/dashboard");
  }, [isAdmin, navigate]);

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/logs");
        setLogs(res.data.logs || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("Failed to load logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionIcon = (action) => {
    switch (action) {
      case "upload": return <Upload className="w-4 h-4" />;
      case "approval": return <CheckCircle className="w-4 h-4" />;
      case "rejection": return <XCircle className="w-4 h-4" />;
      case "download": return <Download className="w-4 h-4" />;
      case "login":
      case "registration": return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "upload": return <Badge className="bg-primary/10 text-primary">Upload</Badge>;
      case "approval": return <Badge className="bg-green-500/10 text-green-600">Approval</Badge>;
      case "rejection": return <Badge className="bg-red-500/10 text-red-600">Rejection</Badge>;
      case "download": return <Badge className="bg-blue-500/10 text-blue-600">Download</Badge>;
      case "login": return <Badge className="bg-green-500/10 text-green-600">Login</Badge>;
      case "registration": return <Badge className="bg-purple-500/10 text-purple-600">Registration</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.details || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.realUser || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.user || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = !filterAction || filterAction === "all" || log.action === filterAction;
    const matchesDate = !filterDate || (log.timestamp && log.timestamp.startsWith(filterDate));
    return matchesSearch && matchesAction && matchesDate;
  });

  const formatTimestamp = (timestamp) =>
    timestamp ? new Date(timestamp).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    }) : "";

  const exportLogs = () => {
    const csv =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Action,Anonymous User,Real User,Details,IP Address,Resource\n" +
      filteredLogs
        .map(log =>
          `"${log.timestamp}","${log.action}","${log.user}","${log.realUser}","${log.details}","${log.ipAddress || ""}","${log.resource || ""}"`
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `activity_logs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        <span className="ml-2">Loading logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <Card className="mb-8">
          <CardContent className="p-6 grid lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger><SelectValue placeholder="All Actions" /></SelectTrigger>
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
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="flex items-center gap-2"><FileText /> Activity Logs</span>
              <Badge variant="secondary">{filteredLogs.length} entries</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map(log => (
                <div key={log.id} className="flex gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.action)}
                      <span className="text-xs text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <p className="font-medium">{log.details}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span><strong>Anonymous:</strong> {log.user}</span>
                      <span><strong>Real User:</strong> {log.realUser}</span>
                      {log.ipAddress && <span><strong>IP:</strong> {log.ipAddress}</span>}
                      {log.resource && <span><strong>Resource:</strong> {log.resource}</span>}
                    </div>
                  </div>
                </div>
              ))}

              {!filteredLogs.length && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No logs match your filters.</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery(""); setFilterAction("all"); setFilterDate("");
                  }}>Clear Filters</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogs;
