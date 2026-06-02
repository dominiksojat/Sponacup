import { useState } from "react";
import { useStore } from "../store/useStore";
import { getFlag } from "../data/teams";
import { getOutcome } from "../utils/scoring";

function MatchCard({ match, prediction }) {
  const predict = useStore(s => s.predict);
  const [pick, setPick] = useState(prediction?.result ?? null);
  const [home, setHome] = useState(prediction?.home_score ?? "");
  const [away, setAway] = useState(prediction?.away_score ?? "");
  const [saved, setSaved] = useState(false);
  const locked = match.status !== "upcoming";

  const actual = locked && match.home_score !== null
    ? getOutcome(match.home_score, match.away_score) : null;

  const save = async () => {
    if (!pick) return;
    const r = await predict(match.id, pick, home !== "" ? +home : undefined, away !== "" ? +away : undefined);
    if (r.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const btnClass = (val) => {
    let cls = `result-btn ${val}-btn`;
    if (!locked) { if (pick === val) cls += " selected"; return cls; }
    if (prediction?.result === val) {
      if (actual === val) cls += " correct";
      else cls += " wrong";
    }
    return cls;
  };

  return (
    <div className={`match-card ${locked ? "locked" : ""}`}>
      <div className="mc-header">
        <span className="gbadge">{match.group ? `Group ${match.group}` : match.round_label}</span>
        {locked && <span className="lock-badge">🔒 Locked</span>}
        {match.kickoff && <span className="kickoff-time">{new Date(match.kickoff).toLocaleString()}</span>}
      </div>

      <div className="mc-teams">
        <div className="team-col"><span className="team-flag">{getFlag(match.home_team)}</span><span className="team-name">{match.home_team}</span></div>
        {locked
          ? <div className="result-score">{match.status === "finished" ? `${match.home_score} – ${match.away_score}` : "vs"}</div>
          : <div className="vs-mid">vs</div>}
        <div className="team-col"><span className="team-flag">{getFlag(match.away_team)}</span><span className="team-name">{match.away_team}</span></div>
      </div>

      <div className={`result-btns ${locked ? "readonly" : ""}`}>
        <button className={btnClass("home")} onClick={() => !locked && (setPick("home"), setSaved(false))}>
          <span className="rb-flag">{getFlag(match.home_team)}</span>
          <span className="rb-label">Win</span>
        </button>
        <button className={btnClass("draw")} onClick={() => !locked && (setPick("draw"), setSaved(false))}>
          <span className="rb-label">Draw</span>
        </button>
        <button className={btnClass("away")} onClick={() => !locked && (setPick("away"), setSaved(false))}>
          <span className="rb-flag">{getFlag(match.away_team)}</span>
          <span className="rb-label">Win</span>
        </button>
      </div>

      {!locked && (
        <>
          <div className="score-opt">
            <span className="score-hint">Optional exact score → <strong>+5 pts</strong></span>
            <div className="score-inputs">
              <input type="number" min="0" max="20" value={home} onChange={e=>{setHome(e.target.value);setSaved(false);}} className="score-input" placeholder="0"/>
              <span>–</span>
              <input type="number" min="0" max="20" value={away} onChange={e=>{setAway(e.target.value);setSaved(false);}} className="score-input" placeholder="0"/>
            </div>
          </div>
          <div className="mc-footer">
            <button className={`btn btn-sm ${saved ? "btn-saved" : "btn-primary"}`} onClick={save} disabled={!pick}>
              {saved ? "✓ Saved" : prediction ? "Update" : "Save Prediction"}
            </button>
            {!pick && <span className="hint">Pick a result first</span>}
          </div>
        </>
      )}

      {locked && prediction && (
        <div className="mc-footer">
          <span className="hint">
            Your pick: <strong>{prediction.result === "home" ? `${match.home_team} Win` : prediction.result === "away" ? `${match.away_team} Win` : "Draw"}</strong>
            {prediction.home_score !== null && prediction.home_score !== undefined ? ` (${prediction.home_score}–${prediction.away_score})` : ""}
          </span>
          {prediction.points > 0 && <span className="badge green">+{prediction.points} pts</span>}
        </div>
      )}
    </div>
  );
}

export default function PredictionsPage() {
  const { matches, myPredictions } = useStore();
  const [tab, setTab] = useState("group");
  const [grp, setGrp] = useState("A");

  const groupMatches = matches.filter(m => m.stage === "group");
  const koMatches = matches.filter(m => m.stage === "knockout");
  const groups = [...new Set(groupMatches.map(m => m.group))].sort();
  const koRounds = [...new Set(koMatches.map(m => m.round))];

  return (
    <div className="page">
      <h1 className="page-title">🎯 Predictions</h1>
      <p className="page-sub">Pick a result. Optionally add exact score for +5 bonus pts. Locked at kickoff.</p>

      <div className="pts-strip">
        <span>✅ Correct result = <strong>3 pts</strong></span>
        <span>🎯 Exact score = <strong>+5 pts</strong></span>
        <span>🏆 Both = <strong>8 pts</strong></span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==="group"?"active":""}`} onClick={()=>setTab("group")}>Group Stage</button>
        <button className={`tab ${tab==="knockout"?"active":""}`} onClick={()=>setTab("knockout")}>Knockout</button>
      </div>

      {tab === "group" && (
        <>
          <div className="grp-tabs">
            {groups.map(g => {
              const done = groupMatches.filter(m=>m.group===g).every(m=>myPredictions[m.id]?.result);
              return (
                <button key={g} className={`grp-tab ${grp===g?"active":""} ${done?"done":""}`} onClick={()=>setGrp(g)}>
                  {g}{done?" ✓":""}
                </button>
              );
            })}
          </div>
          <div className="match-grid">
            {groupMatches.filter(m=>m.group===grp).map(m => (
              <MatchCard key={m.id} match={m} prediction={myPredictions[m.id]}/>
            ))}
          </div>
        </>
      )}

      {tab === "knockout" && (
        <div className="ko-section">
          {koRounds.map(round => {
            const rms = koMatches.filter(m=>m.round===round);
            return (
              <div key={round} className="ko-round">
                <h2 className="ko-label">{rms[0]?.round_label}</h2>
                <div className="match-grid">
                  {rms.map(m => <MatchCard key={m.id} match={m} prediction={myPredictions[m.id]}/>)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
