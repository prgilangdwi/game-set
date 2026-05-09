import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { profilesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin, Calendar, Hand, Trophy, ChevronLeft, Settings,
} from "lucide-react";
import type { UserProfile } from "@/types";

const SKILL_COLORS: Record<string, string> = {
  beginner: "bg-blue-100 text-blue-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-orange-100 text-orange-700",
  pro: "bg-green-100 text-green-700",
};

const SURFACE_LABELS: Record<string, string> = {
  hard: "Hard Court",
  clay: "Clay",
  grass: "Grass",
  indoor: "Indoor",
};

function Avatar({ profile, size = "lg" }: { profile: UserProfile; size?: "sm" | "lg" }) {
  const initials = (profile.name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const sizeClass = size === "lg" ? "w-24 h-24 text-3xl" : "w-10 h-10 text-base";

  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={profile.name || "Player"}
        className={`${sizeClass} rounded-full object-cover border-2 border-border`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-forest-green/10 border-2 border-forest-green/20 flex items-center justify-center font-semibold text-forest-green`}>
      {initials}
    </div>
  );
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!userId) return;
    profilesApi.get(userId).then(setProfile).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl">
        <div className="h-24 w-24 rounded-full bg-muted animate-pulse mb-4" />
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl text-center">
        <p className="text-muted-foreground mb-4">Player not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 bg-warm-gray/30 min-h-screen max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header card */}
      <Card className="border border-border bg-white p-6 mb-4 shadow-sm">
        <div className="flex items-start gap-5">
          <Avatar profile={profile} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-foreground truncate">
                  {profile.name || "Anonymous Player"}
                </h1>
                {profile.location && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {profile.location}
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Settings className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {profile.skill_level && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${SKILL_COLORS[profile.skill_level] || "bg-muted text-foreground"}`}>
                  {profile.skill_level}
                </span>
              )}
              {profile.years_playing != null && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {profile.years_playing} {profile.years_playing === 1 ? "year" : "years"} playing
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
            {profile.bio}
          </p>
        )}
      </Card>

      {/* Details card */}
      {(profile.preferred_hand || profile.favorite_surface) && (
        <Card className="border border-border bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Playing Style</h2>
          <div className="grid grid-cols-2 gap-4">
            {profile.preferred_hand && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest-green/10 flex items-center justify-center shrink-0">
                  <Hand className="w-4 h-4 text-forest-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preferred hand</p>
                  <p className="text-sm font-medium capitalize">{profile.preferred_hand}</p>
                </div>
              </div>
            )}
            {profile.favorite_surface && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-forest-green/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-forest-green" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Favorite surface</p>
                  <p className="text-sm font-medium">{SURFACE_LABELS[profile.favorite_surface] || profile.favorite_surface}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
