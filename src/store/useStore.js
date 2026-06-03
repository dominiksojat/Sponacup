import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { calcPoints, getOutcome } from "../utils/scoring";
import { SCHEDULE } from "../data/schedule";

// Auto-lock: a match is locked if kickoff time has passed
export function isMatchLocked(match) {
  if (match.status === "finished" || match.status === "live") return true;
  if (match.kickoff && new Date(match.kickoff) <= new Date()) return true;
  return false;
}

export const useStore = create((set, get) => ({
  user: null,
  authLoading: true,
  matches: [],
  groups: {},
  leaderboard: [],
  myPredictions: {},

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await get().fetchProfile(session.user);
    set({ authLoading: false });

    supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) {
        await get().fetchProfile(session.user);
      } else {
        set({ user: null, myPredictions: {} });
      }
    });

    get().fetchMatches();
    get().fetchGroups();
    get().fetchLeaderboard();
  },

  fetchProfile: async (authUser) => {
    const { data } = await supabase
      .from("profiles").select("*").eq("id", authUser.id).single();
    if (data) {
      set({ user: { ...data, email: authUser.email } });
      get().fetchMyPredictions(authUser.id);
    }
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  signup: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password,
      options: { data: { name } } });
    if (error) return { error: error.message };
    if (!data?.user?.id) return { error: "Signup failed, please try again." };

    const { error: pe } = await supabase.from("profiles")
      .insert({ id: data.user.id, name, role: "user", points: 0 });
    if (pe) return { error: "Profile error: " + pe.message };

    set({ user: { id: data.user.id, name, role: "user", points: 0, email } });
    return { success: true };
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Invalid email or password." };
    return { success: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, myPredictions: {} });
  },

  // ── Matches ───────────────────────────────────────────────────────────────
  fetchMatches: async () => {
    const { data } = await supabase.from("matches").select("*").order("id");
    if (data) set({ matches: data });
  },

  seedMatches: async () => {
    const { matches: existing } = get();
    const all = SCHEDULE.map(m => {
      const found = existing.find(e => e.id === m.id);
      return {
        ...m,
        kickoff: found?.kickoff || m.kickoff || null,
        home_score: null,
        away_score: null,
        status: "upcoming",
      };
    });
    await supabase.from("matches").upsert(all, { onConflict: "id" });
    get().fetchMatches();
  },

  updateMatch: async (id, updates) => {
    await supabase.from("matches").update(updates).eq("id", id);
    get().fetchMatches();
  },

  setResult: async (id, homeScore, awayScore) => {
    await supabase.from("matches")
      .update({ home_score: homeScore, away_score: awayScore, status: "finished" })
      .eq("id", id);

    const { data: preds } = await supabase.from("predictions")
      .select("*").eq("match_id", id);

    if (preds?.length) {
      const actual = getOutcome(homeScore, awayScore);
      for (const p of preds) {
        let pts = 0;
        if (p.result === actual) pts += 3;
        if (p.home_score === homeScore && p.away_score === awayScore &&
            p.home_score !== null) pts += 5;
        await supabase.from("predictions").update({ points: pts }).eq("id", p.id);
      }
      // recalc totals
      const { data: allPreds } = await supabase.from("predictions").select("user_id, points");
      if (allPreds) {
        const totals = {};
        allPreds.forEach(({ user_id, points }) => {
          totals[user_id] = (totals[user_id] || 0) + (points || 0);
        });
        for (const [uid, pts] of Object.entries(totals)) {
          await supabase.from("profiles").update({ points: pts }).eq("id", uid);
        }
      }
    }
    get().fetchMatches();
    get().fetchLeaderboard();
    const { user } = get();
    if (user) {
      get().fetchProfile({ id: user.id, email: user.email });
      get().fetchMyPredictions(user.id);
    }
  },

  // ── Groups ────────────────────────────────────────────────────────────────
  fetchGroups: async () => {
    const { data } = await supabase.from("groups").select("*").order("id");
    if (data) {
      const groups = {};
      data.forEach(g => { groups[g.id] = g.teams; });
      set({ groups });
    }
  },

  updateGroup: async (id, teams) => {
    await supabase.from("groups").update({ teams }).eq("id", id);
    get().fetchGroups();
  },

  // ── Predictions ───────────────────────────────────────────────────────────
  fetchMyPredictions: async (userId) => {
    const { data } = await supabase.from("predictions")
      .select("*").eq("user_id", userId);
    if (data) {
      const map = {};
      data.forEach(p => { map[p.match_id] = p; });
      set({ myPredictions: map });
    }
  },

  predict: async (matchId, result, homeScore, awayScore) => {
    const { user, matches } = get();
    if (!user) return { error: "Not logged in." };
    const match = matches.find(m => m.id === matchId);
    if (!match) return { error: "Match not found." };
    if (isMatchLocked(match)) return { error: "This match is locked — kickoff has passed." };

    const payload = {
      user_id: user.id, match_id: matchId, result,
      home_score: homeScore ?? null,
      away_score: awayScore ?? null,
      points: 0,
    };
    const { error } = await supabase.from("predictions")
      .upsert(payload, { onConflict: "user_id,match_id" });
    if (error) return { error: error.message };

    set(s => ({ myPredictions: { ...s.myPredictions, [matchId]: payload } }));
    return { success: true };
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────
  fetchLeaderboard: async () => {
    const { data } = await supabase.from("profiles")
      .select("id, name, points, role")
      .order("points", { ascending: false });
    if (data) {
      set({ leaderboard: data.map((u, i) => ({ ...u, rank: i + 1 })) });
    }
  },

  // ── Admin: all users ──────────────────────────────────────────────────────
  fetchAllUsers: async () => {
    const { data } = await supabase.from("profiles").select("*").order("points", { ascending: false });
    return data || [];
  },

  deleteUser: async (id) => {
    await supabase.from("profiles").delete().eq("id", id);
    get().fetchLeaderboard();
  },

  makeAdmin: async (id) => {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", id);
  },
}));
