import { useEffect, useMemo, useRef, useState } from "react";

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

  function priorityColor(priority) {
    if (priority === "VIP") return "var(--vip)";
    if (priority === "P1") return "var(--p1)";
    if (priority === "P2") return "var(--p2)";
    if (priority === "P3") return "var(--p3)";
    return "var(--p4)";
  }

  const rows = useMemo(
    () =>
      leads.map((l) => ({
        ...l,
        priority: computePriority(l.value, l.name),
        followUp: shouldFollowUp(l),
      })),
    [leads]
  );

  // ---------- Keyboard Navigation (roving focus) ----------
  const rowRefs = useRef(new Map());

  const orderedIds = useMemo(() => {
    return columns.flatMap((col) =>
      rows.filter((r) => r.status === col).map((r) => r.id)
    );
  }, [columns, rows]);

  const idToIndex = useMemo(() => {
    const m = new Map();
    orderedIds.forEach((id, i) => m.set(id, i));
    return m;
  }, [orderedIds]);

  const [activeId, setActiveId] = useState(() => orderedIds[0] ?? null);

  useEffect(() => {
    if (!activeId && orderedIds.length) setActiveId(orderedIds[0]);
    if (activeId && !idToIndex.has(activeId) && orderedIds.length) {
      setActiveId(orderedIds[0]);
    }
  }, [orderedIds, idToIndex, activeId]);

  useEffect(() => {
    if (!activeId) return;
    const el = rowRefs.current.get(activeId);
    if (el) el.focus();
  }, [activeId]);

  function onBoardKeyDown(e) {
    if (!activeId) return;

    const i = idToIndex.get(activeId);
    if (i === undefined) return;

    const keys = [
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
      "Enter",
      " ",
      "Escape",
    ];
    if (!keys.includes(e.key)) return;

    e.preventDefault();

    if (e.key === "ArrowDown") {
      setActiveId(orderedIds[Math.min(i + 1, orderedIds.length - 1)]);
    } else if (e.key === "ArrowUp") {
      setActiveId(orderedIds[Math.max(i - 1, 0)]);
    } else if (e.key === "Home") {
      setActiveId(orderedIds[0]);
    } else if (e.key === "End") {
      setActiveId(orderedIds[orderedIds.length - 1]);
    } else if (e.key === "Enter" || e.key === " ") {
      setExpandedId(expandedId === activeId ? null : activeId);
    } else if (e.key === "Escape") {
      setExpandedId(null);
    }
  }
  // -------------------------------------------------------

  return (
    <div className="wrap">
      <h1>April Reorder Call Tracker</h1>
      <div className="small">
        Double‑click a name to open. Keyboard: ↑ ↓ Home End, Enter/Space opens,
        Esc closes.
      </div>

      <div
        className="board"
        tabIndex={0}
        onKeyDown={onBoardKeyDown}
        style={{ outline: "none" }}
      >
        {columns.map((col) => (
          <div className="col" key={col}>
            <h3>{col}</h3>

            {rows
              .filter((r) => r.status === col)
              .map((lead) => {
                const open = expandedId === lead.id;
                const isActive = activeId === lead.id;

                return (
                  <div
                    key={lead.id}
                    className={`card ${open ? "expanded" : ""}`}
                    style={{
                      borderLeft: `6px solid ${priorityColor(lead.priority)}`,
                    }}
                  >
                    {/* HEADER ONLY */}
                    <div className="card-header">
                      <div
                        className="card-name"
                        tabIndex={isActive ? 0 : -1}
                        ref={(el) => {
                          if (el) rowRefs.current.set(lead.id, el);
                          else rowRefs.current.delete(lead.id);
                        }}
                        onFocus={() => setActiveId(lead.id)}
                        onDoubleClick={() => setExpandedId(open ? null : lead.id)}
                        role="button"
                        aria-expanded={open}
                        title="Double‑click to open (or Enter/Space)"
                        style={{ cursor: "pointer" }}
                      >
                        {lead.name}
                      </div>

                      <span className="chip" title="Priority">
                        <span
                          className="dot"
                          style={{ background: priorityColor(lead.priority) }}
                        />
                        {lead.priority}
                      </span>
                    </div>

                    <div className="card-meta">
                      {lead.phone} • ${lead.value.toFixed(2)}
                    </div>

                    {/* DETAILS */}
                    <div className="card-details">
                      <label>Agent</label>
                      <select
                        value={lead.agent}
                        onChange={(e) =>
 
