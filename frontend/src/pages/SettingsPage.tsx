import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, Bell, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [saving, setSaving] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { name } });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="border border-border bg-white p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-forest-green" />
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-muted/30" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
          </div>
          <Button type="submit" className="bg-forest-green text-white hover:bg-forest-green-light" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
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
            { label: "Tournament announcements", desc: "News about your registered tournaments" },
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

      {/* Security */}
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
