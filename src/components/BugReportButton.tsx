'use client';

import { useState } from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

export function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: '',
    userEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast({
        title: 'Error',
        description: 'Please fill in the title and description',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit bug report');
      }

      toast({
        title: 'Bug Report Submitted',
        description: 'Thank you! We\'ll look into this issue.',
      });

      setFormData({
        title: '',
        description: '',
        steps: '',
        userEmail: '',
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit bug report',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Bug Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600 hover:shadow-xl active:scale-95"
        title="Report a Bug"
        aria-label="Report a Bug"
      >
        <Bug className="h-6 w-6" />
      </button>

      {/* Bug Report Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              Report a Bug
            </DialogTitle>
            <DialogDescription>
              Help us improve by reporting any issues you encounter. We'll investigate and get back to you!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Email */}
            <div>
              <Label htmlFor="userEmail">
                Your Email {!session && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="userEmail"
                type="email"
                placeholder={session?.user?.email || "your@email.com"}
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                defaultValue={session?.user?.email || ''}
                required={!session}
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll use this to follow up with you about the bug
              </p>
            </div>

            {/* Bug Title */}
            <div>
              <Label htmlFor="title">
                Bug Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what happened..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                maxLength={2000}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length} / 2000 characters
              </p>
            </div>

            {/* Steps to Reproduce */}
            <div>
              <Label htmlFor="steps">Steps to Reproduce (Optional)</Label>
              <Textarea
                id="steps"
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Help us recreate the issue
              </p>
            </div>

            {/* Current Page Info */}
            <div className="rounded-lg bg-muted p-3 text-xs">
              <p className="font-semibold mb-1">System Information (automatically included):</p>
              <p className="text-muted-foreground">Page: {typeof window !== 'undefined' ? window.location.pathname : ''}</p>
              {session && <p className="text-muted-foreground">User: {session.user?.email}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-red-500 hover:bg-red-600">
                {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
