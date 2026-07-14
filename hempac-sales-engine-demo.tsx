import React, { useState } from "react";
import {
  LayoutDashboard, Radar, Columns3, GraduationCap, Tag, Search, Bell,
  MessageCircle, TrendingUp, Target, Users, ArrowRight, ArrowUpRight,
  Phone, Building2, CheckCircle2, Filter, Sparkles, X, Zap, Star,
  ChevronRight, DollarSign, Calendar, MapPin
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip, CartesianGrid,
  AreaChart, Area
} from "recharts";

/* ---------------- palette (LayerSync, green-led) ---------------- */
const C = {
  ink: "#1E3D2C", green: "#2E5A40", greenSoft: "#EAF0EB", greenLine: "#D5E1D8",
  terra: "#C25E30", terraSoft: "#F6E7DD", gold: "#A78950",
  cream: "#F7F5EF", paper: "#FFFFFF", text: "#20302A", muted: "#6C7B72",
  faint: "#98A69D", line: "#E7E2D6", success: "#4E9A5A", warn: "#C9992E",
};
const money = (n) => "$" + n.toLocaleString();

/* ---------------- sample data ---------------- */
const SCHOOLS = [
  { id:1, name:"Greendale Group of Schools", type:"Group", region:"Greendale, Harare", enrol:2100, fit:96,
    signal:"Multi-campus; central procurement; board budget confirmed for classroom tech.", eng:"In pipeline",
    product:"Smart Boards", head:"Mrs. R. Moyo", headRole:"Group Head", bursar:"Mr. T. Nyathi", bursarRole:"Group Bursar",
    units:14, value:32000, stage:"Quote Sent", owner:"EC",
    wa:[["in","Afternoon — we received your note about the interactive boards for our campuses."],
        ["out","Wonderful. We run the same boards at The Lookeron School — happy to bring one to demo for the board."],
        ["in","Please send the quote for 14 units, we table it at the finance committee Thursday."]],
    next:"Follow up on Thursday finance-committee decision. Attach the sports-equipment catalogue — this group refreshes kit annually." },
  { id:2, name:"Northgate Academy", type:"Private", region:"Borrowdale, Harare", enrol:760, fit:91,
    signal:"Premium catchment; early tech adopter; parents fund upgrades.", eng:"In pipeline",
    product:"Both", head:"Dr. S. Chikowore", headRole:"Head", bursar:"Ms. L. Dube", bursarRole:"Bursar",
    units:10, value:22500, stage:"Procurement", owner:"EC",
    wa:[["in","The demo went well. We're moving to procurement — what's the lead time on 10 boards?"],
        ["out","Three weeks from PO. We can install and train your staff, same as we did at Lookeron."],
        ["in","Good. Sending the PO once the head signs off."]],
    next:"Chase signed PO from the Head. Confirm install + teacher-training dates." },
  { id:3, name:"Highfield Trust College", type:"Trust", region:"Mount Pleasant, Harare", enrol:1240, fit:94,
    signal:"Recently upgraded ICT labs; active interest in classroom tech.", eng:"In pipeline",
    product:"Both", head:"Mrs. P. Sibanda", headRole:"Head", bursar:"Mr. K. Marufu", bursarRole:"Bursar",
    units:8, value:18400, stage:"Demo Booked", owner:"TC",
    wa:[["in","Good afternoon, this is Highfield. We saw your message about the interactive boards."],
        ["out","We've installed the same boards at The Lookeron School — could we bring one to demo next week?"],
        ["in","Yes please. Tuesday works for our ICT committee."]],
    next:"Confirm Tuesday demo with the ICT committee. Bundle the sports-equipment catalogue into the follow-up." },
  { id:4, name:"Mount Pleasant Prep", type:"Private", region:"Mount Pleasant, Harare", enrol:520, fit:83,
    signal:"Affluent catchment; parents fund upgrades via the PTA.", eng:"In pipeline",
    product:"Both", head:"Mr. A. Gwenzi", headRole:"Head", bursar:"Mrs. F. Ncube", bursarRole:"Bursar",
    units:4, value:9800, stage:"Demo Booked", owner:"TC",
    wa:[["in","Could you demo the boards at our next PTA meeting?"],
        ["out","Happy to. We'll set one up in a classroom, same as our Lookeron install."]],
    next:"Prepare PTA demo. Lead with the Lookeron reference — parents trust a working example." },
  { id:5, name:"Eastvale Senior School", type:"Trust", region:"Marlborough, Harare", enrol:950, fit:86,
    signal:"Strong sports programme; equipment refresh due this term.", eng:"In pipeline",
    product:"Sports Equipment", head:"Mr. B. Chuma", headRole:"Head", bursar:"Ms. R. Phiri", bursarRole:"Bursar",
    units:1, value:6400, stage:"Demo Booked", owner:"EC",
    wa:[["in","We need to refresh our gym and field equipment before the sports season."],
        ["out","We can supply the full list — and show you the smart boards while we're on site."]],
    next:"Quote the equipment refresh. Introduce smart boards on the same visit — one buyer, two products." },
  { id:6, name:"Marlborough Junior Academy", type:"Private", region:"Marlborough, Harare", enrol:640, fit:88,
    signal:"Fee-paying, growing enrolment; STEM positioning.", eng:"Replied",
    product:"Both", head:"Mrs. J. Mutasa", headRole:"Head", bursar:"Mr. D. Zhou", bursarRole:"Bursar",
    units:5, value:7200, stage:"New Enquiry", owner:"TC",
    wa:[["in","Interested — what does a board cost installed?"],
        ["out","Depends on size; let me send options. We can also demo at Lookeron any afternoon."]],
    next:"Send sizing + pricing options. Offer a Lookeron site visit to convert interest to a demo." },
  { id:7, name:"Riverside Day School", type:"Private", region:"Avondale, Harare", enrol:690, fit:90,
    signal:"Established; strong alumni funding for facilities.", eng:"Replied",
    product:"Smart Boards", head:"Dr. M. Kadenge", headRole:"Head", bursar:"Ms. T. Banda", bursarRole:"Bursar",
    units:6, value:5600, stage:"New Enquiry", owner:"EC",
    wa:[["in","Please share a proposal for our two senior classrooms."],
        ["out","On its way. We'll include the Lookeron case study and install timeline."]],
    next:"Send proposal for 2 classrooms with the Lookeron case study attached." },
  { id:8, name:"Matobo Trust School", type:"Trust", region:"Bulawayo", enrol:1500, fit:79,
    signal:"Regional leader; sports programme expanding.", eng:"Contacted",
    product:"Sports Equipment", head:"Mr. S. Ndlovu", headRole:"Head", bursar:"Mrs. G. Sithole", bursarRole:"Bursar",
    units:1, value:4900, stage:"Quote Sent", owner:"TC",
    wa:[["out","Following up on the equipment list for your expanding sports programme — quote attached."]],
    next:"Follow up on the equipment quote; gauge appetite for boards on a later visit." },
  { id:9, name:"Avondale Christian College", type:"Mission", region:"Avondale, Harare", enrol:870, fit:74,
    signal:"Church-backed; cautious budget; grant cycle opens Q3.", eng:"Contacted", product:"Smart Boards",
    head:"Rev. P. Chirwa", headRole:"Head", bursar:"Mr. E. Moyo", bursarRole:"Bursar", units:0, value:0, stage:"", owner:"",
    wa:[["out","Sharing a proposal you could put to your Q3 grant committee."]],
    next:"Time the follow-up to the Q3 grant cycle." },
  { id:10, name:"Hillcrest Academy", type:"Private", region:"Bulawayo", enrol:610, fit:82,
    signal:"Growing; new science block under construction.", eng:"Scored", product:"Smart Boards",
    head:"Mrs. N. Khumalo", headRole:"Head", bursar:"Mr. J. Ncube", bursarRole:"Bursar", units:0, value:0, stage:"", owner:"",
    wa:[], next:"Queue WhatsApp outreach — time it to the new science-block opening." },
  { id:11, name:"St. Aidan's Mission High", type:"Mission", region:"Mutare", enrol:980, fit:71,
    signal:"Donor-funded; grant cycle opens Q3.", eng:"Scored", product:"Smart Boards",
    head:"Sr. M. Chidziva", headRole:"Head", bursar:"Mr. L. Tapfuma", bursarRole:"Bursar", units:0, value:0, stage:"", owner:"",
    wa:[], next:"Queue outreach aligned to the donor grant cycle." },
  { id:12, name:"Gweru Central High", type:"Government", region:"Gweru", enrol:1800, fit:58,
    signal:"Public; procurement runs through the ministry — slow but high volume.", eng:"Discovered", product:"Smart Boards",
    head:"Mr. C. Mpofu", headRole:"Head", bursar:"—", bursarRole:"", units:0, value:0, stage:"", owner:"",
    wa:[], next:"Lower priority — long procurement. Revisit if a ministry framework opens." },
];

const STAGES = ["New Enquiry", "Demo Booked", "Quote Sent", "Procurement", "Won"];
const WON = [
  { name:"Kingsmead Prep", product:"Smart Boards", units:5, value:12300, owner:"EC" },
  { name:"Sunridge College", product:"Both", units:7, value:15600, owner:"TC" },
];

const productColor = (p) =>
  p === "Smart Boards" ? { bg: C.greenSoft, fg: C.green }
  : p === "Sports Equipment" ? { bg: C.terraSoft, fg: C.terra }
  : { bg: "#F0ECDB", fg: C.gold };

const engStageColor = (s) => ({
  "Discovered": C.faint, "Scored": C.gold, "Contacted": C.warn,
  "Replied": C.terra, "In pipeline": C.green,
}[s] || C.muted);

/* ---------------- tiny ui helpers ---------------- */
const Pill = ({ children, bg, fg }) => (
  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ background: bg, color: fg }}>{children}</span>
);
const Avatar = ({ initials, color }) => (
  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
        style={{ background: color || C.green }}>{initials}</span>
);
const FitBar = ({ v }) => (
  <div className="flex items-center gap-2">
    <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: C.line }}>
      <div className="h-full rounded-full"
           style={{ width: `${v}%`, background: v >= 85 ? C.green : v >= 70 ? C.gold : C.faint }} />
    </div>
    <span className="text-xs font-semibold tabular-nums" style={{ color: C.text }}>{v}</span>
  </div>
);

/* ---------------- sidebar ---------------- */
function Sidebar({ view, setView }) {
  const items = [
    { k: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { k: "engine", label: "Lead Engine", icon: Radar },
    { k: "pipeline", label: "Pipeline", icon: Columns3 },
    { k: "schools", label: "Schools", icon: GraduationCap },
  ];
  return (
    <aside className="flex w-60 shrink-0 flex-col justify-between" style={{ background: C.ink }}>
      <div>
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold"
               style={{ background: "linear-gradient(135deg,#C25E30,#5FA15A)", color: "#fff" }}>ls</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">Hempac Sport</div>
            <div className="text-[10px] tracking-wide" style={{ color: "#9DB4A4" }}>SynCRM · by LayerSync</div>
          </div>
        </div>
        <nav className="mt-2 px-3">
          {items.map(({ k, label, icon: Icon }) => {
            const on = view === k;
            return (
              <button key={k} onClick={() => setView(k)}
                className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition"
                style={{ background: on ? C.green : "transparent", color: on ? "#fff" : "#B9CabF",
                         fontWeight: on ? 600 : 500 }}>
                <Icon size={17} /> {label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="px-3 pb-4">
        <button onClick={() => setView("offer")}
          className="mb-3 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition"
          style={{ background: view === "offer" ? C.terra : "rgba(194,94,48,0.15)",
                   color: view === "offer" ? "#fff" : "#E7B79E" }}>
          <span className="flex items-center gap-2"><Tag size={16}/> The Offer</span>
          <ChevronRight size={15} />
        </button>
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.05)" }}>
          <Avatar initials="EC" color={C.terra} />
          <div className="leading-tight">
            <div className="text-xs font-medium text-white">Emilia Chisango</div>
            <div className="text-[10px]" style={{ color: "#9DB4A4" }}>Founder & CEO</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- topbar ---------------- */
function Topbar({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between border-b px-8 py-4" style={{ borderColor: C.line, background: C.paper }}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold" style={{ color: C.text }}>{title}</h1>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: C.greenSoft, color: C.green }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.success }} /> Demo · sample data
          </span>
        </div>
        {subtitle && <p className="mt-0.5 text-sm" style={{ color: C.muted }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: C.line }}>
          <Search size={15} style={{ color: C.faint }} />
          <span className="text-sm" style={{ color: C.faint }}>Search schools, deals…</span>
        </div>
        <button className="rounded-lg border p-2" style={{ borderColor: C.line }}><Bell size={16} style={{ color: C.muted }} /></button>
      </div>
    </div>
  );
}

/* ---------------- stat card ---------------- */
const Stat = ({ icon: Icon, label, value, delta, accent }) => (
  <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.paper }}>
    <div className="flex items-center justify-between">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: accent + "18", color: accent }}><Icon size={16} /></span>
      {delta && <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: C.success }}>
        <ArrowUpRight size={12} />{delta}</span>}
    </div>
    <div className="mt-3 text-2xl font-semibold tabular-nums" style={{ color: C.text }}>{value}</div>
    <div className="text-xs" style={{ color: C.muted }}>{label}</div>
  </div>
);

/* ---------------- dashboard ---------------- */
function Dashboard({ openSchool }) {
  const stageData = [
    { stage: "New Enquiry", value: 12800 }, { stage: "Demo Booked", value: 34600 },
    { stage: "Quote Sent", value: 36900 }, { stage: "Procurement", value: 22500 },
  ];
  const trend = [
    { m: "Feb", leads: 9 }, { m: "Mar", leads: 14 }, { m: "Apr", leads: 19 },
    { m: "May", leads: 22 }, { m: "Jun", leads: 28 },
  ];
  const attention = SCHOOLS.filter(s => s.stage && s.stage !== "").slice(0, 4);
  return (
    <div className="space-y-5 p-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat icon={GraduationCap} label="Schools identified" value="342" accent={C.green} />
        <Stat icon={Radar} label="Leads this month" value="28" delta="+27%" accent={C.terra} />
        <Stat icon={Columns3} label="Active deals" value="14" accent={C.gold} />
        <Stat icon={TrendingUp} label="Pipeline value" value="$106.8k" delta="+18%" accent={C.green} />
        <Stat icon={CheckCircle2} label="Won this quarter" value="$41.2k" accent={C.success} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border p-5 lg:col-span-2" style={{ borderColor: C.line, background: C.paper }}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Pipeline by stage</h3>
            <span className="text-xs" style={{ color: C.muted }}>open deal value</span>
          </div>
          <div style={{ height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={C.line} />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.faint }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => "$" + v/1000 + "k"} />
                <Tooltip cursor={{ fill: C.greenSoft }} formatter={(v) => money(v)}
                         contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={54}>
                  {stageData.map((_, i) => <Cell key={i} fill={i === 3 ? C.terra : C.green} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: C.line, background: C.paper }}>
          <h3 className="mb-1 text-sm font-semibold" style={{ color: C.text }}>Leads generated</h3>
          <span className="text-xs" style={{ color: C.muted }}>by the engine, monthly</span>
          <div className="mt-2" style={{ height: 170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.terra} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.terra} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.faint }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 12 }} />
                <Area type="monotone" dataKey="leads" stroke={C.terra} strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border" style={{ borderColor: C.line, background: C.paper }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.line}` }}>
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>Needs your attention</h3>
          <span className="text-xs" style={{ color: C.muted }}>4 deals</span>
        </div>
        {attention.map((s, i) => (
          <button key={s.id} onClick={() => openSchool(s.id)}
            className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-black/[0.02]"
            style={{ borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: C.greenSoft }}>
                <Building2 size={15} style={{ color: C.green }} /></span>
              <div>
                <div className="text-sm font-medium" style={{ color: C.text }}>{s.name}</div>
                <div className="text-xs" style={{ color: C.muted }}>{s.next}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Pill {...productColor(s.product)}>{s.product}</Pill>
              <span className="text-sm font-semibold tabular-nums" style={{ color: C.text }}>{s.value ? money(s.value) : "—"}</span>
              <ChevronRight size={16} style={{ color: C.faint }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- lead engine (signature view) ---------------- */
function Engine({ openSchool }) {
  const funnel = [
    { k: "Discovered", v: 342, c: C.faint },
    { k: "Scored", v: 210, c: C.gold },
    { k: "Contacted", v: 96, c: C.warn },
    { k: "Replied", v: 34, c: C.terra },
    { k: "In pipeline", v: 14, c: C.green },
  ];
  const rows = SCHOOLS.filter(s => s.eng !== "In pipeline");
  return (
    <div className="space-y-5 p-8">
      {/* engine status + funnel */}
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: C.line, background: C.paper }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: C.ink }}>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(95,161,90,0.25)" }}>
              <Radar size={18} color="#8FD69A" /></span>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                Lead Engine
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "rgba(95,161,90,0.25)", color: "#9BE0A6" }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#7FE08C" }} /> Active
                </span>
              </div>
              <div className="text-[11px]" style={{ color: "#9DB4A4" }}>Finding, scoring and reaching schools on WhatsApp — automatically.</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Pill bg="rgba(255,255,255,0.1)" fg="#CFE0D4">Private · Trust · Mission</Pill>
            <Pill bg="rgba(255,255,255,0.1)" fg="#CFE0D4">Harare +3 regions</Pill>
            <Pill bg="rgba(194,94,48,0.25)" fg="#E7B79E">Smart Boards</Pill>
          </div>
        </div>
        <div className="grid grid-cols-5 divide-x" style={{ borderColor: C.line }}>
          {funnel.map((f, i) => (
            <div key={f.k} className="px-4 py-4" style={{ borderColor: C.line }}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: f.c }} />
                <span className="text-xs" style={{ color: C.muted }}>{f.k}</span>
              </div>
              <div className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: C.text }}>{f.v}</div>
              {i < funnel.length - 1 &&
                <div className="mt-1 text-[11px]" style={{ color: C.faint }}>
                  {Math.round((funnel[i+1].v / f.v) * 100)}% →</div>}
            </div>
          ))}
        </div>
      </div>

      {/* discovered / scored table */}
      <div className="rounded-xl border" style={{ borderColor: C.line, background: C.paper }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${C.line}` }}>
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>Discovered &amp; scored schools</h3>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: C.muted }}><Filter size={13} /> ranked by fit</span>
        </div>
        <div className="grid grid-cols-12 px-5 py-2 text-[11px] font-medium uppercase tracking-wide"
             style={{ color: C.faint, borderBottom: `1px solid ${C.line}` }}>
          <div className="col-span-4">School</div>
          <div className="col-span-2">Fit</div>
          <div className="col-span-4">Why this school</div>
          <div className="col-span-2">Outreach</div>
        </div>
        {rows.map((s, i) => (
          <button key={s.id} onClick={() => openSchool(s.id)}
            className="grid w-full grid-cols-12 items-center px-5 py-3 text-left transition hover:bg-black/[0.02]"
            style={{ borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <div className="col-span-4 pr-2">
              <div className="text-sm font-medium" style={{ color: C.text }}>{s.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: C.muted }}>
                <MapPin size={11} />{s.region} · {s.type}</div>
            </div>
            <div className="col-span-2"><FitBar v={s.fit} /></div>
            <div className="col-span-4 pr-3 text-xs leading-snug" style={{ color: C.muted }}>
              <Sparkles size={11} className="mr-1 inline" style={{ color: C.gold }} />{s.signal}</div>
            <div className="col-span-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium"
                    style={{ background: engStageColor(s.eng) + "18", color: engStageColor(s.eng) }}>
                <MessageCircle size={12} />{s.eng}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- pipeline (kanban) ---------------- */
function Pipeline({ openSchool }) {
  const deals = SCHOOLS.filter(s => s.stage);
  const col = (stage) => stage === "Won"
    ? WON.map((w, i) => ({ ...w, id: "w" + i, stage: "Won" }))
    : deals.filter(d => d.stage === stage);
  return (
    <div className="p-8">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {STAGES.map((stage) => {
          const items = col(stage);
          const total = items.reduce((a, b) => a + (b.value || 0), 0);
          const won = stage === "Won";
          return (
            <div key={stage} className="flex w-64 shrink-0 flex-col">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: won ? C.success : C.green }} />
                  <span className="text-sm font-semibold" style={{ color: C.text }}>{stage}</span>
                  <span className="text-xs" style={{ color: C.faint }}>{items.length}</span>
                </div>
                <span className="text-xs font-medium tabular-nums" style={{ color: C.muted }}>{money(total)}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {items.map((d) => {
                  const pc = productColor(d.product);
                  const clickable = !!d.id && typeof d.id === "number";
                  return (
                    <button key={d.id} onClick={() => clickable && openSchool(d.id)}
                      className="rounded-xl border p-3 text-left transition hover:shadow-sm"
                      style={{ borderColor: C.line, background: C.paper, cursor: clickable ? "pointer" : "default" }}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug" style={{ color: C.text }}>{d.name}</span>
                        {won && <CheckCircle2 size={15} style={{ color: C.success }} />}
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Pill bg={pc.bg} fg={pc.fg}>{d.product}</Pill>
                        {d.units > 0 && <span className="text-xs" style={{ color: C.faint }}>{d.units} boards</span>}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-sm font-semibold tabular-nums" style={{ color: C.text }}>{money(d.value)}</span>
                        <Avatar initials={d.owner} color={d.owner === "EC" ? C.terra : C.green} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- schools directory ---------------- */
function Schools({ openSchool }) {
  return (
    <div className="p-8">
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: C.line, background: C.paper }}>
        <div className="grid grid-cols-12 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide"
             style={{ color: C.faint, borderBottom: `1px solid ${C.line}` }}>
          <div className="col-span-4">School</div><div className="col-span-2">Type</div>
          <div className="col-span-2">Enrolment</div><div className="col-span-2">Interest</div><div className="col-span-2">Fit</div>
        </div>
        {SCHOOLS.map((s, i) => (
          <button key={s.id} onClick={() => openSchool(s.id)}
            className="grid w-full grid-cols-12 items-center px-5 py-3 text-left transition hover:bg-black/[0.02]"
            style={{ borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <div className="col-span-4">
              <div className="text-sm font-medium" style={{ color: C.text }}>{s.name}</div>
              <div className="text-xs" style={{ color: C.muted }}>{s.region}</div>
            </div>
            <div className="col-span-2 text-sm" style={{ color: C.muted }}>{s.type}</div>
            <div className="col-span-2 text-sm tabular-nums" style={{ color: C.muted }}>{s.enrol.toLocaleString()}</div>
            <div className="col-span-2"><Pill {...productColor(s.product)}>{s.product}</Pill></div>
            <div className="col-span-2"><FitBar v={s.fit} /></div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- school detail drawer ---------------- */
function Drawer({ school, close }) {
  if (!school) return null;
  const pc = productColor(school.product);
  return (
    <div className="fixed inset-0 z-30 flex justify-end" style={{ background: "rgba(20,30,25,0.35)" }} onClick={close}>
      <div className="h-full w-full max-w-md overflow-y-auto" style={{ background: C.cream }} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between px-6 py-5"
             style={{ background: C.ink }}>
          <div>
            <div className="text-base font-semibold text-white">{school.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: "#9DB4A4" }}>
              <MapPin size={12} />{school.region}</div>
            <div className="mt-2 flex items-center gap-2">
              <Pill bg="rgba(255,255,255,0.12)" fg="#CFE0D4">{school.type}</Pill>
              <Pill bg="rgba(255,255,255,0.12)" fg="#CFE0D4">{school.enrol.toLocaleString()} pupils</Pill>
            </div>
          </div>
          <button onClick={close} className="rounded-lg p-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
            <X size={16} color="#fff" /></button>
        </div>

        <div className="space-y-4 p-6">
          {/* fit + deal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.paper }}>
              <div className="text-xs" style={{ color: C.muted }}>Fit score</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold" style={{ color: C.green }}>{school.fit}</span>
                <span className="text-xs" style={{ color: C.faint }}>/ 100</span>
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.paper }}>
              <div className="text-xs" style={{ color: C.muted }}>Open value</div>
              <div className="mt-1 text-2xl font-semibold" style={{ color: C.text }}>{school.value ? money(school.value) : "—"}</div>
            </div>
          </div>

          {/* stakeholders */}
          <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.paper }}>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: C.faint }}>
              <Users size={13} /> Decision-makers</div>
            {[[school.head, school.headRole], [school.bursar, school.bursarRole]].filter(x => x[0] && x[0] !== "—").map(([n, r], i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={n.split(" ").slice(-1)[0][0] + (n.split(" ")[1]?.[0] || "")} color={i ? C.gold : C.green} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: C.text }}>{n}</div>
                    <div className="text-xs" style={{ color: C.muted }}>{r}</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded-lg border p-1.5" style={{ borderColor: C.line }}><MessageCircle size={13} style={{ color: C.success }} /></span>
                  <span className="rounded-lg border p-1.5" style={{ borderColor: C.line }}><Phone size={13} style={{ color: C.muted }} /></span>
                </div>
              </div>
            ))}
          </div>

          {/* whatsapp thread */}
          {school.wa.length > 0 && (
            <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: C.paper }}>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: C.faint }}>
                <MessageCircle size={13} style={{ color: C.success }} /> WhatsApp · captured</div>
              <div className="space-y-2">
                {school.wa.map(([dir, msg], i) => (
                  <div key={i} className={"flex " + (dir === "out" ? "justify-end" : "justify-start")}>
                    <div className="max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-snug"
                         style={{ background: dir === "out" ? C.green : C.greenSoft,
                                  color: dir === "out" ? "#fff" : C.text,
                                  borderBottomRightRadius: dir === "out" ? 4 : 16,
                                  borderBottomLeftRadius: dir === "out" ? 16 : 4 }}>{msg}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ai next best action */}
          <div className="rounded-xl border p-4" style={{ borderColor: C.terra + "55", background: C.terraSoft }}>
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: C.terra }}>
              <Sparkles size={13} /> Copilot · next best action</div>
            <p className="text-sm leading-snug" style={{ color: "#7A3A1E" }}>{school.next}</p>
            {(school.product === "Both" || school.product === "Smart Boards") && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg px-2.5 py-2" style={{ background: "rgba(255,255,255,0.6)" }}>
                <Star size={13} style={{ color: C.gold }} />
                <span className="text-xs" style={{ color: "#7A3A1E" }}>Cross-sell: same buyer purchases school sports equipment — bundle it.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- offer view ---------------- */
function Offer() {
  const tiers = [
    { name: "Pipeline", tag: "Get organised", build: "$2,500", monthly: "Support scoped to needs",
      accent: C.green, features: [
        "School-sales CRM (SynCRM core, reconfigured for smart boards)",
        "WhatsApp capture — no enquiry lost",
        "Pipeline, quotes & deal tracking",
        "Lookeron set up as your reference/demo site",
        "Onboarding & training",
      ], rec: false },
    { name: "Engine", tag: "The lead-generation machine", build: "$4,900", monthly: "$450 / mo · scopeable",
      accent: C.terra, features: [
        "Everything in Pipeline, plus —",
        "School database, built and scored for fit",
        "WhatsApp-first outreach, run automatically",
        "Qualified leads flow straight into your pipeline",
        "Cross-sell engine: boards + sports equipment, one buyer",
      ], rec: true },
  ];
  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold" style={{ color: C.text }}>Two ways to start</h2>
          <p className="mt-1 text-sm" style={{ color: C.muted }}>
            Built on SynCRM, reconfigured for selling smart boards to schools. Founding-vertical pricing.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {tiers.map((t) => (
            <div key={t.name} className="relative flex flex-col rounded-2xl border p-6"
                 style={{ borderColor: t.rec ? t.accent : C.line, background: C.paper,
                          boxShadow: t.rec ? `0 0 0 1px ${t.accent}` : "none" }}>
              {t.rec && (
                <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: t.accent, color: "#fff" }}><Zap size={11} /> Recommended</span>
              )}
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: t.accent }}>{t.tag}</div>
              <div className="mt-1 text-xl font-semibold" style={{ color: C.text }}>{t.name}</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold" style={{ color: C.text }}>{t.build}</span>
                <span className="text-sm" style={{ color: C.muted }}>build</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: C.muted }}>
                <Calendar size={13} />{t.monthly}</div>
              <div className="my-4 h-px" style={{ background: C.line }} />
              <ul className="flex-1 space-y-2.5">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.text }}>
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: t.accent }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs" style={{ color: C.faint }}>
          Running costs (WhatsApp Business API, AI, hosting) billed at cost. The engine pays for itself
          in roughly 3–5 smart-board deals — before the sports-equipment cross-sell.
        </p>
      </div>
    </div>
  );
}

/* ---------------- app ---------------- */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [sel, setSel] = useState(null);
  const openSchool = (id) => setSel(SCHOOLS.find(s => s.id === id) || null);

  const meta = {
    dashboard: ["Dashboard", "Your smart-board sales, at a glance"],
    engine: ["Lead Engine", "Finding and reaching schools, automatically"],
    pipeline: ["Pipeline", "Every deal, from enquiry to won"],
    schools: ["Schools", "342 identified across Zimbabwe"],
    offer: ["Your engagement", "What it costs to build this"],
  }[view];

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: C.cream, fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: C.text }}>
      <Sidebar view={view} setView={setView} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={meta[0]} subtitle={meta[1]} />
        <div className="flex-1 overflow-y-auto">
          {view === "dashboard" && <Dashboard openSchool={openSchool} />}
          {view === "engine" && <Engine openSchool={openSchool} />}
          {view === "pipeline" && <Pipeline openSchool={openSchool} />}
          {view === "schools" && <Schools openSchool={openSchool} />}
          {view === "offer" && <Offer />}
        </div>
      </main>
      <Drawer school={sel} close={() => setSel(null)} />
    </div>
  );
}
