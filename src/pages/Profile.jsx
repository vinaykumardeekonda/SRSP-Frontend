// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from '../axiosConfig';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Download, Star, Edit, Trash2, CheckCircle, XCircle, Clock, Mail, Loader2, Shield,
  Calculator, Beaker, Globe, Music, Palette, TrendingUp, BookOpen, FileText, FolderOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { deleteResource, resubmitResource } from "../api/resource";

// Helper: Category icon
const getCategoryIcon = (category) => {
  const iconMap = {
    'Mathematics': <Calculator className="w-4 h-4" />,
    'Science': <Beaker className="w-4 h-4" />,
    'Literature': <BookOpen className="w-4 h-4" />,
    'History': <Globe className="w-4 h-4" />,
    'Arts': <Palette className="w-4 h-4" />,
    'Music': <Music className="w-4 h-4" />,
    'Other': <FileText className="w-4 h-4" />
  };
  return iconMap[category] || <FileText className="w-4 h-4" />;
};

// Helper: Status icon
const getStatusIcon = (status) => {
  const iconMap = {
    'approved': <CheckCircle className="w-4 h-4 text-green-500" />,
    'pending': <Clock className="w-4 h-4 text-yellow-500" />,
    'rejected': <XCircle className="w-4 h-4 text-red-500" />
  };
  return iconMap[status] || <Clock className="w-4 h-4 text-gray-500" />;
};

// Helper: Status badge
const getStatusBadge = (status) => {
  const badgeConfig = {
    'approved': { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    'pending': { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    'rejected': { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' }
  };
  const config = badgeConfig[status] || badgeConfig.pending;
  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// ✅ Resource card (View & Resubmit buttons removed, and ratings fix applied)
const ResourceCard = ({ resource, onDelete }) => {
  const ratingsArray = Array.isArray(resource.ratings) ? resource.ratings : [];
  const avgRating = ratingsArray.length
    ? (ratingsArray.reduce((sum, r) => sum + (r.value || 0), 0) / ratingsArray.length).toFixed(1)
    : 0;

    console.log("Rendering resource card:", resource._id, resource.title);
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-muted-foreground p-3 bg-secondary/50 rounded-lg">
              {getCategoryIcon(resource.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{resource.title}</h3>
                {getStatusIcon(resource.status)}
              </div>
              <p className="text-sm text-muted-foreground">{resource.subject}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {getStatusBadge(resource.status)}
                {resource.status === 'approved' && (
                  <>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{resource.downloads || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{avgRating}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(resource._id)}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ResourceList = ({ resources, onDelete, emptyMessage }) => (
  <div className="grid gap-4">
    {resources.length === 0 ? (
      <div className="text-center text-muted-foreground py-6 flex flex-col items-center">
        <FolderOpen className="w-8 h-8 mb-2 opacity-60" />
        {emptyMessage}
      </div>
    ) : (
      resources.map((resource, index) => (
        <ResourceCard
          key={resource._id || `resource-${index}`}
          resource={resource}
          onDelete={onDelete}
        />
      ))
    )}
  </div>
);

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userResources, setUserResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to view your profile.",
      });
      navigate("/login");
      return;
    }

    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/api/resources/my-Uploads");
        setUserResources(Array.isArray(response.data?.resources) ? response.data.resources : []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to load resources.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [isAuthenticated, toast, navigate]);

  const handleDeleteResource = async (id) => {
  try {
    await deleteResource(id);
    toast({ title: "Deleted!", description: "Resource deleted successfully", variant: "success" });
    setUserResources(prev => prev.filter(r => r._id !== id));
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Delete Failed",
      description: error.response?.data?.message || error.message || "Could not delete resource.",
    });
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <Loader2 className="animate-spin mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              Loading your resources...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-floating md:col-span-2">
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.alias?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1">{user?.alias || "User"}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="w-3 h-3" />
                  {user?.role || "User"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Impact Card */}
          <Card className="card-floating">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 text-muted-foreground">
                  <span>Total Resources</span>
                  <span>{userResources.length}</span>
                </div>
                <Progress value={Math.min((userResources.length / 10) * 100, 100)} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-medium text-green-600">
                    {userResources.filter(r => r.status === "approved").length}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Total Downloads</span>
                  <span>{userResources.reduce((sum, r) => sum + (r.downloads || 0), 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="card-floating">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> My Resources
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage and track your uploaded resources
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  All ({userResources.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({userResources.filter(r => r.status === "approved").length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({userResources.filter(r => r.status === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({userResources.filter(r => r.status === "rejected").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <ResourceList
                  resources={userResources}
                  onDelete={handleDeleteResource}
                  emptyMessage="No resources uploaded yet."
                />
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                <ResourceList
                  resources={userResources.filter(r => r.status === "approved")}
                  onDelete={handleDeleteResource}
                  emptyMessage="No approved resources."
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-6">
                <ResourceList
                  resources={userResources.filter(r => r.status === "pending")}
                  onDelete={handleDeleteResource}
                  emptyMessage="No pending resources."
                />
              </TabsContent>

              <TabsContent value="rejected" className="mt-6">
                <ResourceList
                  resources={userResources.filter(r => r.status === "rejected")}
                  onDelete={handleDeleteResource}
                  emptyMessage="No rejected resources."
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
