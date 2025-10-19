'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Users, Plus, Eye, MessageCircle, Clock, Pin, Lock, Search, Sparkles, Mail, Phone, Home, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Owner {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  suites: {
    area: string;
    number: number;
    displayName: string;
  }[];
}

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

const CATEGORIES = ['All', 'General', 'Events', 'Tips & Tricks', 'Marketplace', 'Support'];

export default function OwnersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [owners, setOwners] = useState<Owner[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'General',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/owners');
    }
  }, [status, router]);

  useEffect(() => {
    fetchOwners();
    fetchDiscussions();
  }, []);

  useEffect(() => {
    filterDiscussions();
  }, [discussions, selectedCategory, searchQuery]);

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/owners');
      const data = await response.json();
      if (data.success) {
        setOwners(data.owners);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchDiscussions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/discussions');
      const data = await response.json();
      if (data.success) {
        setDiscussions(data.discussions);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDiscussions = () => {
    let filtered = discussions;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDiscussions(filtered);
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDiscussion.title || !newDiscussion.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDiscussion),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create discussion');
      }

      toast({
        title: 'Success',
        description: 'Discussion created successfully',
      });

      setNewDiscussion({ title: '', content: '', category: 'General' });
      setIsCreateDialogOpen(false);
      fetchDiscussions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading owners community...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isVerifiedOwner = session.user.role !== 'GUEST';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button
              variant="ghost"
              className="gap-2 hover:scale-105 transition-transform"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Suite Owners Community</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to the Owners Lounge
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with fellow suite owners, share insights, and stay updated on the latest events
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="discussions" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Directory
            </TabsTrigger>
          </TabsList>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="transition-all hover:scale-105"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {isVerifiedOwner && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4" />
                      New Discussion
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Start a New Discussion</DialogTitle>
                      <DialogDescription>
                        Share your thoughts, questions, or insights with fellow suite owners
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateDiscussion} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="What's on your mind?"
                          value={newDiscussion.title}
                          onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                          maxLength={200}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newDiscussion.category}
                          onValueChange={(value) => setNewDiscussion({ ...newDiscussion, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.filter(c => c !== 'All').map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          placeholder="Share your thoughts in detail..."
                          value={newDiscussion.content}
                          onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                          rows={8}
                          maxLength={5000}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {newDiscussion.content.length} / 5000 characters
                        </p>
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? 'Creating...' : 'Create Discussion'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Discussion List */}
            <div className="space-y-4">
              {filteredDiscussions.length === 0 ? (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isVerifiedOwner
                      ? 'Be the first to start a conversation!'
                      : 'Become a verified suite owner to join the conversation'}
                  </p>
                  {isVerifiedOwner && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      Start Discussion
                    </Button>
                  )}
                </Card>
              ) : (
                filteredDiscussions.map((discussion) => (
                  <Card
                    key={discussion.id}
                    className="p-6 hover:shadow-card-elevated transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                    onClick={() => router.push(`/owners/discussions/${discussion.id}`)}
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                        {discussion.author.name?.charAt(0).toUpperCase() || 'A'}
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {discussion.isPinned && (
                                <Pin className="w-4 h-4 text-primary shrink-0" />
                              )}
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                {discussion.title}
                              </h3>
                              {discussion.isLocked && (
                                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {discussion.content}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {discussion.category}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-foreground">
                              {discussion.author.name || 'Anonymous'}
                            </span>
                            {discussion.author.role === 'ADMIN' && (
                              <Badge variant="default" className="text-xs">Admin</Badge>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(discussion.lastActivityAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {discussion.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {discussion.replyCount} replies
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Directory Tab */}
          <TabsContent value="directory" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Verified Suite Owners</h2>
              <p className="text-muted-foreground">
                Connect with {owners.length} fellow suite owners in our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {owners.map((owner) => (
                <Card
                  key={owner.id}
                  className="p-6 hover:shadow-card-elevated transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-center space-y-4">
                    <Avatar className="h-16 w-16 mx-auto bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                      {owner.name?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>

                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {owner.name || 'Anonymous Owner'}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant={owner.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {owner.role}
                        </Badge>
                        <Badge variant="outline">
                          Verified
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Suites</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {owner.suites.map((suite, idx) => (
                          <Badge key={idx} variant="secondary" className="font-mono">
                            {suite.displayName}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
                      <div className="space-y-2">
                        <a
                          href={`mailto:${owner.email}`}
                          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {owner.email}
                        </a>
                        {owner.phone && (
                          <a
                            href={`tel:${owner.phone}`}
                            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {owner.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {owners.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No verified owners yet</h3>
                <p className="text-muted-foreground">
                  Be the first to verify your suite ownership!
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
