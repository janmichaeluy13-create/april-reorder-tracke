import { useMemo, useState } from "react";

export default function App() {
  const columns = [
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
  const FOLLOW_UP_STATUSES = new Set([
    "Called – No Answer",
    "Spoke – Considering",
  ]);

  const [expandedId, setExpandedId] = useState(null);

  const [leads, setLeads] = useState([
    {
      id: "l1",
      name: "Brian Obremski",
      phone: "(262) 282-0754",
      value: 879.8,
      status: "Not Called",
      agent: "Unassigned",
      lastCallDate: "",
      outcome: "—",
      notes: "",
    },
    {
      id: "l2",
      name: "Jack Bray",
      phone: "(805) 872-5757",
      value: 669.8,
      status: "Not Called",
      agent: "Unassigned",
      lastCallDate: "",
      outcome: "—",
      notes: "",
    },
    {
      id: "l3",
      name: "Dennis Guimond (VIP)",
      phone: "(518) 578-3315",
      value: 359.8,
      status: "Not Called",
      agent: "Unassigned",
      lastCallDate: "",
      outcome: "—",
      notes: "Repeat buyer — prioritize",
    },
  ]);

  function updateLead(id, patch) {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
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

  function computePriority(value, name = "") {
    if (/VIP/i.test(name)) return "VIP";
    if (value >= 500) return "P1";
    if (value >= 250) return "P2";
    if (value >= 180) return "P3";
    return "P4";
  }

  const priorityColor = (p) =>
    p === "VIP"
      ? "#7c3aed"
      : p === "P1"
      ? "#dc2626"
      : p === "P2"
      ? "#f97316"
      : p === "P3"
      ? "#eab308"
      : "#cbd5e1";

  const rows = useMemo(
    () =>
      leads.map((l) => ({
        ...l,
        priority: computePriority(l.value, l.name),
        followUp: shouldFollowUp(l),
      })),
    [leads]
  );

  return (
    <div className="wrap">
      <h1>April Reorder Call Tracker</h1>
      <div className="small">
        CRM‑style compact list — click a row to expand.
      </div>

      <div className="board" style={{ marginTop: 16 }}>
        {columns.map((col) => (
          <div className="col" key={col}>
            <h3>{col}</h3>

            {rows
              .filter((r) => r.status === col)
              .map((lead) => {
                const open = expandedId === lead.id;

                return (
                  <div
                    key={lead.id}
                    className={`card ${open ? "expanded" : ""}`}
                    style={{
                      borderLeft: `6px solid ${priorityColor(lead.priority)}`,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setExpandedId(open ? null : lead.id)
                    }
                  >
                    {/* COMPACT ROW */}
                    <div className="card-header">
                      <div className="card-name">{lead.name}</div>
                      <div className="card-meta">
                        {lead.phone} • ${lead.value.toFixed(2)} •{" "}
                        {lead.priority} • {lead.status}
                      </div>
                    </div>

                    {/* EXPANDED PANEL */}
                    {open && (
                      <div
                        className="card-details"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="small">Agent</div>
                        <select
                          value={lead.agent}
                          onChange={(e) =>
                            updateLead(lead.id, {
                              agent: e.target.value,
                            })
                          }
                        >
                          {agents.map((a) => (
                            <option key={a}>{a}</option>
                          ))}
                        </select>

                        <div className="small">Outcome</div>
                        <select
                          value={lead.outcome}
                          onChange={(e) =>
                            updateLead(lead.id, {
                              outcome: e.target.value,
                            })
                          }
                        >
                          {outcomes.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>

                        <div className="small">Last Call Date</div>
                        <input
                          type="date"
                          value={lead.lastCallDate}
                          onChange={(e) =>
                            updateLead(lead.id, {
                              lastCallDate: e.target.value,
                            })
                          }
                        />

                        <div
                          className={
                            lead.followUp ? "flag-bad" : "flag-ok"
                          }
                        >
                          {lead.followUp
                            ? "FOLLOW UP REQUIRED"
                            : "OK"}
                        </div>

                        <div className="small">Notes</div>
                        <textarea
                          value={lead.notes}
                          onChange={(e) =>
                            updateLead(lead.id, {
                              notes: e.target.value,
                            })
                          }
                        />

                        <div style={{ display: "flex", gap: 6 }}>
                          {columns
                            .filter((c) => c !== col)
                            .map((c) => (
                              <button
                                key={c}
                                className="btn"
                                onClick={() =>
                                  updateLead(lead.id, {
                                    status: c,
                                  })
                                }
                              >
                                {c}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

            {rows.filter((r) => r.status === col).length === 0 && (
              <div className="small">No leads</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
