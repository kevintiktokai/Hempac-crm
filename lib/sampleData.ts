/**
 * Sample dataset for the Hempac Sales Engine prototype — v3 scope.
 * Ported from hempac-sales-engine-demo.tsx and extended per
 * SCOPE-ADDENDUM-v3: two pipelines, quotations & orders, assignment +
 * audit trail, tasks with reminders, users/roles, dual-trigger suggestions.
 * Phase A only — replaced by Convex in Phase B.
 */

export type SchoolType = "Group" | "Private" | "Trust" | "Mission" | "Government";
export type EngineStage = "Discovered" | "Scored" | "Contacted" | "Replied" | "In pipeline";
export type Product = "Smart Boards" | "Sports Equipment" | "Both";
export type MessageDirection = "in" | "out";

/* ---------------- users & roles (§6: shared visibility, 2 roles) ---------------- */

export type Role = "admin" | "member";

export interface User {
  id: string;
  name: string;
  initials: string;
  role: Role;
}

export const USERS: User[] = [
  { id: "u-ec", name: "Emilia Chisango", initials: "EC", role: "admin" },
  { id: "u-gb", name: "Gracious Banda", initials: "GB", role: "admin" },
  { id: "u-tc", name: "Tino Chisango", initials: "TC", role: "member" },
  { id: "u-rk", name: "Rudo Kanjanda", initials: "RK", role: "member" },
];

export const CURRENT_USER = { ...USERS[0], firstName: "Emilia", roleTitle: "Founder & CEO" };

export const userById = (id: string): User | undefined => USERS.find((u) => u.id === id);

/* ---------------- pipelines (§1: two types) ---------------- */

export type PipelineType = "boards" | "sports";

export const BOARDS_STAGES = [
  "Enquiry", "Quotation Sent", "Awaiting Response", "Awaiting Term",
  "Awaiting Funds", "No Response", "Won", "Lost",
] as const;
export const SPORTS_STAGES = ["Enquiry", "Interested", "Not Now", "Won", "Lost"] as const;

export type BoardsStage = (typeof BOARDS_STAGES)[number];
export type SportsStage = (typeof SPORTS_STAGES)[number];
export type DealStage = BoardsStage | SportsStage;

/** The four "quoted, in play" buckets on the boards side (§2). */
export const QUOTE_BUCKETS = ["Awaiting Response", "Awaiting Term", "Awaiting Funds", "No Response"] as const;

export type BoardSize = "65\"" | "75\"" | "86\"";
export const BOARD_SIZES: BoardSize[] = ["65\"", "75\"", "86\""];

export interface Deal {
  id: string;
  schoolId: number;
  pipeline: PipelineType;
  stage: DealStage;
  product: Product;
  units: number;
  boardSize?: BoardSize;
  value: number;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  note?: string;
}

export const DEALS: Deal[] = [
  // Boards pipeline (quotation-driven)
  { id: "d-1", schoolId: 1, pipeline: "boards", stage: "Awaiting Response", product: "Smart Boards", units: 14, boardSize: "86\"", value: 32000, assignedTo: "u-ec", createdBy: "u-ec", createdAt: "12 Jun", note: "Finance committee met Thursday" },
  { id: "d-2", schoolId: 2, pipeline: "boards", stage: "Won", product: "Smart Boards", units: 10, boardSize: "75\"", value: 22500, assignedTo: "u-ec", createdBy: "u-gb", createdAt: "28 May", note: "PO signed — install to book" },
  { id: "d-3", schoolId: 3, pipeline: "boards", stage: "Enquiry", product: "Smart Boards", units: 8, boardSize: "75\"", value: 18400, assignedTo: "u-tc", createdBy: "u-ec", createdAt: "3 Jul", note: "ICT committee asked for formal quote" },
  { id: "d-4", schoolId: 4, pipeline: "boards", stage: "Enquiry", product: "Smart Boards", units: 4, boardSize: "65\"", value: 9800, assignedTo: "u-tc", createdBy: "u-tc", createdAt: "8 Jul", note: "PTA demo Friday" },
  { id: "d-5", schoolId: 6, pipeline: "boards", stage: "Enquiry", product: "Smart Boards", units: 5, boardSize: "65\"", value: 7200, assignedTo: "u-tc", createdBy: "u-ec", createdAt: "9 Jul", note: "Wants pricing across three sizes" },
  { id: "d-6", schoolId: 7, pipeline: "boards", stage: "Quotation Sent", product: "Smart Boards", units: 6, boardSize: "65\"", value: 5600, assignedTo: "u-ec", createdBy: "u-ec", createdAt: "1 Jul", note: "Proposal for two senior classrooms" },
  { id: "d-7", schoolId: 9, pipeline: "boards", stage: "Awaiting Funds", product: "Smart Boards", units: 3, boardSize: "75\"", value: 6900, assignedTo: "u-ec", createdBy: "u-ec", createdAt: "17 Jun", note: "Q3 grant cycle" },
  { id: "d-8", schoolId: 10, pipeline: "boards", stage: "Awaiting Term", product: "Smart Boards", units: 4, boardSize: "75\"", value: 9200, assignedTo: "u-gb", createdBy: "u-gb", createdAt: "5 Jun", note: "Third term — new science block opens" },
  { id: "d-9", schoolId: 11, pipeline: "boards", stage: "No Response", product: "Smart Boards", units: 6, boardSize: "65\"", value: 5700, assignedTo: "u-rk", createdBy: "u-ec", createdAt: "22 May", note: "Quoted 21 days ago, silent since" },
  // Sports pipeline (fast, transactional)
  { id: "d-10", schoolId: 5, pipeline: "sports", stage: "Interested", product: "Sports Equipment", units: 1, value: 6400, assignedTo: "u-ec", createdBy: "u-ec", createdAt: "7 Jul", note: "Gym + field refresh before season" },
  { id: "d-11", schoolId: 8, pipeline: "sports", stage: "Interested", product: "Sports Equipment", units: 1, value: 4900, assignedTo: "u-tc", createdBy: "u-tc", createdAt: "4 Jul", note: "Expanding sports programme" },
  { id: "d-12", schoolId: 4, pipeline: "sports", stage: "Enquiry", product: "Sports Equipment", units: 1, value: 1150, assignedTo: "u-rk", createdBy: "u-rk", createdAt: "11 Jul", note: "Netball + athletics kit" },
  { id: "d-13", schoolId: 7, pipeline: "sports", stage: "Not Now", product: "Sports Equipment", units: 1, value: 980, assignedTo: "u-tc", createdBy: "u-tc", createdAt: "20 Jun", note: "Revisit next season" },
];

export const dealById = (id: string): Deal | undefined => DEALS.find((d) => d.id === id);
export const dealsForSchool = (schoolId: number): Deal[] => DEALS.filter((d) => d.schoolId === schoolId);

/* ---------------- quotations (§2: activity vs hit rate) ---------------- */

export interface Quote {
  id: string;
  schoolId: number | null;
  schoolName: string;
  dealId?: string;
  value: number;
  units: number;
  boardSize?: BoardSize;
  pipeline: PipelineType;
  status: "sent" | "won" | "lost";
  sentAt: string;
  ownerId: string;
}

export const QUOTES: Quote[] = [
  // open (status sent) — these sit in the buckets
  { id: "q-1", schoolId: 1, schoolName: "Greendale Group of Schools", dealId: "d-1", value: 32000, units: 14, boardSize: "86\"", pipeline: "boards", status: "sent", sentAt: "14 Jun", ownerId: "u-ec" },
  { id: "q-2", schoolId: 7, schoolName: "Riverside Day School", dealId: "d-6", value: 5600, units: 6, boardSize: "65\"", pipeline: "boards", status: "sent", sentAt: "1 Jul", ownerId: "u-ec" },
  { id: "q-3", schoolId: 9, schoolName: "Avondale Christian College", dealId: "d-7", value: 6900, units: 3, boardSize: "75\"", pipeline: "boards", status: "sent", sentAt: "17 Jun", ownerId: "u-ec" },
  { id: "q-4", schoolId: 10, schoolName: "Hillcrest Academy", dealId: "d-8", value: 9200, units: 4, boardSize: "75\"", pipeline: "boards", status: "sent", sentAt: "6 Jun", ownerId: "u-gb" },
  { id: "q-5", schoolId: 11, schoolName: "St. Aidan's Mission High", dealId: "d-9", value: 5700, units: 6, boardSize: "65\"", pipeline: "boards", status: "sent", sentAt: "22 May", ownerId: "u-rk" },
  { id: "q-6", schoolId: 5, schoolName: "Eastvale Senior School", dealId: "d-10", value: 6400, units: 1, pipeline: "sports", status: "sent", sentAt: "8 Jul", ownerId: "u-ec" },
  // converted
  { id: "q-7", schoolId: 2, schoolName: "Northgate Academy", dealId: "d-2", value: 22500, units: 10, boardSize: "75\"", pipeline: "boards", status: "won", sentAt: "30 May", ownerId: "u-ec" },
  { id: "q-8", schoolId: null, schoolName: "Kingsmead Prep", value: 12300, units: 5, boardSize: "86\"", pipeline: "boards", status: "won", sentAt: "12 May", ownerId: "u-ec" },
  { id: "q-9", schoolId: null, schoolName: "Sunridge College", value: 15600, units: 7, boardSize: "65\"", pipeline: "boards", status: "won", sentAt: "2 May", ownerId: "u-tc" },
  // lost
  { id: "q-10", schoolId: null, schoolName: "Cranborne High", value: 8800, units: 4, boardSize: "65\"", pipeline: "boards", status: "lost", sentAt: "20 Apr", ownerId: "u-tc" },
  { id: "q-11", schoolId: null, schoolName: "Umtali Girls College", value: 6200, units: 3, boardSize: "65\"", pipeline: "boards", status: "lost", sentAt: "28 Apr", ownerId: "u-rk" },
];

/* ---------------- orders — the "what we've sold" record (§2) ---------------- */

export interface Order {
  id: string;
  schoolId: number | null;
  schoolName: string;
  product: Product;
  boardSize?: BoardSize;
  units: number;
  value: number;
  soldAt: string;
  period: "month" | "quarter" | "year";
  ownerId: string;
}

export const ORDERS: Order[] = [
  { id: "o-1", schoolId: 2, schoolName: "Northgate Academy", product: "Smart Boards", boardSize: "75\"", units: 10, value: 22500, soldAt: "Jul", period: "month", ownerId: "u-ec" },
  { id: "o-2", schoolId: null, schoolName: "Kingsmead Prep", product: "Smart Boards", boardSize: "86\"", units: 5, value: 12300, soldAt: "Jun", period: "quarter", ownerId: "u-ec" },
  { id: "o-3", schoolId: null, schoolName: "Sunridge College", product: "Smart Boards", boardSize: "65\"", units: 7, value: 15600, soldAt: "May", period: "quarter", ownerId: "u-tc" },
  { id: "o-4", schoolId: null, schoolName: "Sunridge College", product: "Sports Equipment", units: 1, value: 6700, soldAt: "May", period: "quarter", ownerId: "u-tc" },
  { id: "o-5", schoolId: null, schoolName: "The Lookeron School", product: "Smart Boards", boardSize: "75\"", units: 3, value: 6700, soldAt: "Feb", period: "year", ownerId: "u-ec" },
  { id: "o-6", schoolId: null, schoolName: "Prince Edward School", product: "Sports Equipment", units: 1, value: 3100, soldAt: "Jun", period: "quarter", ownerId: "u-rk" },
];

/* ---------------- audit trail (§3) ---------------- */

export interface AuditEntry {
  id: string;
  dealId: string;
  action: string;
  actorId: string;
  at: string;
}

export const AUDIT: AuditEntry[] = [
  { id: "a-1", dealId: "d-1", action: "Lead logged", actorId: "u-ec", at: "12 Jun 09:14" },
  { id: "a-2", dealId: "d-1", action: "Assigned to Emilia Chisango", actorId: "u-ec", at: "12 Jun 09:14" },
  { id: "a-3", dealId: "d-1", action: "Enquiry → Quotation Sent", actorId: "u-ec", at: "14 Jun 11:32" },
  { id: "a-4", dealId: "d-1", action: "Quotation Sent → Awaiting Response", actorId: "u-ec", at: "18 Jun 08:05" },
  { id: "a-5", dealId: "d-3", action: "Lead logged", actorId: "u-ec", at: "3 Jul 16:41" },
  { id: "a-6", dealId: "d-3", action: "Assigned to Tino Chisango", actorId: "u-ec", at: "3 Jul 16:42" },
  { id: "a-7", dealId: "d-8", action: "Lead logged", actorId: "u-gb", at: "5 Jun 10:22" },
  { id: "a-8", dealId: "d-8", action: "Quotation Sent → Awaiting Term", actorId: "u-gb", at: "10 Jun 09:55" },
  { id: "a-9", dealId: "d-9", action: "Reassigned Tino Chisango → Rudo Kanjanda", actorId: "u-ec", at: "12 Jun 14:03" },
];

export const auditForDeal = (dealId: string): AuditEntry[] => AUDIT.filter((a) => a.dealId === dealId);

/* ---------------- schools ---------------- */

export interface WhatsAppMessage {
  dir: MessageDirection;
  text: string;
  time: string;
}

export interface School {
  id: number;
  name: string;
  type: SchoolType;
  region: string;
  enrol: number;
  fit: number;
  signal: string;
  eng: EngineStage;
  product: Product;
  head: string;
  headRole: string;
  bursar: string;
  bursarRole: string;
  phone: string;
  following: boolean;
  wa: WhatsAppMessage[];
  next: string;
}

export const SCHOOLS: School[] = [
  {
    id: 1, name: "Greendale Group of Schools", type: "Group", region: "Greendale, Harare", enrol: 2100, fit: 96,
    signal: "Multi-campus; central procurement; board budget confirmed for classroom tech.", eng: "In pipeline",
    product: "Smart Boards", head: "Mrs. R. Moyo", headRole: "Group Head", bursar: "Mr. T. Nyathi", bursarRole: "Group Bursar",
    phone: "263772104412", following: true,
    wa: [
      { dir: "in", text: "Afternoon — we received your note about the interactive boards for our campuses.", time: "Mon 14:02" },
      { dir: "out", text: "Wonderful. We run the same boards at The Lookeron School — happy to bring one to demo for the board.", time: "Mon 14:20" },
      { dir: "in", text: "Please send the quote for 14 units, we table it at the finance committee Thursday.", time: "Tue 09:41" },
    ],
    next: "Follow up on Thursday finance-committee decision. Attach the sports-equipment catalogue — this group refreshes kit annually.",
  },
  {
    id: 2, name: "Northgate Academy", type: "Private", region: "Borrowdale, Harare", enrol: 760, fit: 91,
    signal: "Premium catchment; early tech adopter; parents fund upgrades.", eng: "In pipeline",
    product: "Both", head: "Dr. S. Chikowore", headRole: "Head", bursar: "Ms. L. Dube", bursarRole: "Bursar",
    phone: "263772208833", following: true,
    wa: [
      { dir: "in", text: "The demo went well. We're moving to procurement — what's the lead time on 10 boards?", time: "Wed 10:15" },
      { dir: "out", text: "Three weeks from PO. We can install and train your staff, same as we did at Lookeron.", time: "Wed 10:32" },
      { dir: "in", text: "PO signed and sent to your email this morning.", time: "Thu 08:47" },
    ],
    next: "Book install + teacher-training dates now the PO is in.",
  },
  {
    id: 3, name: "Highfield Trust College", type: "Trust", region: "Mount Pleasant, Harare", enrol: 1240, fit: 94,
    signal: "Recently upgraded ICT labs; active interest in classroom tech.", eng: "In pipeline",
    product: "Both", head: "Mrs. P. Sibanda", headRole: "Head", bursar: "Mr. K. Marufu", bursarRole: "Bursar",
    phone: "263773310290", following: true,
    wa: [
      { dir: "in", text: "Good afternoon, this is Highfield. We saw your message about the interactive boards.", time: "Thu 15:12" },
      { dir: "out", text: "We've installed the same boards at The Lookeron School — could we bring one to demo next week?", time: "Thu 15:30" },
      { dir: "in", text: "The committee liked it. Please quote 8 boards for the two labs.", time: "Wed 12:02" },
    ],
    next: "Send the 8-unit quote for the two labs. Bundle the sports-equipment catalogue into the follow-up.",
  },
  {
    id: 4, name: "Mount Pleasant Prep", type: "Private", region: "Mount Pleasant, Harare", enrol: 520, fit: 83,
    signal: "Affluent catchment; parents fund upgrades via the PTA.", eng: "In pipeline",
    product: "Both", head: "Mr. A. Gwenzi", headRole: "Head", bursar: "Mrs. F. Ncube", bursarRole: "Bursar",
    phone: "263774451178", following: true,
    wa: [
      { dir: "in", text: "Could you demo the boards at our next PTA meeting?", time: "Fri 08:44" },
      { dir: "out", text: "Happy to. We'll set one up in a classroom, same as our Lookeron install.", time: "Fri 09:01" },
    ],
    next: "Prepare PTA demo. Lead with the Lookeron reference — parents trust a working example.",
  },
  {
    id: 5, name: "Eastvale Senior School", type: "Trust", region: "Marlborough, Harare", enrol: 950, fit: 86,
    signal: "Strong sports programme; equipment refresh due this term.", eng: "In pipeline",
    product: "Sports Equipment", head: "Mr. B. Chuma", headRole: "Head", bursar: "Ms. R. Phiri", bursarRole: "Bursar",
    phone: "263775582901", following: true,
    wa: [
      { dir: "in", text: "We need to refresh our gym and field equipment before the sports season.", time: "Mon 11:20" },
      { dir: "out", text: "We can supply the full list — and show you the smart boards while we're on site.", time: "Mon 11:47" },
    ],
    next: "Quote the equipment refresh. Introduce smart boards on the same visit — one buyer, two products.",
  },
  {
    id: 6, name: "Marlborough Junior Academy", type: "Private", region: "Marlborough, Harare", enrol: 640, fit: 88,
    signal: "Fee-paying, growing enrolment; STEM positioning.", eng: "Replied",
    product: "Both", head: "Mrs. J. Mutasa", headRole: "Head", bursar: "Mr. D. Zhou", bursarRole: "Bursar",
    phone: "263776623404", following: true,
    wa: [
      { dir: "in", text: "Interested — what does a board cost installed?", time: "Tue 13:08" },
      { dir: "out", text: "Depends on size; let me send options. We can also demo at Lookeron any afternoon.", time: "Tue 13:26" },
      { dir: "in", text: "Friday afternoon works — we'll come to Lookeron at 2pm.", time: "Tue 14:01" },
    ],
    next: "Send sizing + pricing options before the Friday Lookeron visit.",
  },
  {
    id: 7, name: "Riverside Day School", type: "Private", region: "Avondale, Harare", enrol: 690, fit: 90,
    signal: "Established; strong alumni funding for facilities.", eng: "Replied",
    product: "Smart Boards", head: "Dr. M. Kadenge", headRole: "Head", bursar: "Ms. T. Banda", bursarRole: "Bursar",
    phone: "263777740516", following: false,
    wa: [
      { dir: "in", text: "Please share a proposal for our two senior classrooms.", time: "Wed 09:15" },
      { dir: "out", text: "On its way. We'll include the Lookeron case study and install timeline.", time: "Wed 09:40" },
    ],
    next: "Proposal sent — follow up mid-week if no reply.",
  },
  {
    id: 8, name: "Matobo Trust School", type: "Trust", region: "Bulawayo", enrol: 1500, fit: 79,
    signal: "Regional leader; sports programme expanding.", eng: "Contacted",
    product: "Sports Equipment", head: "Mr. S. Ndlovu", headRole: "Head", bursar: "Mrs. G. Sithole", bursarRole: "Bursar",
    phone: "263778851623", following: false,
    wa: [
      { dir: "out", text: "Following up on the equipment list for your expanding sports programme — quote attached.", time: "Thu 10:00" },
    ],
    next: "Follow up on the equipment quote; gauge appetite for boards on a later visit.",
  },
  {
    id: 9, name: "Avondale Christian College", type: "Mission", region: "Avondale, Harare", enrol: 870, fit: 74,
    signal: "Church-backed; cautious budget; grant cycle opens Q3.", eng: "Contacted", product: "Smart Boards",
    head: "Rev. P. Chirwa", headRole: "Head", bursar: "Mr. E. Moyo", bursarRole: "Bursar",
    phone: "263779960737", following: false,
    wa: [{ dir: "out", text: "Sharing a proposal you could put to your Q3 grant committee.", time: "Fri 14:22" }],
    next: "Time the follow-up to the Q3 grant cycle.",
  },
  {
    id: 10, name: "Hillcrest Academy", type: "Private", region: "Bulawayo", enrol: 610, fit: 82,
    signal: "Growing; new science block under construction.", eng: "In pipeline", product: "Smart Boards",
    head: "Mrs. N. Khumalo", headRole: "Head", bursar: "Mr. J. Ncube", bursarRole: "Bursar",
    phone: "263771079841", following: false,
    wa: [{ dir: "in", text: "Lovely demo. Budget only unlocks when the new term starts — talk then?", time: "10 Jun" }],
    next: "Re-engage as third term approaches — science block opening is the hook.",
  },
  {
    id: 11, name: "St. Aidan's Mission High", type: "Mission", region: "Mutare", enrol: 980, fit: 71,
    signal: "Donor-funded; grant cycle opens Q3.", eng: "In pipeline", product: "Smart Boards",
    head: "Sr. M. Chidziva", headRole: "Head", bursar: "Mr. L. Tapfuma", bursarRole: "Bursar",
    phone: "263772188952", following: false,
    wa: [{ dir: "out", text: "Quote attached for 6 boards as discussed with the bursar.", time: "22 May" }],
    next: "Quoted 21 days ago with no reply — gentle nudge due.",
  },
  {
    id: 12, name: "Gweru Central High", type: "Government", region: "Gweru", enrol: 1800, fit: 58,
    signal: "Public; procurement runs through the ministry — slow but high volume.", eng: "Discovered", product: "Smart Boards",
    head: "Mr. C. Mpofu", headRole: "Head", bursar: "—", bursarRole: "",
    phone: "263773297063", following: false,
    wa: [], next: "Lower priority — long procurement. Revisit if a ministry framework opens.",
  },
];

export const ENGINE_STAGES: EngineStage[] = ["Discovered", "Scored", "Contacted", "Replied", "In pipeline"];

export const FUNNEL = [
  { stage: "Discovered", count: 342 },
  { stage: "Scored", count: 210 },
  { stage: "Contacted", count: 96 },
  { stage: "Replied", count: 34 },
  { stage: "In pipeline", count: 14 },
];

/* ---------------- suggestions (§7: dual trigger, Gate 2) ---------------- */

export type SuggestionType = "Stage change" | "Task done" | "New task" | "Follow-up";
export type SuggestionTrigger = "conversation" | "time_in_pipeline";

export interface Suggestion {
  id: string;
  schoolId: number;
  dealId?: string;
  type: SuggestionType;
  trigger: SuggestionTrigger;
  proposal: string;
  rationale: string;
  sourceSnippet?: string;
  suggestedWording?: string;
  toStage?: DealStage;
  assignedTo: string;
  status: "pending" | "accepted" | "dismissed";
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: "sg-1", schoolId: 1, dealId: "d-1", type: "Stage change", trigger: "conversation",
    proposal: "Move Greendale Group to Awaiting Funds",
    rationale: "The finance committee approved the 14-unit quote; they're processing the PO — funds in motion.",
    sourceSnippet: "…the committee approved the quote on Thursday. Awaiting PO number.",
    toStage: "Awaiting Funds", assignedTo: "u-ec", status: "pending",
  },
  {
    id: "sg-2", schoolId: 1, type: "New task", trigger: "conversation",
    proposal: "Send sports-equipment catalogue to Mr. Nyathi",
    rationale: "The bursar asked about annual kit refresh in the same thread — cross-sell window is open.",
    sourceSnippet: "…do you also supply sports kit? We refresh annually.",
    assignedTo: "u-ec", status: "pending",
  },
  {
    id: "sg-3", schoolId: 2, type: "Task done", trigger: "conversation",
    proposal: "Mark \"Chase signed PO\" as done",
    rationale: "Northgate confirmed the head signed the PO this morning.",
    sourceSnippet: "PO signed and sent to your email this morning.",
    assignedTo: "u-ec", status: "pending",
  },
  {
    id: "sg-4", schoolId: 2, type: "New task", trigger: "conversation",
    proposal: "Book install + teacher training for Northgate",
    rationale: "With the PO in, the thread asks for install dates within three weeks.",
    sourceSnippet: "…what dates work for installation and staff training?",
    assignedTo: "u-ec", status: "pending",
  },
  {
    id: "sg-5", schoolId: 3, dealId: "d-3", type: "Stage change", trigger: "conversation",
    proposal: "Move Highfield Trust College to Quotation Sent",
    rationale: "The ICT-committee demo happened and they asked for a formal quote for 8 units — send it and mark it.",
    sourceSnippet: "The committee liked it. Please quote 8 boards for the two labs.",
    toStage: "Quotation Sent", assignedTo: "u-tc", status: "pending",
  },
  {
    id: "sg-6", schoolId: 5, type: "New task", trigger: "conversation",
    proposal: "Add smart-board demo to Eastvale site visit",
    rationale: "The head mentioned classroom tech budget while discussing the equipment refresh.",
    sourceSnippet: "…while you're here, our ICT teacher wants to see those boards.",
    assignedTo: "u-ec", status: "pending",
  },
  {
    id: "sg-7", schoolId: 6, type: "New task", trigger: "conversation",
    proposal: "Book Marlborough Junior's Lookeron visit — Friday 2pm",
    rationale: "They accepted the site-visit offer for Friday afternoon; get it in the diary with a reminder.",
    sourceSnippet: "Friday afternoon works — we'll come to Lookeron at 2pm.",
    assignedTo: "u-tc", status: "pending",
  },
  {
    id: "sg-8", schoolId: 6, type: "New task", trigger: "conversation",
    proposal: "Prepare sizing + pricing options for Marlborough Junior",
    rationale: "They asked for installed cost across three classroom sizes before the visit.",
    sourceSnippet: "…send prices for the three classroom sizes before Friday please.",
    assignedTo: "u-tc", status: "pending",
  },
  // Time-in-pipeline driven (§7) — with suggested wording
  {
    id: "sg-9", schoolId: 10, dealId: "d-8", type: "Follow-up", trigger: "time_in_pipeline",
    proposal: "Third term is 3 weeks away — re-open Hillcrest (Awaiting Term)",
    rationale: "Hillcrest has waited in Awaiting Term for 6 weeks; their trigger (new term + science block) is now imminent.",
    suggestedWording: "Good morning Mrs. Khumalo — third term is around the corner and I remember the new science block opens soon. Shall we pencil in installation before classes start, so the labs open with the boards in?",
    assignedTo: "u-gb", status: "pending",
  },
  {
    id: "sg-10", schoolId: 11, dealId: "d-9", type: "Follow-up", trigger: "time_in_pipeline",
    proposal: "St. Aidan's quote is 21 days unanswered — send a nudge",
    rationale: "No Response for three weeks. A short, warm check-in beats letting it go cold past a month.",
    suggestedWording: "Good day Mr. Tapfuma — just checking the smart-board quote reached you well. Happy to adjust sizes or phase the order to fit the donor cycle if that helps.",
    assignedTo: "u-rk", status: "pending",
  },
];

/* ---------------- tasks & reminders (§5) ---------------- */

export type TaskKind = "followup" | "meeting" | "call" | "whatsapp" | "other";

export interface Task {
  id: string;
  schoolId: number | null;
  title: string;
  kind: TaskKind;
  due: string;
  remind?: string;
  assignedTo: string;
  done: boolean;
}

export const TASKS: Task[] = [
  { id: "tk-1", schoolId: 1, title: "Follow up on Greendale finance-committee decision", kind: "followup", due: "Today", remind: "1d before", assignedTo: "u-ec", done: false },
  { id: "tk-2", schoolId: 2, title: "Confirm Northgate install + training dates", kind: "meeting", due: "Tomorrow", remind: "1d before", assignedTo: "u-ec", done: false },
  { id: "tk-3", schoolId: 3, title: "Send Highfield quote — 8 units, two labs", kind: "followup", due: "Wed", remind: "1d before", assignedTo: "u-tc", done: false },
  { id: "tk-4", schoolId: 5, title: "Quote Eastvale equipment refresh", kind: "followup", due: "Thu", assignedTo: "u-ec", done: false },
  { id: "tk-5", schoolId: 4, title: "Prepare Mount Pleasant PTA demo kit", kind: "meeting", due: "Fri", remind: "1d before", assignedTo: "u-tc", done: false },
  { id: "tk-6", schoolId: 7, title: "Send Riverside proposal with Lookeron case study", kind: "whatsapp", due: "Done", assignedTo: "u-tc", done: true },
];

/* ---------------- demos ---------------- */

export interface Demo {
  id: string;
  schoolId: number;
  title: string;
  date: string;
  time: string;
  attendees: string[];
}

export const DEMOS: Demo[] = [
  { id: "dm-1", schoolId: 3, title: "ICT-committee demo · Highfield Trust College", date: "Tue 21 Jul", time: "10:00", attendees: ["PS", "KM", "EC"] },
  { id: "dm-2", schoolId: 4, title: "PTA-meeting demo · Mount Pleasant Prep", date: "Fri 24 Jul", time: "17:30", attendees: ["AG", "FN", "TC"] },
  { id: "dm-3", schoolId: 6, title: "Lookeron site visit · Marlborough Junior", date: "Fri 24 Jul", time: "14:00", attendees: ["JM", "EC"] },
  { id: "dm-4", schoolId: 5, title: "On-site equipment walkthrough · Eastvale", date: "Mon 27 Jul", time: "09:00", attendees: ["BC", "EC"] },
];

/* ---------------- KPI helpers ---------------- */

export const KPIS = {
  leadsThisMonth: 28,
  leadsDelta: "+27%",
  demosBooked: 5,
  demosTarget: 8,
  pipelineDelta: "+18%",
};

export const money = (n: number): string => "$" + n.toLocaleString();

export const schoolById = (id: number): School | undefined => SCHOOLS.find((s) => s.id === id);

export const initialsOf = (name: string): string =>
  name
    .replace(/^(Mrs?|Ms|Dr|Rev|Sr)\.\s*/i, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** wa.me deep link with prefilled text — the human sends; the system never does (§10). */
export const waLink = (phone: string, text?: string): string =>
  `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
