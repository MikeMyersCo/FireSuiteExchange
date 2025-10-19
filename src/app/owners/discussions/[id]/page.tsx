'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MessageCircle, Eye, Clock, Pin, Lock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
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
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  replies: Reply[];
}

export default function DiscussionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discussionId = params?.id as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/owners');
    }
  }, [status, router]);

  useEffect(() => {
    if (discussionId) {
      fetchDiscussion();
    }
  }, [discussionId]);

  const fetchDiscussion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/discussions/${discussionId}`);
      const data = await response.json();

      if (data.success) {
        setDiscussion(data.discussion);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Discussion not found',
          variant: 'destructive',
        });
        router.push('/owners');
      }
    } catch (error) {
      console.error('Error fetching discussion:', error);
      toast({
        title: 'Error',
        description: 'Failed to load discussion',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast({
        title: 'Error',
        description: 'Reply cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: replyContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }

      toast({
        title: 'Success',
        description: 'Reply posted successfully',
      });

      setReplyContent('');
      fetchDiscussion();
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!session || !discussion) {
    return null;
  }

  const isVerifiedOwner = session.user.role !== 'GUEST';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/owners')}
            className="gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discussions
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Discussion Card */}
        <Card className="p-8 space-y-6 shadow-card-elevated">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {discussion.isPinned && (
                    <Pin className="w-5 h-5 text-primary" />
                  )}
                  <h1 className="text-3xl font-bold leading-tight">
                    {discussion.title}
                  </h1>
                  {discussion.isLocked && (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <Badge variant="secondary" className="text-sm">
                  {discussion.category}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
                  {discussion.author.name?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <span className="font-medium text-foreground">
                  {discussion.author.name || 'Anonymous'}
                </span>
                {discussion.author.role === 'ADMIN' && (
                  <Badge variant="default" className="text-xs">Admin</Badge>
                )}
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(discussion.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {discussion.viewCount} views
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {discussion.replyCount} replies
              </span>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {discussion.content}
            </p>
          </div>
        </Card>

        {/* Replies Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Replies ({discussion.replies.length})
          </h2>

          {/* Reply Form */}
          {isVerifiedOwner && !discussion.isLocked && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  disabled={isSubmitting}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {replyContent.length} / 2000 characters
                  </p>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !replyContent.trim()}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post Reply
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {discussion.isLocked && (
            <Card className="p-6 bg-muted/50 text-center">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                This discussion has been locked and no longer accepts new replies.
              </p>
            </Card>
          )}

          {!isVerifiedOwner && (
            <Card className="p-6 bg-muted/50 text-center">
              <p className="text-muted-foreground">
                You must be a verified suite owner to reply to discussions.
              </p>
            </Card>
          )}

          {/* Replies List */}
          <div className="space-y-4">
            {discussion.replies.length === 0 ? (
              <Card className="p-8 text-center bg-muted/30">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No replies yet. Be the first to respond!
                </p>
              </Card>
            ) : (
              discussion.replies.map((reply, index) => (
                <Card
                  key={reply.id}
                  className="p-6 hover:shadow-card-elevated transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10 shrink-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      {reply.author.name?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">
                          {reply.author.name || 'Anonymous'}
                        </span>
                        {reply.author.role === 'ADMIN' && (
                          <Badge variant="default" className="text-xs">Admin</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(reply.createdAt)}
                        </span>
                      </div>

                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
