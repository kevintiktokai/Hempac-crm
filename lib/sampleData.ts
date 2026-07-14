/**
 * Sample dataset for the Hempac Sales Engine prototype.
 * Ported from hempac-sales-engine-demo.tsx (12 Zimbabwe schools) and
 * extended with suggestions, tasks and demos per DESIGN-BUILD-HANDOFF §5.
 * Phase A only — replaced by Convex in Phase B.
 */

export type SchoolType = "Group" | "Private" | "Trust" | "Mission" | "Government";
export type EngineStage = "Discovered" | "Scored" | "Contacted" | "Replied" | "In pipeline";
export type DealStage = "New Enquiry" | "Demo Booked" | "Quote Sent" | "Procurement" | "Won" | "Lost";
export type Product = "Smart Boards" | "Sports Equipment" | "Both";
export type MessageDirection = "in" | "out";

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
  units: number;
  value: number;
  stage: DealStage | "";
  owner: string;
  following: boolean;
  wa: WhatsAppMessage[];
  next: string;
}

export type SuggestionType = "Stage change" | "Task done" | "New task";

export interface Suggestion {
  id: string;
  schoolId: number;
  type: SuggestionType;
  proposal: string;
  rationale: string;
  sourceSnippet: string;
  status: "pending" | "accepted" | "dismissed";
}

export interface Task {
  id: string;
  schoolId: number | null;
  title: string;
  due: string;
  done: boolean;
}

export interface Demo {
  id: string;
  schoolId: number;
  title: string;
  date: string;
  time: string;
  attendees: string[];
}

const t = (s: string): string => s;

export const SCHOOLS: School[] = [
  {
    id: 1, name: "Greendale Group of Schools", type: "Group", region: "Greendale, Harare", enrol: 2100, fit: 96,
    signal: "Multi-campus; central procurement; board budget confirmed for classroom tech.", eng: "In pipeline",
    product: "Smart Boards", head: "Mrs. R. Moyo", headRole: "Group Head", bursar: "Mr. T. Nyathi", bursarRole: "Group Bursar",
    units: 14, value: 32000, stage: "Quote Sent", owner: "EC", following: true,
    wa: [
      { dir: "in", text: t("Afternoon — we received your note about the interactive boards for our campuses."), time: "Mon 14:02" },
      { dir: "out", text: t("Wonderful. We run the same boards at The Lookeron School — happy to bring one to demo for the board."), time: "Mon 14:20" },
      { dir: "in", text: t("Please send the quote for 14 units, we table it at the finance committee Thursday."), time: "Tue 09:41" },
    ],
    next: "Follow up on Thursday finance-committee decision. Attach the sports-equipment catalogue — this group refreshes kit annually.",
  },
  {
    id: 2, name: "Northgate Academy", type: "Private", region: "Borrowdale, Harare", enrol: 760, fit: 91,
    signal: "Premium catchment; early tech adopter; parents fund upgrades.", eng: "In pipeline",
    product: "Both", head: "Dr. S. Chikowore", headRole: "Head", bursar: "Ms. L. Dube", bursarRole: "Bursar",
    units: 10, value: 22500, stage: "Procurement", owner: "EC", following: true,
    wa: [
      { dir: "in", text: t("The demo went well. We're moving to procurement — what's the lead time on 10 boards?"), time: "Wed 10:15" },
      { dir: "out", text: t("Three weeks from PO. We can install and train your staff, same as we did at Lookeron."), time: "Wed 10:32" },
      { dir: "in", text: t("Good. Sending the PO once the head signs off."), time: "Wed 11:05" },
    ],
    next: "Chase signed PO from the Head. Confirm install + teacher-training dates.",
  },
  {
    id: 3, name: "Highfield Trust College", type: "Trust", region: "Mount Pleasant, Harare", enrol: 1240, fit: 94,
    signal: "Recently upgraded ICT labs; active interest in classroom tech.", eng: "In pipeline",
    product: "Both", head: "Mrs. P. Sibanda", headRole: "Head", bursar: "Mr. K. Marufu", bursarRole: "Bursar",
    units: 8, value: 18400, stage: "Demo Booked", owner: "TC", following: true,
    wa: [
      { dir: "in", text: t("Good afternoon, this is Highfield. We saw your message about the interactive boards."), time: "Thu 15:12" },
      { dir: "out", text: t("We've installed the same boards at The Lookeron School — could we bring one to demo next week?"), time: "Thu 15:30" },
      { dir: "in", text: t("Yes please. Tuesday works for our ICT committee."), time: "Thu 16:02" },
    ],
    next: "Confirm Tuesday demo with the ICT committee. Bundle the sports-equipment catalogue into the follow-up.",
  },
  {
    id: 4, name: "Mount Pleasant Prep", type: "Private", region: "Mount Pleasant, Harare", enrol: 520, fit: 83,
    signal: "Affluent catchment; parents fund upgrades via the PTA.", eng: "In pipeline",
    product: "Both", head: "Mr. A. Gwenzi", headRole: "Head", bursar: "Mrs. F. Ncube", bursarRole: "Bursar",
    units: 4, value: 9800, stage: "Demo Booked", owner: "TC", following: true,
    wa: [
      { dir: "in", text: t("Could you demo the boards at our next PTA meeting?"), time: "Fri 08:44" },
      { dir: "out", text: t("Happy to. We'll set one up in a classroom, same as our Lookeron install."), time: "Fri 09:01" },
    ],
    next: "Prepare PTA demo. Lead with the Lookeron reference — parents trust a working example.",
  },
  {
    id: 5, name: "Eastvale Senior School", type: "Trust", region: "Marlborough, Harare", enrol: 950, fit: 86,
    signal: "Strong sports programme; equipment refresh due this term.", eng: "In pipeline",
    product: "Sports Equipment", head: "Mr. B. Chuma", headRole: "Head", bursar: "Ms. R. Phiri", bursarRole: "Bursar",
    units: 1, value: 6400, stage: "Demo Booked", owner: "EC", following: true,
    wa: [
      { dir: "in", text: t("We need to refresh our gym and field equipment before the sports season."), time: "Mon 11:20" },
      { dir: "out", text: t("We can supply the full list — and show you the smart boards while we're on site."), time: "Mon 11:47" },
    ],
    next: "Quote the equipment refresh. Introduce smart boards on the same visit — one buyer, two products.",
  },
  {
    id: 6, name: "Marlborough Junior Academy", type: "Private", region: "Marlborough, Harare", enrol: 640, fit: 88,
    signal: "Fee-paying, growing enrolment; STEM positioning.", eng: "Replied",
    product: "Both", head: "Mrs. J. Mutasa", headRole: "Head", bursar: "Mr. D. Zhou", bursarRole: "Bursar",
    units: 5, value: 7200, stage: "New Enquiry", owner: "TC", following: true,
    wa: [
      { dir: "in", text: t("Interested — what does a board cost installed?"), time: "Tue 13:08" },
      { dir: "out", text: t("Depends on size; let me send options. We can also demo at Lookeron any afternoon."), time: "Tue 13:26" },
    ],
    next: "Send sizing + pricing options. Offer a Lookeron site visit to convert interest to a demo.",
  },
  {
    id: 7, name: "Riverside Day School", type: "Private", region: "Avondale, Harare", enrol: 690, fit: 90,
    signal: "Established; strong alumni funding for facilities.", eng: "Replied",
    product: "Smart Boards", head: "Dr. M. Kadenge", headRole: "Head", bursar: "Ms. T. Banda", bursarRole: "Bursar",
    units: 6, value: 5600, stage: "New Enquiry", owner: "EC", following: false,
    wa: [
      { dir: "in", text: t("Please share a proposal for our two senior classrooms."), time: "Wed 09:15" },
      { dir: "out", text: t("On its way. We'll include the Lookeron case study and install timeline."), time: "Wed 09:40" },
    ],
    next: "Send proposal for 2 classrooms with the Lookeron case study attached.",
  },
  {
    id: 8, name: "Matobo Trust School", type: "Trust", region: "Bulawayo", enrol: 1500, fit: 79,
    signal: "Regional leader; sports programme expanding.", eng: "Contacted",
    product: "Sports Equipment", head: "Mr. S. Ndlovu", headRole: "Head", bursar: "Mrs. G. Sithole", bursarRole: "Bursar",
    units: 1, value: 4900, stage: "Quote Sent", owner: "TC", following: false,
    wa: [
      { dir: "out", text: t("Following up on the equipment list for your expanding sports programme — quote attached."), time: "Thu 10:00" },
    ],
    next: "Follow up on the equipment quote; gauge appetite for boards on a later visit.",
  },
  {
    id: 9, name: "Avondale Christian College", type: "Mission", region: "Avondale, Harare", enrol: 870, fit: 74,
    signal: "Church-backed; cautious budget; grant cycle opens Q3.", eng: "Contacted", product: "Smart Boards",
    head: "Rev. P. Chirwa", headRole: "Head", bursar: "Mr. E. Moyo", bursarRole: "Bursar",
    units: 0, value: 0, stage: "", owner: "", following: false,
    wa: [{ dir: "out", text: t("Sharing a proposal you could put to your Q3 grant committee."), time: "Fri 14:22" }],
    next: "Time the follow-up to the Q3 grant cycle.",
  },
  {
    id: 10, name: "Hillcrest Academy", type: "Private", region: "Bulawayo", enrol: 610, fit: 82,
    signal: "Growing; new science block under construction.", eng: "Scored", product: "Smart Boards",
    head: "Mrs. N. Khumalo", headRole: "Head", bursar: "Mr. J. Ncube", bursarRole: "Bursar",
    units: 0, value: 0, stage: "", owner: "", following: false,
    wa: [], next: "Queue WhatsApp outreach — time it to the new science-block opening.",
  },
  {
    id: 11, name: "St. Aidan's Mission High", type: "Mission", region: "Mutare", enrol: 980, fit: 71,
    signal: "Donor-funded; grant cycle opens Q3.", eng: "Scored", product: "Smart Boards",
    head: "Sr. M. Chidziva", headRole: "Head", bursar: "Mr. L. Tapfuma", bursarRole: "Bursar",
    units: 0, value: 0, stage: "", owner: "", following: false,
    wa: [], next: "Queue outreach aligned to the donor grant cycle.",
  },
  {
    id: 12, name: "Gweru Central High", type: "Government", region: "Gweru", enrol: 1800, fit: 58,
    signal: "Public; procurement runs through the ministry — slow but high volume.", eng: "Discovered", product: "Smart Boards",
    head: "Mr. C. Mpofu", headRole: "Head", bursar: "—", bursarRole: "",
    units: 0, value: 0, stage: "", owner: "", following: false,
    wa: [], next: "Lower priority — long procurement. Revisit if a ministry framework opens.",
  },
];

export const PIPELINE_STAGES: DealStage[] = ["New Enquiry", "Demo Booked", "Quote Sent", "Procurement", "Won"];
export const ENGINE_STAGES: EngineStage[] = ["Discovered", "Scored", "Contacted", "Replied", "In pipeline"];

export const WON_DEALS = [
  { name: "Kingsmead Prep", product: "Smart Boards" as Product, units: 5, value: 12300, owner: "EC" },
  { name: "Sunridge College", product: "Both" as Product, units: 7, value: 15600, owner: "TC" },
];

export const FUNNEL = [
  { stage: "Discovered", count: 342 },
  { stage: "Scored", count: 210 },
  { stage: "Contacted", count: 96 },
  { stage: "Replied", count: 34 },
  { stage: "In pipeline", count: 14 },
];

/** 8 pending suggestions across 5 schools (handoff §5). */
export const SUGGESTIONS: Suggestion[] = [
  {
    id: "sg-1", schoolId: 1, type: "Stage change",
    proposal: "Move Greendale Group to Procurement",
    rationale: "The finance committee approved the 14-unit quote — this reads like a buying decision.",
    sourceSnippet: "…the committee approved the quote on Thursday. Awaiting PO number.",
    status: "pending",
  },
  {
    id: "sg-2", schoolId: 1, type: "New task",
    proposal: "Send sports-equipment catalogue to Mr. Nyathi",
    rationale: "The bursar asked about annual kit refresh in the same thread — cross-sell window is open.",
    sourceSnippet: "…do you also supply sports kit? We refresh annually.",
    status: "pending",
  },
  {
    id: "sg-3", schoolId: 2, type: "Task done",
    proposal: "Mark \"Chase signed PO\" as done",
    rationale: "Northgate confirmed the head signed the PO this morning.",
    sourceSnippet: "PO signed and sent to your email this morning.",
    status: "pending",
  },
  {
    id: "sg-4", schoolId: 2, type: "New task",
    proposal: "Book install + teacher training for Northgate",
    rationale: "With the PO in, the thread asks for install dates within three weeks.",
    sourceSnippet: "…what dates work for installation and staff training?",
    status: "pending",
  },
  {
    id: "sg-5", schoolId: 3, type: "Stage change",
    proposal: "Move Highfield Trust College to Quote Sent",
    rationale: "The ICT-committee demo happened Tuesday and they asked for a formal quote for 8 units.",
    sourceSnippet: "The committee liked it. Please quote 8 boards for the two labs.",
    status: "pending",
  },
  {
    id: "sg-6", schoolId: 5, type: "New task",
    proposal: "Add smart-board demo to Eastvale site visit",
    rationale: "The head mentioned classroom tech budget while discussing the equipment refresh.",
    sourceSnippet: "…while you're here, our ICT teacher wants to see those boards.",
    status: "pending",
  },
  {
    id: "sg-7", schoolId: 6, type: "Stage change",
    proposal: "Move Marlborough Junior to Demo Booked",
    rationale: "They accepted the Lookeron site-visit offer for Friday afternoon.",
    sourceSnippet: "Friday afternoon works — we'll come to Lookeron at 2pm.",
    status: "pending",
  },
  {
    id: "sg-8", schoolId: 6, type: "New task",
    proposal: "Prepare sizing + pricing options for Marlborough Junior",
    rationale: "They asked for installed cost across three classroom sizes before the visit.",
    sourceSnippet: "…send prices for the three classroom sizes before Friday please.",
    status: "pending",
  },
];

export const TASKS: Task[] = [
  { id: "tk-1", schoolId: 1, title: "Follow up on Greendale finance-committee decision", due: "Today", done: false },
  { id: "tk-2", schoolId: 2, title: "Confirm Northgate install + training dates", due: "Tomorrow", done: false },
  { id: "tk-3", schoolId: 3, title: "Send Highfield quote — 8 units, two labs", due: "Wed", done: false },
  { id: "tk-4", schoolId: 5, title: "Quote Eastvale equipment refresh", due: "Thu", done: false },
  { id: "tk-5", schoolId: 4, title: "Prepare Mount Pleasant PTA demo kit", due: "Fri", done: false },
  { id: "tk-6", schoolId: 7, title: "Send Riverside proposal with Lookeron case study", due: "Done", done: true },
];

export const DEMOS: Demo[] = [
  { id: "dm-1", schoolId: 3, title: "ICT-committee demo · Highfield Trust College", date: "Tue 21 Jul", time: "10:00", attendees: ["PS", "KM", "EC"] },
  { id: "dm-2", schoolId: 4, title: "PTA-meeting demo · Mount Pleasant Prep", date: "Fri 24 Jul", time: "17:30", attendees: ["AG", "FN", "TC"] },
  { id: "dm-3", schoolId: 6, title: "Lookeron site visit · Marlborough Junior", date: "Fri 24 Jul", time: "14:00", attendees: ["JM", "EC"] },
  { id: "dm-4", schoolId: 5, title: "On-site equipment walkthrough · Eastvale", date: "Mon 27 Jul", time: "09:00", attendees: ["BC", "EC"] },
];

export const KPIS = {
  pipelineValue: 106800,
  leadsThisMonth: 28,
  leadsDelta: "+27%",
  activeDeals: 14,
  demosBooked: 5,
  demosTarget: 8,
  wonThisQuarter: 41200,
  pipelineDelta: "+18%",
};

export const CURRENT_USER = { name: "Emilia", fullName: "Emilia Chisango", role: "Founder & CEO", initials: "EC" };

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
