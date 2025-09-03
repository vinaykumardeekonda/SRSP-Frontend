// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, Clock, FileText, Users, AlertTriangle, Activity, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPendingResources, updateResourceStatus, deleteAdminResource } from '@/api/admin';

const AdminPanel = () => {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pendingResources, setPendingResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('AdminPanel: Current user:', JSON.stringify(user, null, 2));
  console.log('AdminPanel: Is authenticated:', isAuthenticated);
  console.log('AdminPanel: Is Admin:', isAdmin);
  console.log('AdminPanel: Auth token:', localStorage.getItem('authToken')); 

  const fetchResources = async () => {
    if (!isAuthenticated || !isAdmin) {
      console.log('AdminPanel: Not authenticated or not admin, skipping fetch.');
      setError('Access denied: Please log in as an admin.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('AdminPanel: Fetching pending resources...');
      const resources = await getPendingResources(localStorage.getItem('authToken'));
      console.log('AdminPanel: Fetched resources:', JSON.stringify(resources, null, 2));

      setPendingResources(Array.isArray(resources) ? resources : []);
      toast({
        title: 'Resources loaded',
        description: `Fetched ${resources.length} resources.`,
      });
    } catch (error) {
      console.error('AdminPanel: Failed to fetch resources:', JSON.stringify(error.response?.data || error.message, null, 2));
      const errorMessage = error.response?.status === 403
        ? 'Access denied: Admin privileges required. Please log out and log in with an admin account.'
        : error.response?.data?.message || 'Could not fetch resources from the server.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Failed to load resources',
        description: errorMessage,
      });
      setPendingResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchResources();
    } else if (!isAuthenticated) {
      setIsLoading(false);
      setError('Please log in to access the admin panel.');
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to access the admin panel.',
      });
      navigate('/login');
    } else if (isAuthenticated && !isAdmin) {
      setIsLoading(false);
      setError('You do not have administrative privileges.');
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have administrative privileges.',
      });
      navigate('/dashboard');
    }
  }, [isAuthenticated, isAdmin, toast, navigate]);

  const handleApprove = async (resourceId) => {
    try {
      await updateResourceStatus(resourceId, 'approved');
      toast({
        title: 'Resource approved ✅',
        description: 'The resource is now available to students.',
      });
      fetchResources();
    } catch (error) {
      console.error('AdminPanel: Error approving resource:', JSON.stringify(error.response?.data || error.message, null, 2));
      toast({
        variant: 'destructive',
        title: 'Approval failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  const handleReject = async (resourceId) => {
    try {
      await updateResourceStatus(resourceId, 'rejected');
      toast({
        title: 'Resource rejected ❌',
        description: 'The resource has been rejected and the author will be notified.',
        variant: 'destructive',
      });
      fetchResources();
    } catch (error) {
      console.error('AdminPanel: Error rejecting resource:', JSON.stringify(error.response?.data || error.message, null, 2));
      toast({
        variant: 'destructive',
        title: 'Rejection failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  const handleDelete = async (resourceId) => {
    try {
      await deleteAdminResource(resourceId);
      toast({
        title: 'Resource deleted 🗑️',
        description: 'The resource has been permanently removed.',
      });
      fetchResources();
    } catch (error) {
      console.error('AdminPanel: Error deleting resource:', JSON.stringify(error.response?.data || error.message, null, 2));
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Unknown</Badge>;
    }
  };

  const stats = {
    totalSubmissions: pendingResources.length,
    pendingReviews: pendingResources.filter(r => r.status === 'pending').length,
    approvedToday: pendingResources.filter(r =>
      r.status === 'approved' &&
      new Date(r.updatedAt).toDateString() === new Date().toDateString()
    ).length,
    rejectedToday: pendingResources.filter(r =>
      r.status === 'rejected' &&
      new Date(r.updatedAt).toDateString() === new Date().toDateString()
    ).length,
    activeUsers: new Set(
      pendingResources
        .filter(r => r.uploadedBy?._id) // Changed from uploadedBy.id
        .map(r => r.uploadedBy._id) // Changed from uploadedBy.id
    ).size
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              navigate('/login');
            }}
          >
            Log Out and Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Admin Panel</h1>
          <p className="text-muted-foreground text-lg">
            Manage resource submissions and monitor platform activity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-floating group cursor-pointer hover-scale" onClick={() => navigate('/admin/logs')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">System Logs</h3>
              <p className="text-sm text-muted-foreground">View detailed system activity logs</p>
            </CardContent>
          </Card>

          <Card className="card-floating group cursor-pointer hover-scale" onClick={() => navigate('/admin/activity')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">User Activity</h3>
              <p className="text-sm text-muted-foreground">Monitor user sessions and activities</p>
            </CardContent>
          </Card>

          <Card className="card-floating group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Active Users</h3>
              <p className="text-2xl font-bold text-primary">{stats.activeUsers}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary">{stats.totalSubmissions}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-500">{stats.pendingReviews}</div>
              <div className="text-sm text-muted-foreground">Pending Reviews</div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500">{stats.approvedToday}</div>
              <div className="text-sm text-muted-foreground">Approved Today</div>
            </CardContent>
          </Card>

          <Card className="card-floating">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-500">{stats.rejectedToday}</div>
              <div className="text-sm text-muted-foreground">Rejected Today</div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-floating">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Resource Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({pendingResources.filter(r => r.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approved ({pendingResources.filter(r => r.status === 'approved').length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Rejected ({pendingResources.filter(r => r.status === 'rejected').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  {pendingResources.filter(r => r.status === 'pending').length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                      <p className="text-muted-foreground">No pending reviews at the moment.</p>
                    </div>
                  ) : (
                    pendingResources.filter(r => r.status === 'pending').map((resource) => (
                      <Card key={resource._id} className="border-yellow-500/20">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{resource.title || 'Untitled'}</h3>
                                {getStatusBadge(resource.status)}
                              </div>
                              <p className="text-muted-foreground mb-3">{resource.description || 'No description'}</p>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Category:</span> {resource.type || 'N/A'}
                                </div>
                                <div>
                                  <span className="font-medium">Subject:</span> {resource.subject || 'N/A'}
                                </div>
                                <div>
                                  <span className="font-medium">Uploaded By:</span> {resource.uploadedBy?.email || 'N/A'} ({resource.uploadedBy?.name || 'N/A'})
                                </div>
                                <div>
                                  <span className="font-medium">Upload Date:</span> {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                                {resource.file ? (
                                  <div>
                                    <span className="font-medium">File:</span> {resource.file || 'N/A'}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="font-medium">File:</span> No file
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="success"
                              size="sm"
                              className="gap-2 bg-green-500 hover:bg-green-600"
                              onClick={() => handleApprove(resource._id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2 bg-red-500 hover:bg-red-600"
                              onClick={() => handleReject(resource._id)}
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(resource._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="approved" className="mt-6">
                <div className="space-y-4">
                  {pendingResources.filter(r => r.status === 'approved').length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No approved resources.</p>
                  ) : (
                    pendingResources.filter(r => r.status === 'approved').map((resource) => (
                      <Card key={resource._id} className="border-green-500/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{resource.title || 'Untitled'}</h3>
                                {getStatusBadge(resource.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                By {resource.uploadedBy?.name || 'N/A'} • Approved on {resource.updatedAt ? new Date(resource.updatedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(resource._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="rejected" className="mt-6">
                <div className="space-y-4">
                  {pendingResources.filter(r => r.status === 'rejected').length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No rejected resources.</p>
                  ) : (
                    pendingResources.filter(r => r.status === 'rejected').map((resource) => (
                      <Card key={resource._id} className="border-red-500/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{resource.title || 'Untitled'}</h3>
                                {getStatusBadge(resource.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                By {resource.uploadedBy?.name || 'N/A'} • Rejected on {resource.updatedAt ? new Date(resource.updatedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(resource._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;