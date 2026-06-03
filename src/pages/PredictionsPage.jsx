import { useState } from "react";
import { useStore } from "../store/useStore";
import { getFlag } from "../data/teams";
import { getOutcome } from "../utils/scoring";
import { isMatchLocked } from "../store/useStore";

function MatchCard({ match, prediction }) {
  const predict = useStore(s => s.predict);
  const [pick, setPick] = useState(prediction?.result ?? null);
  const [home, setHome] = useState(prediction?.home_score ?? "");
  const [away, setAway] = useState(prediction?.away_score ?? "");
  const [saved, setSaved] = useState(false);
  const [now, setNow] = useState(Date.now());
  const locked = isMatchLocked(match);

  useState(() => {
    if (locked || !match.kickoff) return;
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  });

  const getCountdown = () => {
    if (!match.kickoff || locked) return null;
    const diff = new Date(match.kickoff) - now;
    if (diff <= 0) return "⏱ Starting soon!";
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `⏰ ${days}d ${hours}h to predict`;
    if (hours > 0) return `⏰ ${hours}h ${mins}m to predict`;
    return `🚨 ${mins}m to predict!`;
  };

  const countdown = getCountdown();

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

  const formatKickoff = (kickoff) => {
    if (!kickoff) return null;
    return new Date(kickoff).toLocaleString("en-GB", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Europe/Zagreb"
    }) + " CET";
  };

  return (
    <div className={`match-card ${locked ? "locked" : ""}`}>
      <div className="mc-header">
        <span className="gbadge">
          {match.stage === "group" ? `Group ${match.group}` : match.round_label}
        </span>
        {locked && <span className="lock-badge">🔒 Locked</span>}
        {!locked && countdown && <span className="countdown">{countdown}</span>}
      </div>

      {match.kickoff && (
        <div className="kickoff-row">📅 {formatKickoff(match.kickoff)}</div>
      )}

      <div className="mc-teams">
        <div className="team-col">
          <span className="team-flag">{getFlag(match.home_team)}</span>
          <span className="team-name">{match.home_team}</span>
        </div>
        {locked
          ? <div className="result-score">{match.status === "finished" ? `${match.home_score} – ${match.away_score}` : "vs"}</div>
          : <div className="vs-mid">vs</div>}
        <div className="team-col">
          <span className="team-flag">{getFlag(match.away_team)}</span>
          <span className="team-name">{match.away_team}</span>
        </div>
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
              <input type="number" min="0" max="20" value={home}
                onChange={e => { setHome(e.target.value); setSaved(false); }}
                className="score-input" placeholder="0"/>
              <span>–</span>
              <input type="number" min="0" max="20" value={away}
                onChange={e => { setAway(e.target.value); setSaved(false); }}
                className="score-input" placeholder="0"/>
            </div>
          </div>
          <div className="mc-footer">
            <button className={`btn btn-sm ${saved ? "btn-saved" : "btn-primary"}`}
              onClick={save} disabled={!pick}>
              {saved ? "✓ Saved" : prediction ? "Update" : "Save Prediction"}
            </button>
            {!pick && <span className="hint">Pick a result first</span>}
          </div>
        </>
      )}

      {locked && prediction && (
        <div className="mc-footer">
          <span className="hint">
            Your pick: <strong>
              {prediction.result === "home" ? `${match.home_team} Win`
                : prediction.result === "away" ? `${match.away_team} Win`
                : "Draw"}
            </strong>
            {prediction.home_score !== null && prediction.home_score !== undefined
              ? ` (${prediction.home_score}–${prediction.away_score})` : ""}
          </span>
          {prediction.points > 0 && <span className="badge green">+{prediction.points} pts</span>}
        </div>
      )}
    </div>
  );
}

export default function PredictionsPage() {
  const { matches, myPredictions } = useStore();
  const [tab, setTab] = useState("upcoming");

  // Sort all matches by kickoff date, then by id for those without dates
  const sortedMatches = [...matches].sort((a, b) => {
    if (!a.kickoff && !b.kickoff) return a.id.localeCompare(b.id);
    if (!a.kickoff) return 1;
    if (!b.kickoff) return -1;
    return new Date(a.kickoff) - new Date(b.kickoff);
  });

  const upcomingMatches = sortedMatches.filter(m => !isMatchLocked(m) && m.home_team !== "TBD" && m.away_team !== "TBD");
  const lockedMatches   = sortedMatches.filter(m => isMatchLocked(m));
  const allMatches      = sortedMatches.filter(m => m.home_team !== "TBD" && m.away_team !== "TBD");

  const displayMatches = tab === "upcoming" ? upcomingMatches
    : tab === "locked" ? lockedMatches
    : allMatches;

  const totalPredicted = upcomingMatches.filter(m => myPredictions[m.id]?.result).length;
  const totalUpcoming  = upcomingMatches.length;

  // Group by date for display
  const groupByDate = (matchList) => {
    const groups = {};
    matchList.forEach(m => {
      const dateKey = m.kickoff
        ? new Date(m.kickoff).toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
            timeZone: "Europe/Zagreb"
          })
        : "Date TBC";
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  };

  const grouped = groupByDate(displayMatches);

  return (
    <div className="page">
      <h1 className="page-title">🎯 Predictions</h1>
      <p className="page-sub">
        Pick a result for each match. Optionally add exact score for +5 bonus pts. Locked at kickoff.
      </p>

      <div className="pts-strip">
        <span>🏅 Correct winner or draw = <strong>3 pts</strong></span>
        <span>🎯 Guess the exact score too = <strong>+5 bonus pts</strong></span>
        <span>🏆 Both correct = <strong>8 pts total</strong></span>
      </div>

      {/* Progress bar */}
      {totalUpcoming > 0 && (
        <div className="pred-progress">
          <div className="pred-progress-bar">
            <div className="pred-progress-fill" style={{ width: `${(totalPredicted / totalUpcoming) * 100}%` }}/>
          </div>
          <span className="pred-progress-label">{totalPredicted}/{totalUpcoming} upcoming matches predicted</span>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === "upcoming" ? "active" : ""}`} onClick={() => setTab("upcoming")}>
          Upcoming {totalUpcoming > 0 && <span className="tab-count">{totalUpcoming}</span>}
        </button>
        <button className={`tab ${tab === "locked" ? "active" : ""}`} onClick={() => setTab("locked")}>
          Locked / Results
        </button>
        <button className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
          All Matches
        </button>
      </div>

      {displayMatches.length === 0 && (
        <p className="empty">
          {tab === "upcoming" ? "No upcoming matches — all predictions are locked!" : "No matches here yet."}
        </p>
      )}

      {Object.entries(grouped).map(([date, dateMatches]) => (
        <div key={date} className="date-group">
          <div className="date-header">{date}</div>
          <div className="match-grid">
            {dateMatches.map(m => (
              <MatchCard key={m.id} match={m} prediction={myPredictions[m.id]} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
