import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { getFlag, ALL_TEAMS } from "../data/teams";

function MatchRow({ match }) {
  const { updateMatch, setResult } = useStore();
  const [edit, setEdit] = useState(false);
  const [ht, setHt] = useState(match.home_team);
  const [at, setAt] = useState(match.away_team);
  const [ko, setKo] = useState(match.kickoff?.slice(0,16)||"");
  const [status, setStatus] = useState(match.status);
  const [hs, setHs] = useState(match.home_score??"");
  const [as_, setAs] = useState(match.away_score??"");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateMatch(match.id, { home_team:ht, away_team:at, kickoff:ko||null, status });
    if (status==="finished" && hs!=="" && as_!=="") await setResult(match.id, +hs, +as_);
    setSaving(false); setEdit(false);
  };

  return (
    <div className={`admin-row ${match.status}`}>
      <div className="admin-row-info">
        <span className="gbadge">{match.group?`Grp ${match.group}`:(match.round_label||match.round)}</span>
        <span className="admin-teams">{getFlag(match.home_team)} {match.home_team} vs {getFlag(match.away_team)} {match.away_team}</span>
        {match.status==="finished" && <span className="score-box">{match.home_score}–{match.away_score}</span>}
        <span className={`status-pill ${match.status}`}>{match.status}</span>
        {!edit && <button className="btn btn-ghost btn-sm" onClick={()=>setEdit(true)}>Edit</button>}
      </div>
      {edit && (
        <div className="edit-form">
          <div className="edit-row"><label>Home</label>
            <select value={ht} onChange={e=>setHt(e.target.value)}>
              {["TBD",...ALL_TEAMS].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="edit-row"><label>Away</label>
            <select value={at} onChange={e=>setAt(e.target.value)}>
              {["TBD",...ALL_TEAMS].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="edit-row"><label>Kickoff</label>
            <input type="datetime-local" value={ko} onChange={e=>setKo(e.target.value)}/>
          </div>
          <div className="edit-row"><label>Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live (locks predictions)</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          {status==="finished" && (
            <div className="edit-row"><label>Score</label>
              <input type="number" min="0" max="20" value={hs} onChange={e=>setHs(e.target.value)} className="score-input" placeholder="0"/>
              <span>–</span>
              <input type="number" min="0" max="20" value={as_} onChange={e=>setAs(e.target.value)} className="score-input" placeholder="0"/>
            </div>
          )}
          <div className="edit-actions">
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?"Saving…":"Save"}</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setEdit(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsTab() {
  const { matches, fetchMatches, seedMatches } = useStore();
  const [filter, setFilter] = useState("upcoming");
  const [seeding, setSeeding] = useState(false);
  const filtered = matches.filter(m => filter==="all" ? true : m.status===filter);

  const handleSeed = async () => {
    if (!confirm("Generate all group + knockout matches?")) return;
    setSeeding(true); await seedMatches(); setSeeding(false);
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="filter-row">
          {["upcoming","finished","all"].map(f=>(
            <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button className="btn btn-secondary btn-sm" onClick={handleSeed} disabled={seeding}>
            {seeding?"Generating…":"⚡ Generate All Matches"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={fetchMatches}>↻ Refresh</button>
        </div>
      </div>
      {filtered.length===0 && <p className="empty">No {filter} matches. Click "Generate All Matches" to start.</p>}
      <div className="admin-list">{filtered.map(m=><MatchRow key={m.id} match={m}/>)}</div>
    </div>
  );
}

function GroupsTab() {
  const { groups, updateGroup } = useStore();
  return (
    <div>
      <p className="admin-note">⚠️ Update once the official FIFA draw is confirmed.</p>
      {Object.entries(groups).map(([letter, teams]) => (
        <GroupEditor key={letter} letter={letter} teams={teams} onSave={updateGroup}/>
      ))}
    </div>
  );
}

function GroupEditor({ letter, teams, onSave }) {
  const [local, setLocal] = useState([...teams]);
  const [saved, setSaved] = useState(false);
  const set = (i,v) => { const t=[...local]; t[i]=v; setLocal(t); };
  const save = async () => { await onSave(letter, local); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  return (
    <div className="group-editor">
      <h3>Group {letter}</h3>
      <div className="group-teams">
        {local.map((t,i)=>(
          <select key={i} value={t} onChange={e=>set(i,e.target.value)}>
            {["TBD",...ALL_TEAMS].map(team=><option key={team} value={team}>{team}</option>)}
          </select>
        ))}
        <button className={`btn btn-sm ${saved?"btn-saved":"btn-secondary"}`} onClick={save}>
          {saved?"✓ Saved":"Save"}
        </button>
      </div>
    </div>
  );
}

function UsersTab() {
  const { fetchAllUsers, deleteUser, makeAdmin, user: me } = useStore();
  const [users, setUsers] = useState([]);
  useEffect(() => { fetchAllUsers().then(setUsers); }, []);

  return (
    <div>
      <p className="admin-note">{users.length} registered users.</p>
      <table className="lb-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Points</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u=>(
            <tr key={u.id}>
              <td>{u.name}{u.id===me?.id&&<span className="you-tag">You</span>}</td>
              <td style={{fontSize:".8rem",color:"var(--text-soft)"}}>{u.email||"—"}</td>
              <td><span className={`status-pill ${u.role==="admin"?"live":"upcoming"}`}>{u.role}</span></td>
              <td>{u.points}</td>
              <td style={{display:"flex",gap:"6px"}}>
                {u.role!=="admin" && u.id!==me?.id && (
                  <button className="btn btn-ghost btn-sm" onClick={async()=>{await makeAdmin(u.id);fetchAllUsers().then(setUsers);}}>
                    Make Admin
                  </button>
                )}
                {u.id!==me?.id && (
                  <button className="btn btn-ghost btn-sm danger" onClick={async()=>{if(confirm(`Remove ${u.name}?`)){await deleteUser(u.id);setUsers(p=>p.filter(x=>x.id!==u.id));}}}>
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState("results");
  return (
    <div className="page">
      <h1 className="page-title">⚙️ Admin Panel</h1>
      <p className="page-sub">Manage matches, groups, and players.</p>
      <div className="tabs">
        {[{id:"results",label:"⚽ Results"},{id:"groups",label:"🗂️ Groups"},{id:"users",label:"👥 Users"}].map(t=>(
          <button key={t.id} className={`tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {tab==="results" && <ResultsTab/>}
      {tab==="groups" && <GroupsTab/>}
      {tab==="users" && <UsersTab/>}
    </div>
  );
}
