// client/src/pages/Upload.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, FileText, Shield, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCategories, uploadResource, getSubjects } from "../api/resource";

const Upload = () => {
  const { isAdmin, user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    file: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Upload: Component mounting, user:", JSON.stringify(user, null, 2));
    const fetchDropdownData = async () => {
      setIsFetchingData(true);
      try {
        const [categoriesResponse, subjectsResponse] = await Promise.all([
          getCategories(),
          getSubjects(),
        ]);
        console.log("Upload: Fetched categories response:", JSON.stringify(categoriesResponse, null, 2));
        console.log("Upload: Fetched subjects response:", JSON.stringify(subjectsResponse, null, 2));

        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : Array.isArray(categoriesResponse)
          ? categoriesResponse
          : [];
        const formattedCategories = categoriesData.map((cat) => ({
          value: cat.value,
          label: cat.label,
          icon: FileText,
        }));

        const subjectsData = Array.isArray(subjectsResponse.data)
          ? subjectsResponse.data
          : Array.isArray(subjectsResponse)
          ? subjectsResponse
          : [];

        setCategories(formattedCategories);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Upload: Failed to fetch categories or subjects:", JSON.stringify(error.response?.data || error.message, null, 2));
        setFetchError("Could not fetch categories or subjects from the server.");
        toast({
          variant: "destructive",
          title: "Failed to load options",
          description: "Could not fetch categories or subjects from the server.",
        });
        setCategories([]);
        setSubjects([]);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchDropdownData();
  }, [toast, user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewCategory = async () => {
    if (newCategory.trim()) {
      const categoryValue = newCategory.toLowerCase().replace(/\s+/g, '-');
      setCategories((prev) => [...prev, { value: categoryValue, label: newCategory, icon: FileText }]);
      setFormData((prev) => ({ ...prev, category: categoryValue }));
      setNewCategory("");
      setShowNewCategory(false);
      toast({
        title: "New category added!",
        description: `"${newCategory}" has been added as a category option.`,
      });
    }
  };

  const handleAddNewSubject = async () => {
    if (newSubject.trim()) {
      const subjectValue = newSubject.toLowerCase();
      setSubjects((prev) => [...prev, subjectValue]); // Use subjectValue for consistency
      setFormData((prev) => ({ ...prev, subject: subjectValue }));
      setNewSubject("");
      setShowNewSubject(false);
      toast({
        title: "New subject added!",
        description: `"${newSubject}" has been added as a subject option.`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Pass formData directly to uploadResource
      const response = await uploadResource({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subject: formData.subject,
        file: formData.file,
        uploadedBy: user.email,
      });
      console.log("Upload: Upload successful:", JSON.stringify(response, null, 2));

      setUploadSuccess(true);
      toast({
        title: "Upload successful! 🎉",
        description: "Your resource has been submitted for review. You'll be notified once it's approved.",
      });

      setTimeout(() => {
        setUploadSuccess(false);
        setFormData({
          title: "",
          description: "",
          category: "",
          subject: "",
          file: null,
        });
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      }, 3000);
    } catch (error) {
      console.error("Upload: Upload failed:", JSON.stringify(error.response?.data || error.message, null, 2));
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Rest of the JSX remains unchanged
  if (!user) {
    return null;
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="card-floating text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Admin Access Restricted</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Admins cannot upload resources. This feature is restricted to students only.
                Use the Admin Panel to review and manage student uploads.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                Go to Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isFetchingData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="card-floating text-center">
            <CardContent className="py-12">
              <p>Loading categories and subjects...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="card-floating text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Error</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{fetchError}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="card-floating text-center">
            <CardContent className="py-12">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Upload Successful!</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your resource "{formData.title}" has been submitted for review.
                Our admin team will review it within 24-48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setUploadSuccess(false)} variant="glow">
                  Upload Another Resource
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Share Your Knowledge</h1>
          <p className="text-muted-foreground text-lg">
            Upload educational resources to help your fellow students succeed
          </p>
        </div>

        <Card className="card-floating">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              Upload Resource
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Advanced Calculus Lecture Notes - Chapter 5"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  className="transition-all focus:scale-105"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of your resource. What topics does it cover? What makes it useful?"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  className="min-h-24 transition-all focus:scale-105"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  {!showNewCategory ? (
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          if (value === "add-new") {
                            setShowNewCategory(true);
                          } else {
                            handleInputChange('category', value);
                          }
                        }}
                      >
                        <SelectTrigger className="transition-all focus:scale-105 flex-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-categories" disabled>
                              No categories available
                            </SelectItem>
                          )}
                          <SelectItem value="add-new">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add New Category
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleAddNewCategory}>
                        Add
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowNewCategory(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  {!showNewSubject ? (
                    <div className="flex gap-2">
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => {
                          if (value === "add-new") {
                            setShowNewSubject(true);
                          } else {
                            handleInputChange('subject', value);
                          }
                        }}
                      >
                        <SelectTrigger className="transition-all focus:scale-105 flex-1">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.length > 0 ? (
                            subjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                {subject}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-subjects" disabled>
                              No subjects available
                            </SelectItem>
                          )}
                          <SelectItem value="add-new">
                            <div className="flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add New Subject
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new subject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleAddNewSubject}>
                        Add
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowNewSubject(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="relative">
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar"
                    className="transition-all focus:scale-105"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR (Max: 50MB)
                </p>
              </div>

              <div className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium mb-1">Review Process</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• All uploads are reviewed by our admin team</li>
                      <li>• Review typically takes 24-48 hours</li>
                      <li>• You'll be notified via dashboard about the status</li>
                      <li>• Make sure your content is original and helpful</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="glow"
                size="lg"
                disabled={isUploading || !formData.title || !formData.description || !formData.category || !formData.subject || !formData.file}
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Upload Resource
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;