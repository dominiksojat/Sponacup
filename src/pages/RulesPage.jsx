export default function RulesPage() {
  return (
    <div className="page">
      <h1 className="page-title">📋 Rules & Scoring</h1>
      <p className="page-sub">A friendly internal prediction pool. No real money — just bragging rights.</p>
      <div className="rules-grid">
        <section className="card">
          <h2>How It Works</h2>
          <ol>
            <li>Sign up and create your account.</li>
            <li>Go to Predictions and pick a result for each match — Home Win, Draw, or Away Win.</li>
            <li>Optionally predict the exact score for bonus points.</li>
            <li>Predictions lock when the match kicks off.</li>
            <li>Admin enters results and points update automatically.</li>
            <li>Check the leaderboard to see how you rank!</li>
          </ol>
        </section>
        <section className="card">
          <h2>⚽ Scoring</h2>
          <table className="rules-table">
            <thead><tr><th>Achievement</th><th>Points</th></tr></thead>
            <tbody>
              <tr><td>✅ Correct result (win or draw)</td><td><strong>3 pts</strong></td></tr>
              <tr><td>🎯 Exact scoreline (bonus)</td><td><strong>+5 pts</strong></td></tr>
              <tr><td>🏆 Both correct</td><td><strong>8 pts</strong></td></tr>
            </tbody>
          </table>
          <div className="example-box">
            <strong>Example:</strong> You pick Brazil Win + score 2–1. Result: Brazil 2–1.
            You earn 3 + 5 = <strong>8 points!</strong>
          </div>
        </section>
        <section className="card">
          <h2>🔒 Prediction Deadlines</h2>
          <ul>
            <li>Predictions must be submitted before kickoff.</li>
            <li>Once locked, no changes allowed.</li>
            <li>If you miss a match, you score 0 for that match.</li>
            <li>Exact score is optional — just picking a result is fine.</li>
          </ul>
        </section>
        <section className="card">
          <h2>🤝 Fair Play</h2>
          <ul>
            <li>This is a fun internal contest — no money involved.</li>
            <li>Results entered by the designated admin.</li>
            <li>Raise any disputes with the admin directly.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
