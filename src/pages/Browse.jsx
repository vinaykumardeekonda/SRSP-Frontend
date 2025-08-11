// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User, Download, Star, Edit, Trash2, CheckCircle, XCircle, Clock, Mail,
  Loader2, Shield, Calculator, Beaker, Globe, Music, Palette, TrendingUp,
  BookOpen, FileText, FolderOpen, Eye, Search, Filter, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteResource } from "../api/resource";
import { getCategories, getSubjects } from "../api/resource";


const getCategoryIcon = (category) => {
  const icons = {
    Mathematics: <Calculator className="w-4 h-4" />,
    Science: <Beaker className="w-4 h-4" />,
    Literature: <BookOpen className="w-4 h-4" />,
    History: <Globe className="w-4 h-4" />,
    Arts: <Palette className="w-4 h-4" />,
    Music: <Music className="w-4 h-4" />,
    Other: <FileText className="w-4 h-4" />,
  };
  return icons[category] || icons.Other;
};


const getStatusIcon = (status) => {
  const icons = {
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />,
  };
  return icons[status] || <Clock className="w-4 h-4 text-gray-500" />;
};


const getStatusBadge = (status) => {
  const config = {
    approved: { variant: "default", className: "bg-green-100 text-green-800" },
    pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
    rejected: { variant: "destructive", className: "bg-red-100 text-red-800" },
  };
  const badge = config[status] || config.pending;
  return (
    <Badge variant={badge.variant} className={badge.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// --- ResourceCard: No Preview, Download only ---
const ResourceCard = ({ resource, onDelete }) => {
  const ratings = Array.isArray(resource.ratings) ? resource.ratings : [];
  const avgRating = ratings.length
    ? (ratings.reduce((sum, r) => sum + (r.value || 0), 0) / ratings.length).toFixed(1)
    : 0;

  const handleDownload = (resource) => {
  const savedFilename = resource.files?.[0]?.filename;
  if (!savedFilename) {
    alert('No file to download.');
    return;
  }
  const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/api/resources/${resource.id}/download/${savedFilename}`;

  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = resource.files[0]?.originalname || 'downloaded-file';
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-muted-foreground p-3 bg-secondary/50 rounded-lg">
              {getCategoryIcon(resource.subject)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{resource.title}</h3>
                {getStatusIcon(resource.status)}
              </div>
              <p className="text-sm text-muted-foreground">{resource.subject}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                {getStatusBadge(resource.status)}
                {resource.status === "approved" && (
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
              {resource.status === "approved" && (
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>
          {resource.status === "draft" && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => onDelete(resource.id)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          )}
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
      resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onDelete={onDelete}
        />
      ))
    )}
  </div>
);

const Browse = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userResources, setUserResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("approved");
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Fetch categories and subjects for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      setIsLoadingFilters(true);
      try {
        const [categoriesResponse, subjectsResponse] = await Promise.all([
          getCategories(),
          getSubjects(),
        ]);
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : Array.isArray(categoriesResponse)
          ? categoriesResponse
          : [];
        const subjectsData = Array.isArray(subjectsResponse.data)
          ? subjectsResponse.data
          : Array.isArray(subjectsResponse)
          ? subjectsResponse
          : [];
        setCategories(categoriesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Failed to fetch filter data:", error);
        toast({
          variant: "destructive",
          title: "Filter Error",
          description: "Failed to load filter options.",
        });
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterData();
  }, [toast]);

  // Fetch resources
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
        const res = await axiosInstance.get("/api/resources/my-Uploads");
        const allResources = Array.isArray(res.data?.resources) ? res.data.resources : [];
        setUserResources(allResources);
        setFilteredResources(allResources);
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

  // Filter resources based on search query, category, and subject
  useEffect(() => {
    let filtered = userResources;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((resource) =>
        ['title', 'subject', 'type', 'description'].some((field) =>
          resource[field]?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((resource) => {
        const resourceCategory = resource.category?.toLowerCase();
        const filterCategory = selectedCategory.toLowerCase();
        return resourceCategory === filterCategory;
      });
    }

    // Apply subject filter
    if (selectedSubject && selectedSubject !== "all") {
      filtered = filtered.filter((resource) => {
        const resourceSubject = resource.subject?.toLowerCase();
        const filterSubject = selectedSubject.toLowerCase();
        return resourceSubject === filterSubject;
      });
    }

    setFilteredResources(filtered);
  }, [searchQuery, selectedCategory, selectedSubject, userResources]);

  const handleDeleteResource = async (resourceId) => {
    if (!resourceId) return;
    try {
      await deleteResource(resourceId);
      setUserResources((prev) => prev.filter((r) => r.id !== resourceId));
      setFilteredResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (error) {
      console.error("Failed to delete resource:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource.",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSubject("all");
  };

  const hasActiveFilters = searchQuery || (selectedCategory && selectedCategory !== "all") || (selectedSubject && selectedSubject !== "all");

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

  const tabs = ["approved"];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search and Filter Section */}
        <Card className="card-floating mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search resources by title, subject, description, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {/* Filter Options */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Category:</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Subject:</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: "{searchQuery}"
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}
                  {selectedCategory && selectedCategory !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedCategory("all")}
                      />
                    </Badge>
                  )}
                  {selectedSubject && selectedSubject !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Subject: {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => setSelectedSubject("all")}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredResources.length} of {userResources.length} resources
            </p>
          </div>
        )}

        {/* Main Content */}
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
              <TabsList className="grid w-full grid-cols-1">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                    {filteredResources.filter((r) => r.status === tab).length}
                    )
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-6">
                  <ResourceList
                    resources={filteredResources.filter((r) => r.status === tab)}
                    onDelete={handleDeleteResource}
                    emptyMessage={
                      hasActiveFilters
                        ? `No ${tab} resources match your filters.`
                        : `No ${tab} resources found.`
                    }
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Browse;
