import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  Wifi, Plus, Search, CheckCircle2, Circle, Clock, ArrowRight, RotateCcw,
  Users, Ticket, TrendingUp, Briefcase, Package, DollarSign, LayoutGrid,
  UserCheck, AlertTriangle, ChevronRight, LogOut, ShieldCheck, HardHat,
  Headset, Wallet, BadgeCheck,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from "recharts";

const INK = "#14213D";
const AMBER = "#FFB627";
const SLATE = "#5C6784";
const SUCCESS = "#2E7D5B";
const ALERT = "#C1432E";
const PAPER = "#F7F5F1";
const LINE = "#E4E0D4";
const CARD = "#fff";

/* ---------- shared bits ---------- */
function KpiCard({ icon, label, value }) {
  return (
    <div className="bth-card" style={{ border: `1px solid ${LINE}`, borderRadius: 10, background: CARD, padding: "13px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
        {icon}
        <span style={{ fontSize: 11.5, color: SLATE, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 21, fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>{value}</div>
    </div>
  );
}
function PanelTitle({ children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 600, color: SLATE, marginBottom: 9, textTransform: "uppercase", letterSpacing: 0.3 }}>{children}</div>;
}
const inputStyle = { border: `1.5px solid ${LINE}`, borderRadius: 7, padding: "9px 11px", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'Inter', system-ui, sans-serif" };
const chipStyle = { display: "flex", alignItems: "center", background: CARD, border: `1.5px solid #C9C3B4`, borderRadius: 20, padding: "7px 13px", fontSize: 13, cursor: "pointer", color: INK };
const smallBtn = { background: INK, color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" };


/* ---------- seed data ---------- */
const SERVICE_TYPES = ["Wi-Fi / Hotspot", "Enterprise Network", "CCTV & Security", "Solar Energy", "Web Application"];

const seedInstalls = [
  { id: "INS-1042", customer: "Adebayo Motors", address: "14 Ijaye Rd, Abeokuta", serial: "CPE-88213", date: "2026-09-02", status: "Complete", engineer: "Tunde B.", service: "Wi-Fi / Hotspot" },
  { id: "INS-1043", customer: "Grace Fashion House", address: "Onikolobo, Abeokuta", serial: "CPE-88214", date: "2026-09-05", status: "Testing", engineer: "Wale O.", service: "Enterprise Network" },
  { id: "INS-1044", customer: "Femi Okafor (Residential)", address: "Kotopo Estate, Abeokuta", serial: "CPE-88215", date: "2026-09-08", status: "Pending", engineer: "Tunde B.", service: "Wi-Fi / Hotspot" },
  { id: "INS-1041", customer: "St. Peters Academy", address: "Oke Ilewo, Abeokuta", serial: "CCTV-4402", date: "2026-08-29", status: "Complete", engineer: "Chidi N.", service: "CCTV & Security" },
  { id: "INS-1040", customer: "Yusuf Pharmacy", address: "Sapon, Abeokuta", serial: "SLR-1187", date: "2026-08-27", status: "Complete", engineer: "Wale O.", service: "Solar Energy" },
  { id: "INS-1039", customer: "Redeemer's Academy", address: "Idi Aba, Abeokuta", serial: "WEB-0093", date: "2026-08-22", status: "Complete", engineer: "Chidi N.", service: "Web Application" },
];
const statusStyle = { Complete: { color: SUCCESS, Icon: CheckCircle2 }, Testing: { color: AMBER, Icon: Clock }, Pending: { color: SLATE, Icon: Circle } };
const flows = {
  "No internet connection": ["Check that the router's power light is on. If it's off, confirm the power cable is firmly connected.", "Look at the signal light on the CPE. Is it solid green, or blinking red?", "If blinking red, the outdoor unit may be misaligned or there's a line fault. This needs a technician visit.", "If solid green but still no internet, try restarting the router: unplug for 10 seconds, then plug back in."],
  "Slow connection": ["Ask how many devices are currently connected to the network.", "Suggest disconnecting unused devices, since too many connections share the same bandwidth.", "Check if the slowness happens on WiFi only or on a wired connection too, to isolate the router vs. the line.", "If wired is also slow, this points to a line issue and should be escalated to a technician."],
  "Router blinking red": ["A blinking red light usually means the outdoor unit has lost signal from the base station.", "Confirm nothing is blocking the line of sight to the outdoor unit, like new construction or foliage.", "Ask the customer to note when the blinking started, since storms or power cuts are common causes.", "This issue typically cannot be resolved remotely and should be escalated for a site visit."],
  "Device won't connect to WiFi": ["Confirm the customer is using the correct WiFi password, usually printed on the router label.", "Ask them to forget the network on their device and reconnect fresh.", "Check if other devices can connect. If only one device fails, the issue is likely on that device, not the router.", "If no devices can connect, restart the router and try again."],
};
const weeklyTickets = [{ day: "Mon", tickets: 4 }, { day: "Tue", tickets: 7 }, { day: "Wed", tickets: 3 }, { day: "Thu", tickets: 6 }, { day: "Fri", tickets: 8 }, { day: "Sat", tickets: 2 }, { day: "Sun", tickets: 1 }];
const engineerStats = [{ name: "Tunde B.", installs: 14 }, { name: "Wale O.", installs: 11 }, { name: "Chidi N.", installs: 9 }];

const seedStaff = [
  { name: "Mrs. Adewunmi", role: "Managing Director", dept: "Management", status: "Active" },
  { name: "Tunde B.", role: "Network Engineer", dept: "Field Ops", status: "Active" },
  { name: "Wale O.", role: "Network Engineer", dept: "Field Ops", status: "Active" },
  { name: "Chidi N.", role: "Network Engineer", dept: "Field Ops", status: "On Leave" },
  { name: "Fatima S.", role: "Customer Support", dept: "Support", status: "Active" },
  { name: "Biodun K.", role: "Accountant", dept: "Finance", status: "Active" },
];
const seedLeave = [{ id: "LV-01", name: "Chidi N.", type: "Annual Leave", dates: "Sep 12 to Sep 19", status: "Approved" }];

const seedInventory = [
  { item: "CPE Router (Model A)", inStock: 18, threshold: 10 },
  { item: "CPE Router (Model B)", inStock: 6, threshold: 10 },
  { item: "Ethernet Cable (100m roll)", inStock: 24, threshold: 8 },
  { item: "Outdoor Antenna Unit", inStock: 3, threshold: 5 },
  { item: "Power Adapters", inStock: 30, threshold: 15 },
  { item: "CCTV Camera Unit", inStock: 9, threshold: 6 },
  { item: "Solar Panel (Residential)", inStock: 4, threshold: 5 },
  { item: "Inverter / Battery Bank", inStock: 5, threshold: 4 },
];

const MAIN_USE_OPTIONS = ["Streaming & Entertainment", "Remote Work / Office", "Gaming", "General Browsing", "Business Operations", "Education / Online Classes"];

const ASSIGNEES = {
  Home: "Bisi K., Residential Sales",
  Business: "Tunji A., Enterprise Sales",
};

const seedLeads = [
  { id: "LD-01", name: "Okafor Textiles", phone: "0803 221 4471", location: "Ake, Abeokuta", type: "Business", expectedUsers: 12, provider: "MTN Hotspot", mainUse: "Business Operations", stage: "New", assignedTo: ASSIGNEES.Business },
  { id: "LD-02", name: "Redeemer's Academy", phone: "0805 662 9013", location: "Idi Aba, Abeokuta", type: "Business", expectedUsers: 40, provider: "Spectranet", mainUse: "Education / Online Classes", stage: "Contacted", assignedTo: ASSIGNEES.Business },
  { id: "LD-03", name: "Blue Nile Restaurant", phone: "0701 884 2290", location: "Oke Ilewo, Abeokuta", type: "Business", expectedUsers: 6, provider: "None currently", mainUse: "Business Operations", stage: "Contacted", assignedTo: ASSIGNEES.Business },
  { id: "LD-04", name: "Sapon Medical Centre", phone: "0812 337 5561", location: "Sapon, Abeokuta", type: "Business", expectedUsers: 15, provider: "Smile", mainUse: "Business Operations", stage: "Converted", assignedTo: ASSIGNEES.Business },
];
const leadStages = ["New", "Contacted", "Converted"];

const seedFinance = [
  { desc: "Customer subscription payments", type: "Income", amount: 340000, date: "2026-09-10" },
  { desc: "CPE stock purchase", type: "Expense", amount: 120000, date: "2026-09-08" },
  { desc: "Fuel for field engineers", type: "Expense", amount: 25000, date: "2026-09-09" },
  { desc: "New installation fees", type: "Income", amount: 95000, date: "2026-09-11" },
];

/* ---------- department definitions ---------- */
const DEPARTMENTS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "install", label: "Installations", icon: Wifi },
  { id: "support", label: "Support", icon: Ticket },
  { id: "hr", label: "HR", icon: Users },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "sales", label: "Sales", icon: Briefcase },
  { id: "finance", label: "Finance", icon: DollarSign },
];

/* ---------- roles ---------- */
const ROLES = [
  { id: "management", label: "Management", desc: "Full access across every department", icon: ShieldCheck, tabs: ["overview", "install", "support", "hr", "inventory", "sales", "finance"] },
  { id: "engineer", label: "Network Engineer", desc: "Installation records and field work", icon: HardHat, tabs: ["install"] },
  { id: "support", label: "Customer Support", desc: "Support assistant and escalations", icon: Headset, tabs: ["support"] },
  { id: "hr", label: "HR", desc: "Staff directory and leave requests", icon: Users, tabs: ["hr"] },
  { id: "inventory", label: "Inventory", desc: "Equipment and stock levels", icon: Package, tabs: ["inventory"] },
  { id: "sales", label: "Sales", desc: "Lead pipeline and prospects", icon: Briefcase, tabs: ["sales"] },
  { id: "finance", label: "Finance", desc: "Income, expenses, and balance", icon: Wallet, tabs: ["finance"] },
];

/* ---------- shared visual polish (fonts, hover states, focus rings) ---------- */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      .bth-role-btn { transition: border-color 0.15s ease, background 0.15s ease, transform 0.1s ease; }
      .bth-role-btn:hover { border-color: ${INK} !important; transform: translateY(-1px); }
      .bth-primary-btn { transition: opacity 0.15s ease, transform 0.1s ease; }
      .bth-primary-btn:hover:not(:disabled) { opacity: 0.92; }
      .bth-primary-btn:active:not(:disabled) { transform: scale(0.98); }
      .bth-chip { transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease; }
      .bth-chip:hover { border-color: ${INK}; }
      .bth-card { transition: box-shadow 0.15s ease, border-color 0.15s ease; }
      .bth-card:hover { box-shadow: 0 2px 10px rgba(20, 33, 61, 0.06); }
      .bth-input:focus, .bth-select:focus, .bth-textarea:focus { outline: none; border-color: ${INK} !important; box-shadow: 0 0 0 3px rgba(20, 33, 61, 0.08); }
      .bth-scroll::-webkit-scrollbar { height: 5px; }
      .bth-scroll::-webkit-scrollbar-thumb { background: #D9D4C7; border-radius: 10px; }
      .bth-scroll::-webkit-scrollbar-track { background: transparent; }
      .bth-logout:hover { border-color: ${INK} !important; color: ${INK} !important; }

      /* responsive shell: sidebar on desktop, top chip bar on mobile */
      .bth-topchips { display: flex; }
      .bth-sidebar { display: none; }
      .bth-shell { display: block; }
      .bth-main { max-width: 780px; margin: 0 auto; }
      @media (min-width: 900px) {
        .bth-topchips { display: none; }
        .bth-sidebar { display: flex; }
        .bth-shell { display: flex; max-width: 1100px; margin: 0 auto; align-items: flex-start; }
        .bth-main { max-width: none; margin: 0; flex: 1; min-width: 0; }
      }
      .bth-sidebar-item { transition: background 0.15s ease, color 0.15s ease; }
      .bth-sidebar-item:hover { background: #F0EEE6; }

      /* desktop table vs mobile cards */
      .bth-cards { display: flex; flex-direction: column; gap: 8px; }
      .bth-table-wrap { display: none; }
      @media (min-width: 900px) {
        .bth-cards { display: none; }
        .bth-table-wrap { display: block; }
      }
      .bth-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .bth-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; color: ${SLATE}; padding: 10px 12px; border-bottom: 1px solid ${LINE}; cursor: pointer; user-select: none; white-space: nowrap; }
      .bth-table th:hover { color: ${INK}; }
      .bth-table td { padding: 11px 12px; border-bottom: 1px solid ${LINE}; }
      .bth-table tr:hover td { background: #FAF9F5; }

      /* toast */
      .bth-toast-in { animation: bthToastIn 0.2s ease-out; }
      @keyframes bthToastIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }

      /* skeleton shimmer */
      .bth-skel { background: linear-gradient(90deg, #EDEAE0 25%, #F5F3EC 37%, #EDEAE0 63%); background-size: 400% 100%; animation: bthShimmer 1.4s ease infinite; border-radius: 6px; }
      @keyframes bthShimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

      /* landing texture */
      .bth-texture { background-image: radial-gradient(circle, #E4E0D4 1px, transparent 1px); background-size: 22px 22px; }
    `}</style>
  );
}

/* ---------- toast ---------- */
function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", zIndex: 50, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bth-toast-in"
          style={{
            position: "relative", left: 0, transform: "none", background: INK, color: "#fff",
            padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            boxShadow: "0 6px 20px rgba(20,33,61,0.25)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
          }}
        >
          <CheckCircle2 size={15} color={AMBER} /> {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------- empty state ---------- */
function EmptyState({ icon: Icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 16px", color: SLATE }}>
      <Icon size={22} color="#C9C3B4" style={{ marginBottom: 8 }} />
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

/* ---------- skeleton block ---------- */
function SkeletonRows({ count = 3, height = 58 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bth-skel" style={{ height, borderRadius: 8 }} />
      ))}
    </div>
  );
}



/* ---------- landing / login page ---------- */
function LandingPage({ onSelectRole }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bth-texture" style={{ background: `linear-gradient(180deg, #F7F5F1 0%, #F0ECE1 100%)`, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: INK, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <GlobalStyle />
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: INK, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 6px 16px rgba(20, 33, 61, 0.18)" }}>
            <Wifi size={27} color={AMBER} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: 0.2 }}>Bright Technologies</div>
          <div style={{ fontSize: 13.5, color: SLATE, marginTop: 5 }}>Wi-Fi &middot; Security &middot; Solar &middot; Web Solutions</div>
        </div>

        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 22, boxShadow: "0 8px 24px rgba(20, 33, 61, 0.06)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: SLATE, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>Sign in as</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = selected === r.id;
              return (
                <button
                  key={r.id}
                  className="bth-role-btn"
                  onClick={() => setSelected(r.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                    background: active ? "#F0EEE6" : "#fff", border: `1.5px solid ${active ? INK : LINE}`,
                    borderRadius: 10, padding: "11px 12px", cursor: "pointer",
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: active ? INK : "#F5F3EC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color={active ? AMBER : SLATE} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: SLATE, marginTop: 1 }}>{r.desc}</div>
                  </div>
                  {active && <BadgeCheck size={19} color={INK} />}
                </button>
              );
            })}
          </div>
          <button
            className="bth-primary-btn"
            disabled={!selected}
            onClick={() => selected && onSelectRole(selected)}
            style={{
              width: "100%", padding: "12px", borderRadius: 9, border: "none",
              background: selected ? INK : "#E4E0D4", color: selected ? "#fff" : "#A8A296", fontSize: 14, fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed",
            }}
          >
            Continue
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: SLATE, marginTop: 18, lineHeight: 1.5 }}>
          This is a role based access demo built for internal use.<br />No password is required in this prototype.
        </div>

        <div style={{ textAlign: "center", fontSize: 11, color: "#A8A296", marginTop: 22, lineHeight: 1.6 }}>
          1, Wonderland Estate, Kotopo, Abeokuta, off Abeokuta/Ibadan Expressway<br />
          +234 818 217 4085 &middot; support@brighttechworld.com
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function CompanyHubApp({ role, onLogout }) {
  const roleInfo = ROLES.find((r) => r.id === role);
  const allowedTabs = roleInfo ? roleInfo.tabs : ["overview"];
  const [tab, setTab] = useState(allowedTabs[0]);

  /* toast + initial load skeleton */
  const [toasts, setToasts] = useState([]);
  function pushToast(message) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }
  const [pageLoading, setPageLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);

  /* installs table sort (desktop) */
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  function toggleSort(key) {
    if (sortKey === key) { setSortDir(sortDir === "asc" ? "desc" : "asc"); }
    else { setSortKey(key); setSortDir("asc"); }
  }

  /* installs */
  const dbReady = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const [installs, setInstalls] = useState(seedInstalls);
  const [dbError, setDbError] = useState(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState({ customer: "", address: "", serial: "", service: SERVICE_TYPES[0] });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!dbReady) return;
    (async () => {
      const { data, error } = await supabase.from("installations").select("*").order("created_at", { ascending: false });
      if (error) { setDbError(error.message); return; }
      if (data && data.length > 0) {
        setInstalls(data.map((r) => ({ id: r.id, customer: r.customer, address: r.address, serial: r.serial, engineer: r.engineer, status: r.status, date: r.install_date })));
      }
    })();
  }, [dbReady]);

  const filtered = installs.filter((i) => i.customer.toLowerCase().includes(query.toLowerCase()) || i.serial.toLowerCase().includes(query.toLowerCase()));
  const statusCounts = ["Pending", "Testing", "Complete"].map((s) => ({ status: s, count: installs.filter((i) => i.status === s).length }));

  async function addInstall() {
    if (!form.customer || !form.address || !form.serial) return;
    const newRecord = { id: `INS-${1045 + installs.length}`, customer: form.customer, address: form.address, serial: form.serial, date: new Date().toISOString().slice(0, 10), status: "Pending", engineer: "Unassigned", service: form.service };

    if (dbReady) {
      const { error } = await supabase.from("installations").insert({
        id: newRecord.id, customer: newRecord.customer, address: newRecord.address, serial: newRecord.serial,
        engineer: newRecord.engineer, status: newRecord.status, install_date: newRecord.date,
      });
      if (error) { setDbError(error.message); return; }
    }

    setInstalls([newRecord, ...installs]);
    setForm({ customer: "", address: "", serial: "", service: SERVICE_TYPES[0] });
    setShowForm(false);
    pushToast(`Install record ${newRecord.id} saved`);
  }

  async function cycleStatus(id) {
    const order = ["Pending", "Testing", "Complete"];
    const current = installs.find((i) => i.id === id);
    const nextStatus = order[(order.indexOf(current.status) + 1) % order.length];

    if (dbReady) {
      const { error } = await supabase.from("installations").update({ status: nextStatus }).eq("id", id);
      if (error) { setDbError(error.message); return; }
    }

    setInstalls(installs.map((i) => (i.id === id ? { ...i, status: nextStatus } : i)));
    pushToast(`${id} marked as ${nextStatus}`);
  }

  /* support */
  const [chat, setChat] = useState([{ from: "bot", text: "Hi, I'm the support assistant. What issue is the customer experiencing?" }]);
  const [stepIndex, setStepIndex] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [tickets, setTickets] = useState([]);
  function pickIssue(issue) {
    setChat((c) => [...c, { from: "user", text: issue }, { from: "bot", text: flows[issue][0] }]);
    setActiveFlow(issue);
    setStepIndex(0);
  }
  function nextStep(resolved) {
    if (resolved) {
      setChat((c) => [...c, { from: "user", text: "That fixed it" }, { from: "bot", text: "Great, glad it's sorted. Anything else?" }]);
      setActiveFlow(null); setStepIndex(null); return;
    }
    const steps = flows[activeFlow]; const next = stepIndex + 1;
    if (next < steps.length) {
      setChat((c) => [...c, { from: "user", text: "Still not working" }, { from: "bot", text: steps[next] }]);
      setStepIndex(next);
    } else {
      const ticketId = `TCK-${2001 + tickets.length}`;
      setTickets((t) => [...t, { id: ticketId, issue: activeFlow, time: new Date().toLocaleTimeString() }]);
      setChat((c) => [...c, { from: "user", text: "Still not working" }, { from: "bot", text: `This needs a technician. I've raised ticket ${ticketId} for escalation.` }]);
      setActiveFlow(null); setStepIndex(null);
    }
  }
  function resetChat() { setChat([{ from: "bot", text: "Hi, I'm the support assistant. What issue is the customer experiencing?" }]); setActiveFlow(null); setStepIndex(null); }

  /* HR */
  const [staff] = useState(seedStaff);
  const [leave, setLeave] = useState(seedLeave);
  const [leaveForm, setLeaveForm] = useState({ name: "", type: "Annual Leave", dates: "" });
  function requestLeave() {
    if (!leaveForm.name || !leaveForm.dates) return;
    setLeave([{ id: `LV-${(leave.length + 2).toString().padStart(2, "0")}`, name: leaveForm.name, type: leaveForm.type, dates: leaveForm.dates, status: "Pending" }, ...leave]);
    setLeaveForm({ name: "", type: "Annual Leave", dates: "" });
    pushToast("Leave request submitted");
  }
  function toggleLeaveStatus(id) {
    const l = leave.find((x) => x.id === id);
    const nextStatus = l.status === "Pending" ? "Approved" : "Pending";
    setLeave(leave.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)));
    pushToast(`Leave request ${nextStatus.toLowerCase()}`);
  }

  /* inventory */
  const [inventory, setInventory] = useState(seedInventory);
  function adjustStock(item, delta) {
    setInventory(inventory.map((i) => (i.item === item ? { ...i, inStock: Math.max(0, i.inStock + delta) } : i)));
  }

  /* sales, lead intake for "I'm interested" conversations */
  const [leads, setLeads] = useState(seedLeads);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const emptyLeadForm = { name: "", phone: "", location: "", type: "Home", expectedUsers: "", provider: "", mainUse: MAIN_USE_OPTIONS[0] };
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [expandedLead, setExpandedLead] = useState(null);

  function addLead() {
    if (!leadForm.name || !leadForm.phone || !leadForm.location) return;
    const assignedTo = ASSIGNEES[leadForm.type];
    const newLead = {
      id: `LD-${(leads.length + 5).toString().padStart(2, "0")}`,
      name: leadForm.name, phone: leadForm.phone, location: leadForm.location,
      type: leadForm.type, expectedUsers: leadForm.expectedUsers || "—",
      provider: leadForm.provider || "None currently", mainUse: leadForm.mainUse,
      stage: "New", assignedTo,
    };
    setLeads([newLead, ...leads]);
    setLeadForm(emptyLeadForm);
    setShowLeadForm(false);
    pushToast(`Lead qualified and sent to ${assignedTo.split(",")[0]}`);
  }
  function advanceLead(id) {
    setLeads(leads.map((l) => { if (l.id !== id) return l; const idx = leadStages.indexOf(l.stage); return idx < leadStages.length - 1 ? { ...l, stage: leadStages[idx + 1] } : l; }));
    pushToast("Lead moved forward");
  }

  /* finance */
  const [finance, setFinance] = useState(seedFinance);
  const [finForm, setFinForm] = useState({ desc: "", type: "Expense", amount: "" });
  const balance = finance.reduce((sum, f) => sum + (f.type === "Income" ? f.amount : -f.amount), 0);
  function addFinance() {
    if (!finForm.desc || !finForm.amount) return;
    setFinance([{ desc: finForm.desc, type: finForm.type, amount: Number(finForm.amount), date: new Date().toISOString().slice(0, 10) }, ...finance]);
    setFinForm({ desc: "", type: "Expense", amount: "" });
    pushToast("Entry added to finance log");
  }

  const totalTicketsThisWeek = weeklyTickets.reduce((a, b) => a + b.tickets, 0);
  const lowStockCount = inventory.filter((i) => i.inStock <= i.threshold).length;

  return (
    <div style={{ background: PAPER, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <GlobalStyle />
      <Toast toasts={toasts} />
      <div style={{ background: CARD, borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wifi size={15} color={AMBER} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', system-ui, sans-serif", lineHeight: 1.1 }}>Bright Technologies</div>
              <div style={{ fontSize: 11, color: SLATE }}>Company Hub</div>
            </div>
          </div>
          <button className="bth-logout" onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${LINE}`, borderRadius: 20, padding: "6px 12px", fontSize: 12, color: SLATE, cursor: "pointer" }}>
            <LogOut size={13} /> {roleInfo ? roleInfo.label : "Switch role"}
          </button>
        </div>
      </div>

      <div className="bth-shell" style={{ padding: "24px 16px 60px" }}>
        {/* desktop sidebar */}
        <div className="bth-sidebar" style={{ flexDirection: "column", gap: 3, width: 190, flexShrink: 0, marginRight: 24, position: "sticky", top: 78 }}>
          {DEPARTMENTS.filter((d) => allowedTabs.includes(d.id)).map((d) => {
            const Icon = d.icon;
            const active = tab === d.id;
            return (
              <button
                key={d.id}
                className="bth-sidebar-item"
                onClick={() => setTab(d.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                  background: active ? "#F0EEE6" : "transparent", color: INK,
                  border: "none", borderLeft: `2.5px solid ${active ? INK : "transparent"}`,
                  borderRadius: "0 8px 8px 0", padding: "9px 12px", fontSize: 13.5, fontWeight: active ? 600 : 400, cursor: "pointer",
                }}
              >
                <Icon size={15} color={active ? INK : SLATE} /> {d.label}
              </button>
            );
          })}
        </div>

        <div className="bth-main">
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 3px", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            {DEPARTMENTS.find((d) => d.id === tab)?.label || "Overview"}
          </h1>
          <div style={{ fontSize: 13, color: SLATE, marginBottom: 20 }}>
            {greeting()}, {roleInfo ? roleInfo.label : "there"} &middot; {todayLabel()}
          </div>

          {/* department chip nav, mobile only */}
          <div className="bth-scroll bth-topchips" style={{ gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 20, WebkitOverflowScrolling: "touch" }}>
            {DEPARTMENTS.filter((d) => allowedTabs.includes(d.id)).map((d) => {
              const Icon = d.icon;
              const active = tab === d.id;
              return (
                <button
                  key={d.id}
                  className="bth-chip"
                  onClick={() => setTab(d.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                    background: active ? INK : CARD, color: active ? "#fff" : INK,
                    border: `1.5px solid ${active ? INK : LINE}`, borderRadius: 20,
                    padding: "8px 14px", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", flexShrink: 0,
                  }}
                >
                  <Icon size={14} /> {d.label}
                </button>
              );
            })}
          </div>

        {/* ---------------- OVERVIEW ---------------- */}
        {tab === "overview" && (
          <div>
            {pageLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 22 }}>
                <SkeletonRows count={6} height={62} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 22 }}>
                <KpiCard icon={<Wifi size={16} color={INK} />} label="Total installs" value={installs.length} />
                <KpiCard icon={<Ticket size={16} color={AMBER} />} label="Tickets this week" value={totalTicketsThisWeek} />
                <KpiCard icon={<Users size={16} color={SLATE} />} label="Staff active" value={staff.filter((s) => s.status === "Active").length} />
                <KpiCard icon={<AlertTriangle size={16} color={ALERT} />} label="Low stock items" value={lowStockCount} />
                <KpiCard icon={<Briefcase size={16} color={SUCCESS} />} label="Open leads" value={leads.filter((l) => l.stage !== "Converted").length} />
                <KpiCard icon={<DollarSign size={16} color={INK} />} label="Net balance" value={`₦${balance.toLocaleString()}`} />
              </div>
            )}

            <PanelTitle>Installations by status</PanelTitle>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, background: CARD, padding: "14px 10px", marginBottom: 22 }}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={statusCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusCounts.map((entry, i) => (<Cell key={i} fill={statusStyle[entry.status].color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <PanelTitle>Support tickets, last 7 days</PanelTitle>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, background: CARD, padding: "14px 10px", marginBottom: 22 }}>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={weeklyTickets}>
                  <CartesianGrid strokeDasharray="3 3" stroke={LINE} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: SLATE }} axisLine={{ stroke: LINE }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: SLATE }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip />
                  <Line type="monotone" dataKey="tickets" stroke={AMBER} strokeWidth={2.5} dot={{ r: 3, fill: AMBER }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <PanelTitle>Departments at a glance</PanelTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Field Ops", detail: `${installs.length} installs logged`, onClick: () => setTab("install") },
                { label: "Support", detail: `${tickets.length} tickets escalated today`, onClick: () => setTab("support") },
                { label: "HR", detail: `${leave.filter((l) => l.status === "Pending").length} leave requests pending`, onClick: () => setTab("hr") },
                { label: "Inventory", detail: `${lowStockCount} items running low`, onClick: () => setTab("inventory") },
                { label: "Sales", detail: `${leads.length} leads in pipeline`, onClick: () => setTab("sales") },
                { label: "Finance", detail: `₦${balance.toLocaleString()} net this period`, onClick: () => setTab("finance") },
              ].map((row) => (
                <button key={row.label} onClick={row.onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: CARD, border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, cursor: "pointer", color: INK, textAlign: "left" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{row.label}</div>
                    <div style={{ fontSize: 12.5, color: SLATE }}>{row.detail}</div>
                  </div>
                  <ChevronRight size={16} color={SLATE} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- INSTALLATIONS ---------------- */}
        {tab === "install" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: 12 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: dbReady ? SUCCESS : AMBER, display: "inline-block" }} />
              <span style={{ color: SLATE }}>{dbReady ? "Connected to live database" : "Demo mode, data resets on refresh"}</span>
            </div>
            {dbError && (
              <div style={{ background: "#FDECEA", border: `1px solid ${ALERT}`, borderRadius: 8, padding: "10px 12px", fontSize: 12.5, color: ALERT, marginBottom: 14 }}>
                Database error: {dbError}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 6, padding: "8px 10px", background: CARD }}>
                <Search size={15} color={SLATE} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by customer or serial number" style={{ border: "none", outline: "none", marginLeft: 8, fontSize: 14, flex: 1, background: "transparent" }} />
              </div>
              <button onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 6, ...smallBtn, padding: "0 14px" }}><Plus size={15} /> New</button>
            </div>
            {showForm && (
              <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 18, background: CARD }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <input placeholder="Customer name" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className="bth-input" style={inputStyle} />
                  <input placeholder="Installation address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bth-input" style={inputStyle} />
                  <input placeholder="CPE / router serial number" value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} className="bth-input" style={{ ...inputStyle, fontFamily: "monospace" }} />
                  <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="bth-select" style={inputStyle}>
                    {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={addInstall} style={{ marginTop: 12, background: AMBER, color: INK, border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Save record</button>
              </div>
            )}
            <div style={{ display: "flex", gap: 16, marginBottom: 18, fontSize: 13, color: SLATE }}>
              <span>{installs.length} total</span><span>{installs.filter((i) => i.status === "Complete").length} complete</span><span>{installs.filter((i) => i.status === "Pending").length} pending</span>
            </div>

            {pageLoading ? (
              <SkeletonRows count={4} height={64} />
            ) : filtered.length === 0 ? (
              <EmptyState icon={Wifi} text="No installation records match your search." />
            ) : (
              <>
                {/* mobile cards */}
                <div className="bth-cards">
                  {filtered.map((i) => {
                    const { color, Icon } = statusStyle[i.status];
                    return (
                      <div key={i.id} style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: "12px 14px", background: CARD, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{i.customer}</span>
                            {i.service && <span style={{ fontSize: 10, color: INK, background: "#F0EEE6", borderRadius: 10, padding: "1px 8px" }}>{i.service}</span>}
                          </div>
                          <div style={{ fontSize: 12.5, color: SLATE, marginTop: 2 }}>{i.address}</div>
                          <div style={{ fontSize: 12, color: SLATE, marginTop: 4, fontFamily: "monospace" }}>{i.id} &middot; {i.serial} &middot; {i.date} &middot; {i.engineer}</div>
                        </div>
                        <button onClick={() => cycleStatus(i.id)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${color}`, color, borderRadius: 20, padding: "5px 10px", fontSize: 12.5, cursor: "pointer" }}><Icon size={13} /> {i.status}</button>
                      </div>
                    );
                  })}
                </div>

                {/* desktop table */}
                <div className="bth-table-wrap" style={{ border: `1px solid ${LINE}`, borderRadius: 8, background: CARD, overflow: "hidden" }}>
                  <table className="bth-table">
                    <thead>
                      <tr>
                        <th onClick={() => toggleSort("customer")}>Customer {sortKey === "customer" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                        <th onClick={() => toggleSort("service")}>Service {sortKey === "service" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                        <th onClick={() => toggleSort("engineer")}>Engineer {sortKey === "engineer" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                        <th onClick={() => toggleSort("date")}>Date {sortKey === "date" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                        <th onClick={() => toggleSort("status")}>Status {sortKey === "status" ? (sortDir === "asc" ? "↑" : "↓") : ""}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filtered].sort((a, b) => {
                        const dir = sortDir === "asc" ? 1 : -1;
                        return a[sortKey] > b[sortKey] ? dir : a[sortKey] < b[sortKey] ? -dir : 0;
                      }).map((i) => {
                        const { color, Icon } = statusStyle[i.status];
                        return (
                          <tr key={i.id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{i.customer}</div>
                              <div style={{ fontSize: 11.5, color: SLATE, fontFamily: "monospace" }}>{i.id} &middot; {i.serial}</div>
                            </td>
                            <td>{i.service || "—"}</td>
                            <td>{i.engineer}</td>
                            <td>{i.date}</td>
                            <td>
                              <button onClick={() => cycleStatus(i.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${color}`, color, borderRadius: 20, padding: "4px 10px", fontSize: 12.5, cursor: "pointer" }}><Icon size={12} /> {i.status}</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ---------------- SUPPORT ---------------- */}
        {tab === "support" && (
          <div>
            <PanelTitle>Support assistant</PanelTitle>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, background: CARD, padding: 18, minHeight: 240, marginBottom: 14 }}>
              {chat.map((m, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: m.from === "bot" ? "flex-start" : "flex-end", marginBottom: 10 }}>
                  <div style={{ maxWidth: "80%", background: m.from === "bot" ? "#F0EEE6" : INK, color: m.from === "bot" ? INK : "#fff", borderRadius: 10, padding: "8px 12px", fontSize: 14, lineHeight: 1.4 }}>{m.text}</div>
                </div>
              ))}
              {!activeFlow && chat.length === 1 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {Object.keys(flows).map((issue) => (<button key={issue} onClick={() => pickIssue(issue)} style={chipStyle}>{issue}</button>))}
                </div>
              )}
              {activeFlow && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => nextStep(true)} style={{ ...chipStyle, borderColor: SUCCESS, color: SUCCESS }}>That worked</button>
                  <button onClick={() => nextStep(false)} style={{ ...chipStyle, borderColor: ALERT, color: ALERT }}>Still not working <ArrowRight size={12} style={{ marginLeft: 4 }} /></button>
                </div>
              )}
            </div>
            <button onClick={resetChat} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: SLATE, fontSize: 13, cursor: "pointer", marginBottom: 22 }}><RotateCcw size={13} /> Start a new conversation</button>
            <div>
              <PanelTitle>Escalated tickets</PanelTitle>
              {tickets.length === 0 ? (
                <EmptyState icon={Ticket} text="No tickets escalated yet. Resolved and unresolved chats will show up here." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tickets.map((t) => (
                    <div key={t.id} style={{ border: `1px solid ${LINE}`, borderRadius: 6, padding: "8px 12px", fontSize: 13, background: CARD, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "monospace" }}>{t.id}</span><span style={{ color: SLATE }}>{t.issue}</span><span style={{ color: SLATE }}>{t.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- HR ---------------- */}
        {tab === "hr" && (
          <div>
            <PanelTitle>Staff directory</PanelTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
              {staff.map((s) => (
                <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 14px", background: CARD }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12.5, color: SLATE }}>{s.role} &middot; {s.dept}</div>
                  </div>
                  <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, border: `1px solid ${s.status === "Active" ? SUCCESS : AMBER}`, color: s.status === "Active" ? SUCCESS : AMBER }}>{s.status}</span>
                </div>
              ))}
            </div>

            <PanelTitle>Leave requests</PanelTitle>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 14, background: CARD }}>
              <div style={{ display: "grid", gap: 10 }}>
                <input placeholder="Staff name" value={leaveForm.name} onChange={(e) => setLeaveForm({ ...leaveForm, name: e.target.value })} className="bth-input" style={inputStyle} />
                <select value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })} className="bth-input" style={inputStyle}>
                  <option>Annual Leave</option><option>Sick Leave</option><option>Compassionate Leave</option>
                </select>
                <input placeholder="Dates, e.g. Sep 20 to Sep 24" value={leaveForm.dates} onChange={(e) => setLeaveForm({ ...leaveForm, dates: e.target.value })} className="bth-input" style={inputStyle} />
              </div>
              <button onClick={requestLeave} style={{ marginTop: 12, ...smallBtn }}>Submit request</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {leave.map((l) => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 14px", background: CARD }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name} <span style={{ fontWeight: 400, color: SLATE, fontSize: 12.5 }}>({l.type})</span></div>
                    <div style={{ fontSize: 12.5, color: SLATE }}>{l.dates}</div>
                  </div>
                  <button onClick={() => toggleLeaveStatus(l.id)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 20, border: `1px solid ${l.status === "Approved" ? SUCCESS : SLATE}`, color: l.status === "Approved" ? SUCCESS : SLATE, background: "none", cursor: "pointer" }}>{l.status}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- INVENTORY ---------------- */}
        {tab === "inventory" && (
          <div>
            <PanelTitle>CPE and equipment stock</PanelTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {inventory.map((item) => {
                const low = item.inStock <= item.threshold;
                return (
                  <div key={item.item} style={{ border: `1px solid ${low ? ALERT : LINE}`, borderRadius: 8, padding: "12px 14px", background: CARD }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.item}</div>
                      {low && <span style={{ fontSize: 11.5, color: ALERT, display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={12} /> Low stock</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: SLATE }}>In stock: <strong style={{ color: INK }}>{item.inStock}</strong> (reorder below {item.threshold})</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => adjustStock(item.item, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${LINE}`, background: CARD, cursor: "pointer" }}>−</button>
                        <button onClick={() => adjustStock(item.item, 1)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${LINE}`, background: CARD, cursor: "pointer" }}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- SALES ---------------- */}
        {tab === "sales" && (
          <div>
            <div style={{ background: "#F0EEE6", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 12.5, color: SLATE }}>
              When someone says <strong style={{ color: INK }}>"I'm interested"</strong>, capture their details below. Qualified leads are automatically routed to the right person based on Home or Business.
            </div>

            <button
              onClick={() => setShowLeadForm(!showLeadForm)}
              style={{ display: "flex", alignItems: "center", gap: 6, ...smallBtn, padding: "0 14px", marginBottom: 16 }}
            >
              <Plus size={15} /> New interested lead
            </button>

            {showLeadForm && (
              <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 20, background: CARD }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <input placeholder="Name" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className="bth-input" style={inputStyle} />
                  <input placeholder="Phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className="bth-input" style={inputStyle} />
                  <input placeholder="Location" value={leadForm.location} onChange={(e) => setLeadForm({ ...leadForm, location: e.target.value })} className="bth-input" style={inputStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <select value={leadForm.type} onChange={(e) => setLeadForm({ ...leadForm, type: e.target.value })} className="bth-input" style={inputStyle}>
                      <option value="Home">Home</option>
                      <option value="Business">Business</option>
                    </select>
                    <input placeholder="Expected users" type="number" value={leadForm.expectedUsers} onChange={(e) => setLeadForm({ ...leadForm, expectedUsers: e.target.value })} className="bth-input" style={inputStyle} />
                  </div>
                  <input placeholder="Current internet provider" value={leadForm.provider} onChange={(e) => setLeadForm({ ...leadForm, provider: e.target.value })} className="bth-input" style={inputStyle} />
                  <select value={leadForm.mainUse} onChange={(e) => setLeadForm({ ...leadForm, mainUse: e.target.value })} className="bth-input" style={inputStyle}>
                    {MAIN_USE_OPTIONS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div style={{ fontSize: 11.5, color: SLATE, marginTop: 10 }}>
                  Will be routed to: <strong style={{ color: INK }}>{ASSIGNEES[leadForm.type]}</strong>
                </div>
                <button onClick={addLead} style={{ marginTop: 12, background: AMBER, color: INK, border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Qualify and send lead</button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {leadStages.map((stage) => {
                const stageLeads = leads.filter((l) => l.stage === stage);
                return (
                  <div key={stage}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: SLATE, marginBottom: 8 }}>{stage} ({stageLeads.length})</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {stageLeads.length === 0 ? (
                        <div style={{ border: `1.5px dashed ${LINE}`, borderRadius: 8, padding: "16px 8px", textAlign: "center", fontSize: 11, color: "#B5AFA0" }}>Empty</div>
                      ) : (
                        stageLeads.map((l) => (
                          <div
                            key={l.id}
                            onClick={() => setExpandedLead(expandedLead === l.id ? null : l.id)}
                            style={{ border: `1px solid ${expandedLead === l.id ? INK : LINE}`, borderRadius: 8, padding: "10px", background: CARD, fontSize: 12.5, cursor: "pointer" }}
                          >
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{l.name}</div>
                            <div style={{ fontSize: 10.5, color: SLATE, marginBottom: 6 }}>{l.type} &middot; {l.location}</div>
                            {stage !== "Converted" && (
                              <button onClick={(e) => { e.stopPropagation(); advanceLead(l.id); }} style={{ fontSize: 11.5, color: SUCCESS, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 2 }}>
                                Move forward <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {expandedLead && (() => {
              const l = leads.find((x) => x.id === expandedLead);
              if (!l) return null;
              return (
                <div style={{ border: `1.5px solid ${INK}`, borderRadius: 8, padding: 16, background: CARD }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{l.name}</div>
                    <button onClick={() => setExpandedLead(null)} style={{ background: "none", border: "none", color: SLATE, cursor: "pointer", fontSize: 13 }}>Close</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12.5 }}>
                    <div><span style={{ color: SLATE }}>Phone:</span> {l.phone}</div>
                    <div><span style={{ color: SLATE }}>Location:</span> {l.location}</div>
                    <div><span style={{ color: SLATE }}>Type:</span> {l.type}</div>
                    <div><span style={{ color: SLATE }}>Expected users:</span> {l.expectedUsers}</div>
                    <div><span style={{ color: SLATE }}>Current provider:</span> {l.provider}</div>
                    <div><span style={{ color: SLATE }}>Main use:</span> {l.mainUse}</div>
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}`, fontSize: 12.5 }}>
                    <span style={{ color: SLATE }}>Assigned to:</span> <strong>{l.assignedTo}</strong>
                  </div>
                </div>
              );
            })()}
          </div>

        )}

        {/* ---------------- FINANCE ---------------- */}
        {tab === "finance" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <KpiCard icon={<DollarSign size={16} color={INK} />} label="Net balance this period" value={`₦${balance.toLocaleString()}`} />
            </div>
            <div style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: 16, marginBottom: 18, background: CARD }}>
              <div style={{ display: "grid", gap: 10 }}>
                <input placeholder="Description" value={finForm.desc} onChange={(e) => setFinForm({ ...finForm, desc: e.target.value })} className="bth-input" style={inputStyle} />
                <select value={finForm.type} onChange={(e) => setFinForm({ ...finForm, type: e.target.value })} className="bth-input" style={inputStyle}>
                  <option>Expense</option><option>Income</option>
                </select>
                <input placeholder="Amount in naira" type="number" value={finForm.amount} onChange={(e) => setFinForm({ ...finForm, amount: e.target.value })} className="bth-input" style={inputStyle} />
              </div>
              <button onClick={addFinance} style={{ marginTop: 12, ...smallBtn }}>Add entry</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {finance.map((f, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 14px", background: CARD }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{f.desc}</div>
                    <div style={{ fontSize: 12, color: SLATE }}>{f.date}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: f.type === "Income" ? SUCCESS : ALERT }}>{f.type === "Income" ? "+" : "−"}₦{f.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(null);
  if (!role) return <LandingPage onSelectRole={setRole} />;
  return <CompanyHubApp role={role} onLogout={() => setRole(null)} />;
}
