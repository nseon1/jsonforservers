"use client"

import { useState, useRef, useEffect, useMemo } from "react"

const SERVERS_URL = "https://raw.githubusercontent.com/nseon1/jsonforservers/main/servers.json"
const TSNE_URL = "https://raw.githubusercontent.com/nseon1/jsonforservers/main/servers_tsne.json"

interface Server {
  name: string
  score?: number
  "short desc"?: string
  tags?: string[]
  notes?: string
  link?: string
  tsne_x?: number
  tsne_y?: number
}

const hashStr = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  return Math.abs(hash)
}
const pseudoRand = (str: string) => (hashStr(str) % 1000) / 1000

const ACTIVITY_ORDER = ["very active", "active", "semi active", "mostly inactive", "dead", "dead.", "dead "]
const activityRank = (t: string) => {
  const i = ACTIVITY_ORDER.findIndex((a) => t.toLowerCase().includes(a.replace(".", "")))
  return i === -1 ? 99 : i
}
const getActivity = (s: Server) => {
  if (!s.tags?.length) return "unknown"
  return s.tags.reduce((b, t) => (activityRank(t) < activityRank(b) ? t : b), s.tags[0])
}
const ACTIVITY_COLOR: Record<string, string> = {
  "very active": "#22c55e",
  active: "#4ade80",
  "semi active": "#fbbf24",
  "mostly inactive": "#fb923c",
  dead: "#f87171",
  "dead.": "#f87171",
  unknown: "#94a3b8",
}
const dotColor = (s: Server) => {
  const a = getActivity(s).toLowerCase()
  for (const [k, v] of Object.entries(ACTIVITY_COLOR)) if (a.includes(k.replace(".", ""))) return v
  return "#94a3b8"
}

function Tooltip({
  server,
  x,
  y,
  containerW,
  containerH,
}: {
  server: Server | null
  x: number
  y: number
  containerW: number
  containerH: number
}) {
  if (!server) return null
  const W = 280,
    H = 180
  let tx = x + 14,
    ty = y - 10
  if (tx + W > containerW) tx = x - W - 14
  if (ty + H > containerH) ty = y - H
  ty = Math.max(4, ty)
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: tx,
        top: ty,
        width: W,
        background: "white",
        border: "1px solid #d4d4d8",
        borderRadius: 10,
        padding: "12px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        color: "#18181b",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <div className="font-bold mb-1 text-zinc-900 text-[15px]">{server.name}</div>
      <div style={{ color: "#71717a", fontSize: 12, marginBottom: 6 }}>
        Score: {server.score || 0}
      </div>
      {server["short desc"] && (
        <div style={{ color: "#3f3f46", marginBottom: 6, fontSize: 12 }}>
          {server["short desc"]}
        </div>
      )}
      {server.notes && (
        <div style={{ color: "#71717a", fontSize: 11 }}>
          {server.notes.slice(0, 140)}
          {server.notes.length > 140 ? "..." : ""}
        </div>
      )}
    </div>
  )
}

type TagFilterState = null | true | false

function applyTagFilters(data: Server[], tagFilters: Record<string, TagFilterState>): Server[] {
  return data.filter((s) => {
    for (const [tag, state] of Object.entries(tagFilters)) {
      if (state === null) continue
      const has = (s.tags || []).some((st) => st.toLowerCase() === tag.toLowerCase())
      if (state === true && !has) return false
      if (state === false && has) return false
    }
    return true
  })
}

function TagFilterBar({
  allTags,
  tagFilters,
  setTagFilters,
}: {
  allTags: string[]
  tagFilters: Record<string, TagFilterState>
  setTagFilters: React.Dispatch<React.SetStateAction<Record<string, TagFilterState>>>
}) {
  const toggleTag = (t: string) => {
    setTagFilters((prev) => {
      const current = prev[t] ?? null
      let next: TagFilterState
      if (current === null) next = true
      else if (current === true) next = false
      else next = null
      return { ...prev, [t]: next }
    })
  }

  const tagPill = (label: string) => {
    const state = tagFilters[label] ?? null
    let bg = "white"
    let color = "#52525b"
    let border = "#d4d4d8"
    let icon = ""
    if (state === true) {
      bg = "#22c55e"
      color = "#fff"
      border = "#22c55e"
      icon = "+"
    } else if (state === false) {
      bg = "#ef4444"
      color = "#fff"
      border = "#ef4444"
      icon = "-"
    }
    return (
      <span
        key={label}
        onClick={() => toggleTag(label)}
        className="cursor-pointer select-none"
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          fontSize: 12,
          background: bg,
          color,
          border: `1px solid ${border}`,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {icon && <span style={{ fontWeight: 700 }}>{icon}</span>}
        {label}
      </span>
    )
  }

  return (
    <div className="mb-5">
      <div className="text-xs text-zinc-500 mb-2">
        Click once = must have (green +) | Click twice = must NOT have (red -) | Click again = reset
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{allTags.map((t) => tagPill(t))}</div>
    </div>
  )
}

function TsneView({ data }: { data: Server[] }) {
  const W = 820,
    H = 580,
    PAD = 50
  const [hovered, setHovered] = useState<Server | null>(null)
  const [selected, setSelected] = useState<Server | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const validData = data.filter((s) => s.tsne_x !== undefined && s.tsne_y !== undefined)
  if (validData.length === 0)
    return <div style={{ color: "#71717a", padding: 20 }}>No T-SNE data available for these servers.</div>

  const xs = validData.map((s) => s.tsne_x!),
    ys = validData.map((s) => s.tsne_y!)
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys)
  
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const px = (x: number) => PAD + ((x - minX) / rangeX) * (W - 2 * PAD)
  const py = (y: number) => PAD + ((y - minY) / rangeY) * (H - 2 * PAD)
  
  const handleMove = (e: React.MouseEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  return (
    <div>
      <div className="relative inline-block">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          style={{ background: "white", borderRadius: 12, border: "1px solid #e4e4e7", cursor: "crosshair" }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <g key={frac}>
              <line
                x1={PAD + frac * (W - 2 * PAD)}
                y1={PAD}
                x2={PAD + frac * (W - 2 * PAD)}
                y2={H - PAD}
                stroke="#e4e4e7"
                strokeWidth={1}
              />
              <line
                x1={PAD}
                y1={PAD + frac * (H - 2 * PAD)}
                x2={W - PAD}
                y2={PAD + frac * (H - 2 * PAD)}
                stroke="#e4e4e7"
                strokeWidth={1}
              />
            </g>
          ))}
          {/* Border */}
          <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} fill="none" stroke="#d4d4d8" strokeWidth={1} />
          {/* Points */}
          {validData.map((s, i) => {
            const cx = px(s.tsne_x!),
              cy = py(s.tsne_y!),
              r = 5 + ((s.score || 0) / 10) * 6
            const col = dotColor(s),
              isHov = hovered?.name === s.name,
              isSel = selected?.name === s.name
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={isSel || isHov ? r + 3 : r}
                fill={col}
                fillOpacity={0.9}
                stroke={isSel || isHov ? "#18181b" : "#ffffff66"}
                strokeWidth={isSel || isHov ? 2 : 1}
                style={{ cursor: "pointer", transition: "r 0.1s" }}
                onMouseEnter={() => setHovered(s)}
                onClick={() => setSelected(s === selected ? null : s)}
              />
            )
          })}
        </svg>
        <Tooltip server={hovered || selected} x={mouse.x} y={mouse.y} containerW={W} containerH={H} />
      </div>
      {selected && (
        <div
          style={{
            marginTop: 12,
            background: "white",
            borderRadius: 10,
            padding: "14px 18px",
            color: "#18181b",
            fontSize: 14,
            border: "1px solid #e4e4e7",
          }}
        >
          <b>{selected.name}</b> Â· Score: {selected.score || 0}
          {selected.link && selected.link !== "#" && (
            <a
              href={selected.link}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: 12, color: "#2563eb", fontSize: 13 }}
            >
              Open link
            </a>
          )}
          {selected.notes && <div style={{ color: "#71717a", marginTop: 6 }}>{selected.notes}</div>}
        </div>
      )}
      <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: "#52525b" }}>
        {Object.entries(ACTIVITY_COLOR)
          .filter(([k]) => !k.endsWith("."))
          .map(([k, v]) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: v, display: "inline-block", border: "1px solid #ffffff66" }} />
              {k}
            </span>
          ))}
        <span style={{ marginLeft: "auto", color: "#71717a" }}>Dot size = score | Click to pin</span>
      </div>
    </div>
  )
}

function QuadrantView({ data }: { data: Server[] }) {
  const allTags = useMemo(() => [...new Set(data.flatMap((s) => s.tags || []))].sort(), [data])
  const [axisX, setAxisX] = useState("")
  const [axisY, setAxisY] = useState("")
  const [hovered, setHovered] = useState<Server | null>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (allTags.length) {
      setAxisX(allTags[0])
      setAxisY(allTags[1] || allTags[0])
    }
  }, [allTags])

  const W = 720,
    H = 520,
    MID = { x: 360, y: 260 },
    PAD = 70
  const hasTag = (s: Server, tag: string) => (s.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase())

  const projected = useMemo(
    () =>
      data.map((s) => {
        const rX = pseudoRand(s.name + "x")
        const rY = pseudoRand(s.name + "y")
        const hasX = hasTag(s, axisX)
        const hasY = hasTag(s, axisY)
        return {
          ...s,
          hasX,
          hasY,
          px: hasX ? MID.x + PAD + rX * (W - MID.x - PAD * 2) : PAD + rX * (MID.x - PAD * 2),
          py: hasY ? PAD + rY * (MID.y - PAD * 2) : MID.y + PAD + rY * (H - MID.y - PAD * 2),
        }
      }),
    [data, axisX, axisY]
  )

  const quadrantCounts = useMemo(() => {
    let q1 = 0, q2 = 0, q3 = 0, q4 = 0
    projected.forEach((s) => {
      if (s.hasX && s.hasY) q1++
      else if (!s.hasX && s.hasY) q2++
      else if (!s.hasX && !s.hasY) q3++
      else q4++
    })
    return { q1, q2, q3, q4 }
  }, [projected])

  const handleMove = (e: React.MouseEvent) => {
    const r = svgRef.current!.getBoundingClientRect()
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top })
  }

  const shortTag = (tag: string) => tag.length > 12 ? tag.slice(0, 10) + "..." : tag

  return (
    <div>
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#3f3f46" }}>
          X axis tag
          <select
            value={axisX}
            onChange={(e) => setAxisX(e.target.value)}
            className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 text-sm"
          >
            {allTags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#3f3f46" }}>
          Y axis tag
          <select
            value={axisY}
            onChange={(e) => setAxisY(e.target.value)}
            className="bg-white border border-zinc-300 rounded-lg px-3 py-2 text-zinc-900 text-sm"
          >
            {allTags.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="relative inline-block">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          style={{ background: "white", borderRadius: 12, border: "1px solid #e4e4e7", cursor: "crosshair" }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Quadrant backgrounds */}
          <rect x={MID.x} y={0} width={W - MID.x} height={MID.y} fill="#22c55e0a" />
          <rect x={0} y={0} width={MID.x} height={MID.y} fill="#3b82f60a" />
          <rect x={0} y={MID.y} width={MID.x} height={H - MID.y} fill="#71717a0a" />
          <rect x={MID.x} y={MID.y} width={W - MID.x} height={H - MID.y} fill="#f59e0b0a" />
          
          {/* Axis lines */}
          <line x1={MID.x} y1={0} x2={MID.x} y2={H} stroke="#d4d4d8" strokeWidth={2} />
          <line x1={0} y1={MID.y} x2={W} y2={MID.y} stroke="#d4d4d8" strokeWidth={2} />
          
          {/* Q1: Has X, Has Y (top-right) */}
          <text x={MID.x + 12} y={24} fill="#22c55e" fontSize={11} fontWeight="600">Has {shortTag(axisX)}</text>
          <text x={MID.x + 12} y={40} fill="#22c55e" fontSize={11} fontWeight="600">Has {shortTag(axisY)}</text>
          <text x={MID.x + 12} y={56} fill="#71717a" fontSize={10}>({quadrantCounts.q1})</text>

          {/* Q2: No X, Has Y (top-left) */}
          <text x={12} y={24} fill="#3b82f6" fontSize={11} fontWeight="600">No {shortTag(axisX)}</text>
          <text x={12} y={40} fill="#3b82f6" fontSize={11} fontWeight="600">Has {shortTag(axisY)}</text>
          <text x={12} y={56} fill="#71717a" fontSize={10}>({quadrantCounts.q2})</text>

          {/* Q3: No X, No Y (bottom-left) */}
          <text x={12} y={MID.y + 24} fill="#71717a" fontSize={11} fontWeight="600">No {shortTag(axisX)}</text>
          <text x={12} y={MID.y + 40} fill="#71717a" fontSize={11} fontWeight="600">No {shortTag(axisY)}</text>
          <text x={12} y={MID.y + 56} fill="#a1a1aa" fontSize={10}>({quadrantCounts.q3})</text>

          {/* Q4: Has X, No Y (bottom-right) */}
          <text x={MID.x + 12} y={MID.y + 24} fill="#f59e0b" fontSize={11} fontWeight="600">Has {shortTag(axisX)}</text>
          <text x={MID.x + 12} y={MID.y + 40} fill="#f59e0b" fontSize={11} fontWeight="600">No {shortTag(axisY)}</text>
          <text x={MID.x + 12} y={MID.y + 56} fill="#71717a" fontSize={10}>({quadrantCounts.q4})</text>
          
          {/* Points */}
          {projected.map((s, i) => {
            const r = 4 + ((s.score || 0) / 10) * 5,
              col = dotColor(s),
              isHov = hovered?.name === s.name
            return (
              <circle
                key={i}
                cx={s.px}
                cy={s.py}
                r={isHov ? r + 3 : r}
                fill={col}
                fillOpacity={0.85}
                stroke={isHov ? "#18181b" : "#ffffff66"}
                strokeWidth={isHov ? 2 : 1}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          })}
        </svg>
        <Tooltip server={hovered} x={mouse.x} y={mouse.y} containerW={W} containerH={H} />
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: "#71717a" }}>{data.length} servers | Dot size = score</div>
    </div>
  )
}

function ListView({
  data,
  tagFilters,
  setTagFilters,
}: {
  data: Server[]
  tagFilters: Record<string, TagFilterState>
  setTagFilters: React.Dispatch<React.SetStateAction<Record<string, TagFilterState>>>
}) {
  const [query, setQuery] = useState("")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 10])
  const [compact, setCompact] = useState(false)
  const [sortBy, setSortBy] = useState("score")
  const [compactColumns, setCompactColumns] = useState<string[]>(["score", "tags"])

  const toggleCompactCol = (col: string) =>
    setCompactColumns((p) => (p.includes(col) ? p.filter((x) => x !== col) : [...p, col]))

  const filtered = useMemo(
    () =>
      applyTagFilters(data, tagFilters)
        .filter((s) => {
          const score = s.score || 0
          if (score < scoreRange[0] || score > scoreRange[1]) return false
          if (
            query &&
            !s.name.toLowerCase().includes(query.toLowerCase()) &&
            !(s["short desc"] || "").toLowerCase().includes(query.toLowerCase())
          )
            return false
          return true
        })
        .sort((a, b) => (sortBy === "score" ? (b.score || 0) - (a.score || 0) : a.name.localeCompare(b.name))),
    [data, query, tagFilters, scoreRange, sortBy]
  )

  const compactOptions = [
    { id: "desc", label: "Short desc" },
    { id: "notes", label: "Notes" },
    { id: "activity", label: "Activity" },
    { id: "score", label: "Score" },
    { id: "tags", label: "Tags" },
  ]

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="bg-white border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 text-sm outline-none flex-1 min-w-[200px] placeholder:text-zinc-400 focus:border-zinc-400"
          placeholder="Search name or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-zinc-300 rounded-lg px-4 py-2.5 text-zinc-900 text-sm"
        >
          <option value="score">Sort: Score</option>
          <option value="name">Sort: Name</option>
        </select>
        <label className="flex items-center gap-2 text-zinc-700 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={compact}
            onChange={(e) => setCompact(e.target.checked)}
            className="w-4 h-4 accent-zinc-700"
          />
          Compact
        </label>
      </div>

      {/* Score range slider */}
      <div style={{ marginBottom: 14 }}>
        <div className="text-sm text-zinc-600 mb-2">
          Score range: <span className="text-zinc-900 font-medium">{scoreRange[0]}</span> -{" "}
          <span className="text-zinc-900 font-medium">{scoreRange[1]}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">0</span>
          <div className="flex-1 relative h-6 flex items-center">
            <div className="absolute left-0 right-0 h-1.5 bg-zinc-300 rounded-full" />
            <div
              className="absolute h-1.5 bg-zinc-700 rounded-full"
              style={{
                left: `${(scoreRange[0] / 10) * 100}%`,
                right: `${100 - (scoreRange[1] / 10) * 100}%`,
              }}
            />
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={scoreRange[0]}
              onChange={(e) => setScoreRange([Math.min(+e.target.value, scoreRange[1]), scoreRange[1]])}
              className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
              style={{ zIndex: scoreRange[0] > scoreRange[1] - 1 ? 5 : 3 }}
            />
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={scoreRange[1]}
              onChange={(e) => setScoreRange([scoreRange[0], Math.max(+e.target.value, scoreRange[0])])}
              className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
              style={{ zIndex: 4 }}
            />
          </div>
          <span className="text-xs text-zinc-500">10</span>
        </div>
      </div>

      <div style={{ color: "#71717a", fontSize: 13, marginBottom: 12 }}>{filtered.length} servers</div>

      {compact && (
        <div className="mb-4 flex gap-2 flex-wrap items-center">
          <span className="text-sm text-zinc-500">Show columns:</span>
          {compactOptions.map((opt) => (
            <label key={opt.id} className="flex items-center gap-1.5 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={compactColumns.includes(opt.id)}
                onChange={() => toggleCompactCol(opt.id)}
                className="w-3.5 h-3.5 accent-zinc-700"
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {compact ? (
        <div className="overflow-x-auto">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa", color: "#3f3f46" }}>
                <th style={{ padding: "10px 12px", textAlign:"left", borderBottom: "1px solid #e4e4e7" }}>Name</th>
                {compactColumns.includes("score") && (
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e4e4e7" }}>Score</th>
                )}
                {compactColumns.includes("activity") && (
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e4e4e7" }}>
                    Activity
                  </th>
                )}
                {compactColumns.includes("desc") && (
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e4e4e7" }}>
                    Description
                  </th>
                )}
                {compactColumns.includes("notes") && (
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e4e4e7" }}>Notes</th>
                )}
                {compactColumns.includes("tags") && (
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e4e4e7" }}>Tags</th>
                )}
                <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e4e4e7" }}>Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid #e4e4e7", color: "#18181b" }}
                  className="hover:bg-zinc-50"
                >
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{s.name}</td>
                  {compactColumns.includes("score") && (
                    <td style={{ padding: "10px 12px", color: "#ca8a04", fontWeight: 600 }}>{s.score || 0}</td>
                  )}
                  {compactColumns.includes("activity") && (
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          background: dotColor(s) + "22",
                          color: dotColor(s),
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        {getActivity(s)}
                      </span>
                    </td>
                  )}
                  {compactColumns.includes("desc") && (
                    <td style={{ padding: "10px 12px", color: "#52525b", maxWidth: 200 }}>
                      {s["short desc"]?.slice(0, 60) || "-"}
                      {(s["short desc"]?.length || 0) > 60 ? "..." : ""}
                    </td>
                  )}
                  {compactColumns.includes("notes") && (
                    <td style={{ padding: "10px 12px", color: "#71717a", maxWidth: 200 }}>
                      {s.notes?.slice(0, 60) || "-"}
                      {(s.notes?.length || 0) > 60 ? "..." : ""}
                    </td>
                  )}
                  {compactColumns.includes("tags") && (
                    <td style={{ padding: "10px 12px" }}>
                      <div className="flex flex-wrap gap-1">
                        {(s.tags || []).map((tag, ti) => (
                          <span
                            key={ti}
                            style={{
                              background: "#f4f4f5",
                              color: "#52525b",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                  <td style={{ padding: "10px 12px" }}>
                    {s.link && s.link !== "#" ? (
                      <a href={s.link} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
                        Open
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 12,
                padding: "16px 18px",
                border: "1px solid #e4e4e7",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
              className="hover:border-zinc-400 transition-colors"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#18181b", lineHeight: 1.3 }}>
                  {s.link && s.link !== "#" ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#2563eb", textDecoration: "none" }}
                      className="hover:underline"
                    >
                      {s.name}
                    </a>
                  ) : (
                    s.name
                  )}
                </div>
                <span style={{ fontWeight: 700, color: "#ca8a04", fontSize: 14, whiteSpace: "nowrap", marginLeft: 10 }}>
                  {s.score || 0}
                </span>
              </div>
              {s["short desc"] && (
                <div style={{ color: "#3f3f46", fontSize: 13, lineHeight: 1.5 }}>{s["short desc"]}</div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span
                  style={{
                    background: dotColor(s) + "22",
                    color: dotColor(s),
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                >
                  {getActivity(s)}
                </span>
              </div>
              {s.notes && (
                <div style={{ color: "#71717a", fontSize: 12, lineHeight: 1.5 }}>{s.notes}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [data, setData] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState("list")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 10])
  const [tagFilters, setTagFilters] = useState<Record<string, TagFilterState>>({})

  const allTags = useMemo(() => [...new Set(data.flatMap((s) => s.tags || []))].sort(), [data])

  useEffect(() => {
    Promise.all([
      fetch(SERVERS_URL).then((r) => {
        if (!r.ok) throw new Error("Failed to load servers.json")
        return r.json()
      }),
      fetch(TSNE_URL).then((r) => {
        if (!r.ok) throw new Error("Failed to load servers_tsne.json")
        return r.json()
      }),
    ])
      .then(([serversData, tsneData]) => {
        const mergedData = serversData.map((server: Server) => {
          const mapping = tsneData.find(
            (t: { name?: string; tsne_x?: number; tsne_y?: number }) =>
              (t.name || "").toLowerCase() === (server.name || "").toLowerCase()
          )
          return {
            ...server,
            tsne_x: mapping?.tsne_x,
            tsne_y: mapping?.tsne_y,
          }
        })
        setData(mergedData)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  const visibleData = useMemo(
    () =>
      applyTagFilters(
        data.filter((s) => (s.score || 0) >= scoreRange[0] && (s.score || 0) <= scoreRange[1]),
        tagFilters
      ),
    [data, scoreRange, tagFilters]
  )

  if (loading)
    return (
      <div className="text-zinc-600 p-10 font-sans bg-zinc-100 min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading servers...</div>
      </div>
    )
  if (error)
    return (
      <div className="text-red-600 p-10 font-sans bg-zinc-100 min-h-screen">
        <div className="text-lg">Failed to load: {error}</div>
      </div>
    )

  const tab = (id: string, label: string) => (
    <button
      onClick={() => setView(id)}
      className={`px-5 py-2.5 rounded-lg border cursor-pointer font-semibold text-sm transition-all ${
        view === id
          ? "bg-zinc-900 text-white border-zinc-900"
          : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="bg-zinc-100 min-h-screen p-6 font-sans text-zinc-900">
      <div className="max-w-[950px] mx-auto">
        <h1 className="text-3xl font-bold mb-1 text-zinc-900">AI Discord Directory</h1>
        <p className="text-zinc-500 text-sm mb-6">{data.length} servers</p>
        <div className="flex gap-3 mb-6">
          {tab("list", "List")}
          {tab("tsne", "T-SNE")}
          {tab("quad", "Quadrant")}
        </div>

        {/* Global tag filters - applies to all views */}
        <TagFilterBar allTags={allTags} tagFilters={tagFilters} setTagFilters={setTagFilters} />

        {(view === "tsne" || view === "quad") && (
          <div className="mb-5">
            <div className="text-sm text-zinc-600 mb-2">
              Score range: <span className="text-zinc-900 font-medium">{scoreRange[0]}</span> -{" "}
              <span className="text-zinc-900 font-medium">{scoreRange[1]}</span>
              <span className="ml-3 text-zinc-500">({visibleData.length} shown)</span>
            </div>
            <div className="flex items-center gap-3 max-w-md">
              <span className="text-xs text-zinc-500">0</span>
              <div className="flex-1 relative h-6 flex items-center">
                <div className="absolute left-0 right-0 h-1.5 bg-zinc-300 rounded-full" />
                <div
                  className="absolute h-1.5 bg-zinc-700 rounded-full"
                  style={{
                    left: `${(scoreRange[0] / 10) * 100}%`,
                    right: `${100 - (scoreRange[1] / 10) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={scoreRange[0]}
                  onChange={(e) => setScoreRange([Math.min(+e.target.value, scoreRange[1]), scoreRange[1]])}
                  className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                  style={{ zIndex: scoreRange[0] > scoreRange[1] - 1 ? 5 : 3 }}
                />
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={scoreRange[1]}
                  onChange={(e) => setScoreRange([scoreRange[0], Math.max(+e.target.value, scoreRange[0])])}
                  className="absolute w-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                  style={{ zIndex: 4 }}
                />
              </div>
              <span className="text-xs text-zinc-500">10</span>
            </div>
          </div>
        )}
        {view === "tsne" && <TsneView data={visibleData} />}
        {view === "quad" && <QuadrantView data={visibleData} />}
        {view === "list" && <ListView data={data} tagFilters={tagFilters} setTagFilters={setTagFilters} />}
      </div>
    </div>
  )
}
