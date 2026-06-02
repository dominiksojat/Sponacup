// Leaderboard
import { useEffect } from "react";
import { useStore } from "../store/useStore";

const MEDALS = ["🥇","🥈","🥉"];

export function LeaderboardPage() {
  const { user, leaderboard, matches, fetchLeaderboard } = useStore();
  useEffect(() => { fetchLeaderboard(); }, []);
  const played = matches.filter(m=>m.status==="finished").length;
  return (
    <div className="page">
      <h1 className="page-title">🏆 Leaderboard</h1>
      <p className="page-sub">{played} matches played · {leaderboard.length} participants</p>
      {leaderboard.length === 0 ? <p className="empty">No participants yet.</p> : (
        <div className="table-wrap">
          <table className="lb-table">
            <thead><tr><th>Rank</th><th>Player</th><th>Points</th></tr></thead>
            <tbody>
              {leaderboard.map(u => (
                <tr key={u.id} className={u.id===user?.id?"my-row":""}>
                  <td>{MEDALS[u.rank-1]||`#${u.rank}`}</td>
                  <td><strong>{u.name}</strong>{u.id===user?.id&&<span className="you-tag">You</span>}</td>
                  <td className="pts-td">{u.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="scoring-box">
        <h3>Scoring</h3>
        <ul>
          <li>✅ Correct result: <strong>3 pts</strong></li>
          <li>🎯 Exact score bonus: <strong>+5 pts</strong></li>
          <li>🏆 Both correct: <strong>8 pts</strong></li>
        </ul>
      </div>
    </div>
  );
}

export default LeaderboardPage;
