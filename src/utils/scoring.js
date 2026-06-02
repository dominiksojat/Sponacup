export function getOutcome(home, away) {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

export function calcPoints(prediction, match) {
  if (!prediction || match.home_score === null || match.away_score === null) return 0;
  if (match.status !== "finished") return 0;
  let pts = 0;
  const actual = getOutcome(match.home_score, match.away_score);
  if (prediction.result === actual) pts += 3;
  if (prediction.home_score !== null && prediction.home_score !== undefined &&
      prediction.away_score !== null && prediction.away_score !== undefined &&
      prediction.home_score === match.home_score &&
      prediction.away_score === match.away_score) pts += 5;
  return pts;
}
