import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profilesApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Search, Users } from "lucide-react";
import type { UserProfile, SkillLevel } from "@/types";

const SKILL_COLORS: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-orange-100 text-orange-700",
  pro: "bg-green-100 text-green-700",
};

const SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced", "pro"];

function PlayerCard({ profile }: { profile: UserProfile }) {
  const initials = (profile.name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Link to={`/profile/${profile.id}`}>
      <Card className="border border-border bg-white p-4 shadow-sm hover:shadow-md hover:border-forest-green/30 transition-all cursor-pointer group">
        <div className="flex items-center gap-3 mb-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name || "Player"}
              className="w-11 h-11 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-forest-green/10 border border-forest-green/20 flex items-center justify-center font-semibold text-forest-green text-sm">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-foreground truncate group-hover:text-forest-green transition-colors">
              {profile.name || "Anonymous"}
            </p>
            {profile.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {profile.skill_level && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SKILL_COLORS[profile.skill_level] || "bg-muted text-foreground"}`}>
              {profile.skill_level}
            </span>
          )}
          {profile.years_playing != null && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {profile.years_playing}y
            </span>
          )}
        </div>

        {profile.bio && (
          <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}
      </Card>
    </Link>
  );
}

export function CommunityPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<SkillLevel | "">("");

  useEffect(() => {
    profilesApi.list().then(setProfiles).finally(() => setLoading(false));
  }, []);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.bio || "").toLowerCase().includes(q);
    const matchesSkill = !skillFilter || p.skill_level === skillFilter;
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-foreground">Community</h1>
        <p className="text-muted-foreground text-sm mt-1">Find players and connect with the sports community</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, location, or bio…"
            className="pl-9"
          />
        </div>
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value as SkillLevel | "")}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All levels</option>
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">
            {search || skillFilter ? "No players match your filters." : "No players yet."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            {filtered.length} {filtered.length === 1 ? "player" : "players"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => <PlayerCard key={p.id} profile={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
