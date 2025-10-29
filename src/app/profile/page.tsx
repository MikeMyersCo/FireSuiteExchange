'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, User as UserIcon, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  contactEmail: string | null;
  contactMessenger: string | null;
  contactLink: string | null;
  showInDirectory: boolean;
  role: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    contactEmail: '',
    contactMessenger: '',
    contactLink: '',
    showInDirectory: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/settings');
      const data = await response.json();

      if (data.success) {
        setUserSettings(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          contactEmail: data.user.contactEmail || '',
          contactMessenger: data.user.contactMessenger || '',
          contactLink: data.user.contactLink || '',
          showInDirectory: data.user.showInDirectory || false,
        });
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setUserSettings(data.user);
      toast({
        title: 'Success',
        description: 'Your settings have been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session || !userSettings) {
    return null;
  }

  const isVerifiedOwner = userSettings.role !== 'GUEST';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and privacy settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Info Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                {userSettings.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{userSettings.name || 'User'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={userSettings.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {userSettings.role}
                  </Badge>
                  {isVerifiedOwner && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Verified Owner
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Basic Information
                </h3>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userSettings.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Listing Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Listing Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                  These details will auto-populate when you create new ticket listings
                </p>

                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="your-email@example.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Preferred email for buyers to contact you about listings
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="contactMessenger">Facebook Messenger</Label>
                    <Input
                      id="contactMessenger"
                      type="text"
                      value={formData.contactMessenger}
                      onChange={(e) => setFormData({ ...formData, contactMessenger: e.target.value })}
                      placeholder="your.messenger.username"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your Facebook Messenger username for instant messaging
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="contactLink">Other Contact Link</Label>
                    <Input
                      id="contactLink"
                      type="text"
                      value={formData.contactLink}
                      onChange={(e) => setFormData({ ...formData, contactLink: e.target.value })}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Any other contact method (WhatsApp, Instagram, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Directory Settings */}
              {isVerifiedOwner && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Owners Directory</h3>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-6">
                          <input
                            id="showInDirectory"
                            type="checkbox"
                            checked={formData.showInDirectory}
                            onChange={(e) => setFormData({ ...formData, showInDirectory: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <label
                            htmlFor="showInDirectory"
                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                          >
                            {formData.showInDirectory ? (
                              <Eye className="w-4 h-4 text-primary" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                            Show my profile in the Owners Directory
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            When enabled, other verified suite owners can see your name, email, phone number, and suite information in the Owners Directory.
                          </p>
                        </div>
                      </div>

                      {formData.showInDirectory && (
                        <div className="pl-7 space-y-2">
                          <p className="text-sm font-medium">The following information will be visible:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Your name: {formData.name || 'Not set'}</li>
                            <li>Your email: {userSettings.email}</li>
                            <li>Your phone: {formData.phone || 'Not set'}</li>
                            <li>Your verified suites</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
