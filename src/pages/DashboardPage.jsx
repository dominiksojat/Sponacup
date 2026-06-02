import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { getFlag } from "../data/teams";

export default function DashboardPage() {
  const { user, matches, leaderboard, myPredictions, fetchLeaderboard } = useStore();
  useEffect(() => { fetchLeaderboard(); }, []);

  const myRank = leaderboard.find(u => u.id === user?.id);
  const upcoming = matches.filter(m => m.status === "upcoming" && m.home_team !== "TBD" && m.away_team !== "TBD").slice(0, 5);
  const recent = matches.filter(m => m.status === "finished").slice(-5).reverse();

  return (
    <div className="page">
      <h1 className="page-title">🏆 Dashboard</h1>

      <div className="stats-row">
        <div className="stat accent"><div className="stat-val">#{myRank?.rank ?? "—"}</div><div className="stat-lbl">Your Rank</div></div>
        <div className="stat"><div className="stat-val">{user?.points ?? 0}</div><div className="stat-lbl">Your Points</div></div>
        <div className="stat"><div className="stat-val">{Object.keys(myPredictions).length}</div><div className="stat-lbl">Predictions</div></div>
        <div className="stat"><div className="stat-val">{matches.filter(m=>m.status==="finished").length}</div><div className="stat-lbl">Matches Played</div></div>
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card-head"><h2>Upcoming Matches</h2><Link to="/predictions" className="link-sm">Predict all →</Link></div>
          {upcoming.length === 0 ? <p className="empty">No upcoming matches yet.</p> : (
            <ul className="match-list">
              {upcoming.map(m => {
                const pred = myPredictions[m.id];
                return (
                  <li key={m.id} className="match-row">
                    <span className="gbadge">{m.group || m.round}</span>
                    <span>{getFlag(m.home_team)} {m.home_team}</span>
                    <span className="vs">vs</span>
                    <span>{getFlag(m.away_team)} {m.away_team}</span>
                    {pred
                      ? <span className="badge green">{pred.result === "home" ? `${m.home_team} Win` : pred.result === "away" ? `${m.away_team} Win` : "Draw"} ✓</span>
                      : <Link to="/predictions" className="badge gold">Predict</Link>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-head"><h2>Leaderboard</h2><Link to="/leaderboard" className="link-sm">Full table →</Link></div>
          {leaderboard.length === 0 ? <p className="empty">No participants yet.</p> : (
            <ul className="lb-mini">
              {leaderboard.slice(0,5).map(u => (
                <li key={u.id} className={`lb-row ${u.id === user?.id ? "me" : ""}`}>
                  <span className="lb-rank">#{u.rank}</span>
                  <span className="lb-name">{u.name}</span>
                  <span className="lb-pts">{u.points} pts</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card wide">
          <div className="card-head"><h2>Recent Results</h2></div>
          {recent.length === 0 ? <p className="empty">No results yet — tournament hasn't started.</p> : (
            <ul className="match-list">
              {recent.map(m => {
                const pred = myPredictions[m.id];
                return (
                  <li key={m.id} className="match-row">
                    <span className="gbadge">{m.group || m.round}</span>
                    <span>{getFlag(m.home_team)} {m.home_team}</span>
                    <span className="score-box">{m.home_score}–{m.away_score}</span>
                    <span>{getFlag(m.away_team)} {m.away_team}</span>
                    {pred
                      ? <span className={`badge ${pred.points > 0 ? "green" : "grey"}`}>+{pred.points} pts</span>
                      : <span className="badge grey">No pred</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
