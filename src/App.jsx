import { useMemo, useState } from "react";

export default function App() {
  const [view, setView] = useState("list");      // "list" | "board"
  const [groupBy, setGroupBy] = useState("status"); // "status" | "agent"
  const [query, setQuery] = useState("");
  const [drawerId, setDrawerId] = useState(null);

  const statusCols = [
    "Not Called",
    "Called – No Answer",
    "Spoke – Considering",
    "Reorder Placed",
    "Do Not Call",
  ];

  const agents = ["Unassigned", "Agent 1", "Agent 2", "Agent 3", "Manager"];

  const outcomes = [
    "—",
    "Left Voicemail",
    "No Answer",
    "Spoke – Not Interested",
    "Spoke – Interested",
    "Spoke – Follow Up Requested",
    "Reorder Completed",
    "Do Not Call Requested",
  ];

  const FOLLOW_UP_DAYS = 2;
  const FOLLOW_UP_STATUSES = new Set(["Called – No Answer", "Spoke – Considering"]);

  const [leads, setLeads] = useState([
    { id:"l1", name:"Brian Obremski", phone:"(262) 282-0754", value:879.8, status:"Not Called", agent:"Unassigned", lastCallDate:"", outcome:"—", notes:"" },
    { id:"l2", name:"Jack Bray", phone:"(805) 872-5757", value:669.8, status:"Not Called", agent:"Unassigned", lastCallDate:"", outcome:"—", notes:"" },
    { id:"l3", name:"Dennis Guimond (VIP)", phone:"(518) 578-3315", value:359.8, status:"Not Called", agent:"Unassigned", lastCallDate:"", outcome:"—", notes:"Repeat buyer — prioritize" },
  ]);

  function updateLead(id, patch) {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
  }

  function daysSince(dateStr) {
    if (!dateStr) return Infinity;
    const d = new Date(dateStr + "T00:00:00");
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }

  function shouldFollowUp(lead) {
    if (!FOLLOW_UP_STATUSES.has(lead.status)) return false;
    return daysSince(lead.lastCallDate) >= FOLLOW_UP_DAYS;
  }

  function computePriority(value, name="") {
    if (/VIP/i.test(name)) return "VIP";
    if (value >= 500) return "P1";
    if (value >= 250) return "P2";
    if (value >= 180) return "P3";
    return "P4";
  }

  function priorityColor(p){
    if (p === "VIP") return "var(--vip)";
    if (p === "P1") return "var(--p1)";
    if (p === "P2") return "var(--p2)";
    if (p === "P3") return "var(--p3)";
    return "var(--p4)";
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .map(l => ({
        ...l,
        priority: computePriority(l.value, l.name),
        followUp: shouldFollowUp(l),
      }))
      .filter(l => {
        if (!q) return true;
        return (
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          String(l.value).includes(q) ||
          l.status.toLowerCase().includes(q) ||
          l.agent.toLowerCase().includes(q)
        );
      });
  }, [leads, query]);

  const boardColumns = useMemo(() => (groupBy === "status" ? statusCols : agents), [groupBy, statusCols, agents]);

  function keyForLead(lead){
    return groupBy === "status" ? lead.status : lead.agent;
  }

  const drawerLead = drawerId ? leads.find(l => l.id === drawerId) : null;

  return (
    <div className="wrap">
      <h1>April Reorder Call Tracker</h1>
      <div className="small">Table view + board view. Changing Status/Agent moves the lead automatically.</div>

      <div className="toolbar">
        <div className="toolbarLeft">
          <button className={`pillBtn ${view==="list" ? "active":""}`} onClick={() => setView("list")}>List</button>
          <button className={`pillBtn ${view==="board" ? "active":""}`} onClick={() => setView("board")}>Board</button>

          <input
            className="cellSelect"
            style={{ minWidth: 240 }}
            placeholder="Search name / phone / status / agent…"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </div>

        <div className="toolbarRight">
          <span className="small">Group board by:</span>
          <button className={`pillBtn ${groupBy==="status" ? "active":""}`} onClick={() => setGroupBy("status")}>Status</button>
          <button className={`pillBtn ${groupBy==="agent" ? "active":""}`} onClick={() => setGroupBy("agent")}>Agent</button>
        </div>
      </div>

      {view === "list" && (
        <div className="tableWrap">
          <table className="crmTable">
            <thead>
              <tr>
                <th>Name</th><th>Phone</th><th>$</th><th>Priority</th>
                <th>Status</th><th>Agent</th><th>Outcome</th><th>Last Call</th><th>Follow‑up</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr className="crmRow" key={l.id}>
                  <td>
                    <span className="nameLink" onClick={() => setDrawerId(l.id)}>{l.name}</span>
                  </td>
                  <td>{l.phone}</td>
                  <td>${l.value.toFixed(2)}</td>
                  <td>
                    <span className="badge">
                      <span className="dot" style={{ background: priorityColor(l.priority) }} />
                      {l.priority}
                    </span>
                  </td>

                  <td>
                    <select className="cellSelect" value={l.status} onChange={(e)=>updateLead(l.id,{ status: e.target.value })}>
                      {statusCols.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="cellSelect" value={l.agent} onChange={(e)=>updateLead(l.id,{ agent: e.target.value })}>
                      {agents.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="cellSelect" value={l.outcome} onChange={(e)=>updateLead(l.id,{ outcome: e.target.value })}>
                      {outcomes.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </td>
                  <td>
                    <input className="cellSelect" type="date" value={l.lastCallDate} onChange={(e)=>updateLead(l.id,{ lastCallDate: e.target.value })}/>
                  </td>
                  <td>
                    <span className={l.followUp ? "flag-bad" : "flag-ok"}>
                      {l.followUp ? "FOLLOW UP" : "OK"}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="small" style={{ padding: 14 }}>No results.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === "board" && (
        <div className="board">
          {boardColumns.map((col) => (
            <div className="col" key={col}>
              <h3>
                {col} <span className="small">({rows.filter(r => keyForLead(r) === col).length})</span>
              </h3>

              {rows.filter(r => keyForLead(r) === col).map((l) => (
                <div key={l.id} className="card" style={{ borderLeft: `6px solid ${priorityColor(l.priority)}` }}>
                  <div className="card-header">
                    <div className="card-name" onDoubleClick={() => setDrawerId(l.id)} title="Double‑click to edit">{l.name}</div>
                    <span className="badge">
                      <span className="dot" style={{ background: priorityColor(l.priority) }} />
                      {l.priority}
                    </span>
                  </div>
                  <div className="card-meta">{l.phone} • ${l.value.toFixed(2)}</div>
                  <div className={l.followUp ? "flag-bad" : "flag-ok"}>{l.followUp ? "FOLLOW UP" : "OK"}</div>
                </div>
              ))}

              {rows.filter(r => keyForLead(r) === col).length === 0 && (
                <div className="small" style={{ fontStyle:"italic" }}>No leads</div>
              )}
            </div>
          ))}
        </div>
      )}

      {drawerLead && (
        <div className="drawerBackdrop" onClick={() => setDrawerId(null)}>
          <div className="drawer" onClick={(e)=>e.stopPropagation()}>
            <div className="drawerHeader">
              <div className="drawerTitle">{drawerLead.name}</div>
              <button className="pillBtn" onClick={() => setDrawerId(null)}>Close</button>
            </div>

            <div className="small">{drawerLead.phone} • ${drawerLead.value.toFixed(2)}</div>

            <span className="smallLabel">Status</span>
            <select className="cellSelect" value={drawerLead.status} onChange={(e)=>updateLead(drawerLead.id,{status:e.target.value})}>
              {statusCols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <span className="smallLabel">Agent</span>
            <select className="cellSelect" value={drawerLead.agent} onChange={(e)=>updateLead(drawerLead.id,{agent:e.target.value})}>
              {agents.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <span className="smallLabel">Outcome</span>
            <select className="cellSelect" value={drawerLead.outcome} onChange={(e)=>updateLead(drawerLead.id,{outcome:e.target.value})}>
              {outcomes.map(o => <option key={o} value={o}>{o}</option>)}
            </select>

            <span className="smallLabel">Last Call Date</span>
            <input className="cellSelect" type="date" value={drawerLead.lastCallDate} onChange={(e)=>updateLead(drawerLead.id,{lastCallDate:e.target.value})} />

            <span className="smallLabel">Notes</span>
            <textarea value={drawerLead.notes} onChange={(e)=>updateLead(drawerLead.id,{notes:e.target.value})} />
          </div>
        </div>
      )}
    </div>
  );
}
