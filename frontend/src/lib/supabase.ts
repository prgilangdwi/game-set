import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ktemtidpmoscchrxyuid.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZW10aWRwbW9zY2Nocnh5dWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzcyNzYsImV4cCI6MjA5MzkxMzI3Nn0.t7TN-r7Nu5hJdJkuveJio8gTs88n_lq5DVKo5Qpnxd0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
