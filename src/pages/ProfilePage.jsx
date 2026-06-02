import { useStore } from "../store/useStore";
import { getFlag } from "../data/teams";

export default function ProfilePage() {
  const { user, matches, myPredictions, leaderboard } = useStore();
  const myRank = leaderboard.find(u => u.id === user?.id);
  const finished = matches.filter(m => m.status === "finished" && myPredictions[m.id]);
  const correct = finished.filter(m => myPredictions[m.id]?.points > 0).length;
  const exact = finished.filter(m => {
    const p = myPredictions[m.id];
    return p?.home_score === m.home_score && p?.away_score === m.away_score && p?.home_score !== null;
  }).length;

  return (
    <div className="page">
      <h1 className="page-title">👤 My Stats</h1>
      <div className="profile-head">
        <div className="big-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div><h2>{user?.name}</h2><p>{user?.email}</p></div>
      </div>
      <div className="stats-row">
        <div className="stat accent"><div className="stat-val">#{myRank?.rank??"—"}</div><div className="stat-lbl">Rank</div></div>
        <div className="stat"><div className="stat-val">{user?.points??0}</div><div className="stat-lbl">Points</div></div>
        <div className="stat"><div className="stat-val">{correct}/{finished.length}</div><div className="stat-lbl">Correct</div></div>
        <div className="stat"><div className="stat-val">{exact}</div><div className="stat-lbl">Exact Scores</div></div>
      </div>
      <h2 className="section-title">Match History</h2>
      {finished.length === 0 ? <p className="empty">No finished matches with your predictions yet.</p> : (
        <div className="history">
          {finished.map(m => {
            const p = myPredictions[m.id];
            return (
              <div key={m.id} className={`history-row ${p.points > 0 ? "win" : "miss"}`}>
                <div className="history-match">
                  <span>{getFlag(m.home_team)} {m.home_team}</span>
                  <span className="score-box">{m.home_score}–{m.away_score}</span>
                  <span>{getFlag(m.away_team)} {m.away_team}</span>
                </div>
                <div className="history-pick">
                  {p.result==="home" ? `${m.home_team} Win` : p.result==="away" ? `${m.away_team} Win` : "Draw"}
                  {p.home_score !== null && p.home_score !== undefined ? ` (${p.home_score}–${p.away_score})` : ""}
                </div>
                <div className={`history-pts ${p.points>0?"good":"zero"}`}>+{p.points} pts</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
