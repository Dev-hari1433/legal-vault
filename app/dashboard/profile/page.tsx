'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Calendar, Save, Camera, Shield, Loader2,
  Globe, Briefcase, Heart, Droplet, Languages as LanguagesIcon, Fingerprint,
  Plus, X, AlertCircle, CheckCircle2, Upload,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { useAuth } from '@/components/auth-provider';
import { useProfile } from '@/hooks/use-dashboard-data';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: Gender | '';
  blood_group: string;
  nationality: string;
  address: string;
  occupation: string;
  marital_status: MaritalStatus | '';
  religion: string;
  emergency_contact: string;
  languages: string[];
  biometric_enabled: boolean;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  email?: string;
  nationality?: string;
  address?: string;
  occupation?: string;
  emergency_contact?: string;
  religion?: string;
}

function getInitials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}

export default function ProfilePage() {
  const { user } = useAuth();
  const profileQ = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    nationality: '',
    address: '',
    occupation: '',
    marital_status: '',
    religion: '',
    emergency_contact: '',
    languages: [],
    biometric_enabled: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [languageInput, setLanguageInput] = useState('');
  const [completionPct, setCompletionPct] = useState(0);

  useEffect(() => {
    if (profileQ.data) {
      const p = profileQ.data;
      setForm({
        full_name: p.full_name || '',
        email: p.email || user?.email || '',
        phone: p.phone || '',
        date_of_birth: p.date_of_birth || '',
        gender: (p.gender as Gender) || '',
        blood_group: p.blood_group || '',
        nationality: p.nationality || '',
        address: p.address || '',
        occupation: p.occupation || '',
        marital_status: (p.marital_status as MaritalStatus) || '',
        religion: p.religion || '',
        emergency_contact: p.emergency_contact || '',
        languages: p.languages || [],
        biometric_enabled: p.biometric_enabled ?? false,
      });
      setAvatarUrl(p.avatar_url || user?.user_metadata?.avatar_url || null);
    } else if (user) {
      setForm((prev) => ({
        ...prev,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        email: user.email || '',
      }));
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [profileQ.data, user]);

  const fieldsList: (keyof FormState)[] = [
    'full_name', 'phone', 'date_of_birth', 'gender', 'blood_group',
    'nationality', 'address', 'occupation', 'marital_status',
    'emergency_contact', 'languages',
  ];

  useEffect(() => {
    const filled = fieldsList.filter((f) => {
      const val = form[f];
      if (Array.isArray(val)) return val.length > 0;
      return val !== '' && val !== null && val !== undefined;
    });
    setCompletionPct(Math.round((filled.length / fieldsList.length) * 100));
  }, [form]);

  const validate = useCallback((): FormErrors => {
    const e: FormErrors = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    else if (form.full_name.trim().length < 2) e.full_name = 'Name must be at least 2 characters';
    else if (form.full_name.trim().length > 100) e.full_name = 'Name must be under 100 characters';

    if (form.phone && !/^[+\d\s()\-]{7,20}$/.test(form.phone))
      e.phone = 'Enter a valid phone number';
    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      const now = new Date();
      if (dob > now) e.date_of_birth = 'Date of birth cannot be in the future';
      if (dob.getFullYear() < 1900) e.date_of_birth = 'Enter a valid year';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (form.nationality && form.nationality.length > 60)
      e.nationality = 'Nationality must be under 60 characters';
    if (form.address && form.address.length > 300)
      e.address = 'Address must be under 300 characters';
    if (form.occupation && form.occupation.length > 100)
      e.occupation = 'Occupation must be under 100 characters';
    if (form.emergency_contact && form.emergency_contact.length > 200)
      e.emergency_contact = 'Emergency contact must be under 200 characters';
    if (form.religion && form.religion.length > 50)
      e.religion = 'Religion must be under 50 characters';
    return e;
  }, [form]);

  const updateField = (field: keyof FormState, value: string | string[] | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const addLanguage = () => {
    const lang = languageInput.trim();
    if (lang && !form.languages.includes(lang) && form.languages.length < 10) {
      updateField('languages', [...form.languages, lang]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (lang: string) => {
    updateField('languages', form.languages.filter((l) => l !== lang));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Profile photo must be under 5 MB.', variant: 'destructive' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPG, PNG, WebP, or GIF image.', variant: 'destructive' });
      return;
    }

    setUploadingPhoto(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Photo updated', description: 'Your profile picture has been updated.' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Could not upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({ title: 'Please fix the errors', description: 'Some fields need attention before saving.', variant: 'destructive' });
      return;
    }

    if (!user) return;
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        blood_group: form.blood_group || null,
        nationality: form.nationality.trim() || null,
        address: form.address.trim() || null,
        occupation: form.occupation.trim() || null,
        marital_status: form.marital_status || null,
        religion: form.religion.trim() || null,
        emergency_contact: form.emergency_contact.trim() || null,
        languages: form.languages,
        biometric_enabled: form.biometric_enabled,
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: 'Profile saved', description: 'Your changes have been saved successfully.' });
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Could not save your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(form.full_name || 'User');
  const isLoading = profileQ.isLoading;

  return (
    <div>
      <DashboardPageHeader
        title="Profile"
        description="Manage your personal information and account settings."
        action={
          <Button onClick={handleSave} disabled={saving || isLoading} className="shadow-glow">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar — avatar + completion */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <Avatar className="h-28 w-28 ring-4 ring-background shadow-soft">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={form.full_name} />
                    ) : null}
                    <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto || !user}
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform hover:scale-110 disabled:opacity-50"
                    aria-label="Change photo"
                  >
                    {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                {uploadingPhoto && (
                  <p className="text-xs text-muted-foreground mt-3">Uploading photo...</p>
                )}
                <h2 className="mt-4 text-lg font-semibold">{form.full_name || 'Your name'}</h2>
                <p className="text-sm text-muted-foreground">{form.email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <Shield className="h-3 w-3" /> Verified Account
                </div>
                <Separator className="my-4" />
                <div className="w-full space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profile Completion</span>
                    <span className="font-medium">{completionPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Biometric Auth</span>
                    <span className={`font-medium ${form.biometric_enabled ? 'text-success' : 'text-muted-foreground'}`}>
                      {form.biometric_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Biometric preference card */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Fingerprint className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Biometric Login</h3>
                  <Switch
                    checked={form.biometric_enabled}
                    onCheckedChange={(checked) => updateField('biometric_enabled', checked)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Allow signing in with fingerprint or face recognition on supported devices.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right — form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-1">Personal Information</h2>
            <p className="text-sm text-muted-foreground mb-6">All fields are validated. Religion is optional.</p>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-10 w-full bg-muted rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-10 w-full bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full_name"
                        value={form.full_name}
                        onChange={(e) => updateField('full_name', e.target.value)}
                        className="pl-10"
                        placeholder="John Doe"
                        aria-invalid={!!errors.full_name}
                      />
                    </div>
                    {errors.full_name && <FieldError msg={errors.full_name} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={form.email}
                        disabled
                        className="pl-10 bg-muted/50"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => updateField('date_of_birth', e.target.value)}
                        className="pl-10"
                        max={new Date().toISOString().split('T')[0]}
                        aria-invalid={!!errors.date_of_birth}
                      />
                    </div>
                    {errors.date_of_birth && <FieldError msg={errors.date_of_birth} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => updateField('gender', v)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Blood Group + Marital Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blood_group">Blood Group</Label>
                    <Select value={form.blood_group} onValueChange={(v) => updateField('blood_group', v)}>
                      <SelectTrigger id="blood_group">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((bg) => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select value={form.marital_status} onValueChange={(v) => updateField('marital_status', v)}>
                      <SelectTrigger id="marital_status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                        <SelectItem value="separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Phone + Nationality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="pl-10"
                        placeholder="+1 (555) 123-4567"
                        aria-invalid={!!errors.phone}
                      />
                    </div>
                    {errors.phone && <FieldError msg={errors.phone} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nationality"
                        value={form.nationality}
                        onChange={(e) => updateField('nationality', e.target.value)}
                        className="pl-10"
                        placeholder="American"
                        aria-invalid={!!errors.nationality}
                      />
                    </div>
                    {errors.nationality && <FieldError msg={errors.nationality} />}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="pl-10"
                      placeholder="100 Security Plaza, San Francisco, CA 94101"
                      aria-invalid={!!errors.address}
                    />
                  </div>
                  {errors.address && <FieldError msg={errors.address} />}
                </div>

                {/* Occupation + Religion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="occupation"
                        value={form.occupation}
                        onChange={(e) => updateField('occupation', e.target.value)}
                        className="pl-10"
                        placeholder="Marketing Director"
                        aria-invalid={!!errors.occupation}
                      />
                    </div>
                    {errors.occupation && <FieldError msg={errors.occupation} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion">
                      Religion <span className="text-muted-foreground text-xs">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="religion"
                        value={form.religion}
                        onChange={(e) => updateField('religion', e.target.value)}
                        className="pl-10"
                        placeholder="Optional"
                        aria-invalid={!!errors.religion}
                      />
                    </div>
                    {errors.religion && <FieldError msg={errors.religion} />}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Emergency Contact</Label>
                  <div className="relative">
                    <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emergency_contact"
                      value={form.emergency_contact}
                      onChange={(e) => updateField('emergency_contact', e.target.value)}
                      className="pl-10"
                      placeholder="Jane Doe — +1 (555) 987-6543"
                      aria-invalid={!!errors.emergency_contact}
                    />
                  </div>
                  {errors.emergency_contact && <FieldError msg={errors.emergency_contact} />}
                  <p className="text-xs text-muted-foreground">Name and phone number of someone to contact in an emergency.</p>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LanguagesIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLanguage();
                          }
                        }}
                        className="pl-10"
                        placeholder="Add a language and press Enter"
                        maxLength={30}
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={addLanguage} disabled={!languageInput.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                          {lang}
                          <button
                            onClick={() => removeLanguage(lang)}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                            aria-label={`Remove ${lang}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Press Enter or click + to add. Max 10 languages.</p>
                </div>

                {/* Save bar */}
                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 text-sm">
                    {Object.keys(errors).length > 0 ? (
                      <span className="flex items-center gap-1.5 text-destructive">
                        <AlertCircle className="h-4 w-4" /> {Object.keys(errors).length} field(s) need attention
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-success">
                        <CheckCircle2 className="h-4 w-4" /> All fields valid
                      </span>
                    )}
                  </div>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3" /> {msg}
    </p>
  );
}
