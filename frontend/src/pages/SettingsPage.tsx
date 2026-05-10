import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { profilesApi } from "@/lib/api";
import { toast } from "sonner";
import { User, Bell, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "@/types";

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "pro", label: "Pro" },
];

const PREFERRED_HANDS = [
  { value: "right", label: "Right" },
  { value: "left", label: "Left" },
  { value: "ambidextrous", label: "Ambidextrous" },
];

const SURFACES = [
  { value: "hard", label: "Hard Court" },
  { value: "clay", label: "Clay" },
  { value: "grass", label: "Grass" },
  { value: "indoor", label: "Indoor" },
];

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [yearsPlaying, setYearsPlaying] = useState("");
  const [location, setLocation] = useState("");
  const [preferredHand, setPreferredHand] = useState("");
  const [favoriteSurface, setFavoriteSurface] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profilesApi.getMe().then((p) => {
      setProfile(p);
      setName(p.name || user?.user_metadata?.name || "");
      setBio(p.bio || "");
      setSkillLevel(p.skill_level || "");
      setYearsPlaying(p.years_playing != null ? String(p.years_playing) : "");
      setLocation(p.location || "");
      setPreferredHand(p.preferred_hand || "");
      setFavoriteSurface(p.favorite_surface || "");
      setAvatarUrl(p.avatar_url || "");
    }).catch(() => {
      setName(user?.user_metadata?.name || "");
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        profilesApi.updateMe({
          name: name || undefined,
          bio: bio || undefined,
          skill_level: skillLevel as UserProfile["skill_level"] || undefined,
          years_playing: yearsPlaying ? Number(yearsPlaying) : undefined,
          location: location || undefined,
          preferred_hand: preferredHand as UserProfile["preferred_hand"] || undefined,
          favorite_surface: favoriteSurface as UserProfile["favorite_surface"] || undefined,
          avatar_url: avatarUrl || undefined,
        }),
        supabase.auth.updateUser({ data: { name } }),
      ]);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl">
        <div className="h-6 w-40 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and player profile</p>
      </div>

      {/* Profile */}
      <Card className="border border-border bg-white p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-forest-green" />
          <h2 className="text-base font-semibold text-foreground">Player Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself…"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Skill Level</Label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select level</option>
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Years Playing</Label>
              <Input
                type="number"
                min={0}
                max={60}
                value={yearsPlaying}
                onChange={(e) => setYearsPlaying(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Hand</Label>
              <select
                value={preferredHand}
                onChange={(e) => setPreferredHand(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select</option>
                {PREFERRED_HANDS.map((h) => (
                  <option key={h.value} value={h.value}>{h.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Favorite Surface</Label>
              <select
                value={favoriteSurface}
                onChange={(e) => setFavoriteSurface(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select surface</option>
                {SURFACES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted/30" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
          </div>

          <Button type="submit" className="bg-forest-green text-white hover:bg-forest-green-light" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card className="border border-border bg-white p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-forest-green" />
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: "Match start reminders", desc: "Get notified when your match is about to start" },
            { label: "Score updates", desc: "Receive live score notifications" },
            { label: "Match Up announcements", desc: "News about your registered match ups" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-6 bg-muted peer-checked:bg-forest-green rounded-full transition-colors" />
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow" />
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card className="border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-forest-green" />
          <h2 className="text-base font-semibold text-foreground">Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-foreground">Sign out</div>
              <div className="text-xs text-muted-foreground">Sign out from all devices</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-destructive border-destructive/30 hover:bg-destructive/5">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
