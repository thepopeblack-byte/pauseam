export type BankKind = "email" | "phone" | "ussd" | "contact" | "email-ussd" | "phone-ussd" | "all";
const requestedFacts: Record<BankKind, readonly ("email" | "phone" | "ussd")[]> = {
  email: ["email"], phone: ["phone"], ussd: ["ussd"], contact: ["email", "phone"],
  "email-ussd": ["email", "ussd"], "phone-ussd": ["phone", "ussd"], all: ["email", "phone", "ussd"],
};
export function bankQuestion(bank: string, kind: BankKind): string {
  const labels = { email: "customer-care email", phone: "customer-care phone number", ussd: "USSD menu code" };
  return `What are ${bank}'s ${requestedFacts[kind].map(k => labels[k]).join(" and ")}?`;
}
type Source = { url: string; title: string; checked: string; expires: string; review: string };
type Fact = { value: string; source: Source };
export type Bank = { id: string; name: string; aliases: string[]; email: Fact; phone: Fact; ussd: Fact };
export type BankInformation = { bank: string; kind: BankKind; facts: { label: string; value: string; source: Source }[] };
const source = (url: string, title: string): Source => ({ url, title, checked: "2026-10-03", expires: "2026-10-17", review: "Official published source checked by Codex; independent human review pending" });
const fact = (value: string, url: string, title: string): Fact => ({ value, source: source(url, title) });
export const BANKS: Bank[] = [
  { id: "access", name: "Access Bank", aliases: ["access bank", "accessbank", "access"],
    email: fact("contactcenter@accessbankplc.com", "https://www.accessbankplc.com/help", "Access Bank · Help"),
    phone: fact("07003000000", "https://www.accessbankplc.com/contact-us", "Access Bank · Contact Us"),
    ussd: fact("*901#", "https://www.accessbankplc.com/help", "Access Bank · Help") },
  { id: "gtbank", name: "GTBank", aliases: ["gtbank", "gt bank", "gtb", "g t b", "g t bank", "guaranty trust", "guarantee trust"],
    email: fact("gtbankmailsupport@gtbank.com", "https://www.gtbank.com/help-centre/complaints-enquiries", "GTBank · Complaints & Enquiries"),
    phone: fact("08029002900", "https://www.gtbank.com/help-centre", "GTBank · Help Centre / GTConnect"),
    ussd: fact("*737#", "https://737.gtbank.com/", "GTBank · 737") },
  { id: "uba", name: "UBA Nigeria", aliases: ["uba", "u b a", "united bank for africa"],
    email: fact("cfc@ubagroup.com", "https://www.ubagroup.com/help/contact-us/", "UBA · Contact Us"),
    phone: fact("07002255822", "https://www.ubagroup.com/help/contact-us/", "UBA · Contact Us"),
    ussd: fact("*919#", "https://www.ubagroup.com/nigeria/", "UBA Nigeria · USSD Banking") },
  { id: "zenith", name: "Zenith Bank", aliases: ["zenith bank", "zenith"],
    email: fact("zenithdirect@zenithbank.com", "https://www.digital.zenithbank.com/pdfs/annualreport2025.pdf", "Zenith Bank · 2025 Annual Report / ZenithDirect"),
    phone: fact("0201-278-7000", "https://www.digital.zenithbank.com/pdfs/annualreport2025.pdf", "Zenith Bank · 2025 Annual Report / ZenithDirect"),
    ussd: fact("*966#", "https://onlineac.zenithbank.com/", "Zenith Bank · Online Account Opening / Channels") },
  { id: "firstbank", name: "FirstBank Nigeria", aliases: ["firstbank", "first bank", "first bank of nigeria"],
    email: fact("firstcontact@firstbanknigeria.com", "https://complaints.firstbanknigeria.com/faq", "FirstBank · Complaints FAQ"),
    phone: fact("07080625000", "https://complaints.firstbanknigeria.com/faq", "FirstBank · Complaints FAQ"),
    ussd: fact("*894#", "https://www.firstbanknigeria.com/?p=31522", "FirstBank · FirstCredit / USSD menu") },
  { id: "fidelity", name: "Fidelity Bank", aliases: ["fidelity bank", "fidelity"],
    email: fact("true.serve@fidelitybank.ng", "https://www.fidelitybank.ng/information-security/", "Fidelity Bank · Information Security / Fraud Reporting"),
    phone: fact("0700 343 35489", "https://www.fidelitybank.ng/contact-us/", "Fidelity Bank · Contact Us"),
    ussd: fact("*770#", "https://fidelitybank.ng/personal-banking/personal-e-banking/my-770/", "Fidelity Bank · My 770") },
  { id: "wema", name: "Wema / ALAT", aliases: ["wema bank", "wema", "alat"],
    email: fact("purpleconnect@wemabank.com", "https://www.wemabank.com/contact-us/", "Wema Bank · Contact Us"),
    phone: fact("07000787753", "https://www.wemabank.com/contact-us/", "Wema Bank · Contact Us"),
    ussd: fact("*945#", "https://www.wemabank.com/personal/e-banking/945-2/", "Wema Bank · USSD Codes") },
  { id: "stanbic", name: "Stanbic IBTC", aliases: ["stanbic ibtc", "stanbic", "ibtc"],
    email: fact("customercarenigeria@stanbicibtc.com", "https://www.stanbicibtcbank.com/nigeriabank/personal/ways-to-bank/self-service-banking/ussd-banking", "Stanbic IBTC · USSD Banking FAQ"),
    phone: fact("0700 909 9099", "https://www.stanbicibtcbank.com/nigeriabank/personal/contact-us/contact-us-details", "Stanbic IBTC · Contact Details"),
    ussd: fact("*909#", "https://www.stanbicibtcbank.com/nigeriabank/personal/ways-to-bank/self-service-banking/ussd-banking", "Stanbic IBTC · USSD Banking") },
];
export function bankIntent(question: string): BankKind | null {
  question = question.replace(/[-‐‑‒–—]/g, " ");
  if (/\b(?:asks?|asked|requests?|requested|wants?)\b.{0,60}\b(?:pin|otp|password|banking code)\b/i.test(question)) return null;
  if (/\b(?:someone|caller|stranger|message)\b.{0,60}\b(?:asks?|asked|told|says?)\b.{0,60}\b(?:dial|ussd|code)\b/i.test(question)) return null;
  if (/\b(?:spot|avoid|recognise|recognize|protect|detect)\b/i.test(question) && /\b(?:fraud|scam|phishing|fake|secrets|otp|pin|password)\b/i.test(question)) return null;
  if (/\b(?:phishing|scam|fake|suspicious)\b/i.test(question) && /\bemail\b/i.test(question) && !/\b(?:customer|contact|address)\b/i.test(question)) return null;
  const ussd = /\b(?:ussd|short\s*code|dial(?:ling|ing)? code|transfer code|bank(?:ing)? code for)\b|\*\d{3}#/i.test(question);
  const email = /\b(?:e\s?mail|email address)\b/i.test(question);
  const care = /\b(?:customer\s*(?:care|service)|contact\s*(?:number|details)|helpline|hotline|phone\s*(?:number|line)|telephone|call centre|call center|support\s*(?:number|contact))\b/i.test(question);
  const phone = /\b(?:phone\s*(?:number|line)|telephone|helpline|hotline)\b/i.test(question)
    || ((care || email) && /\bnumber\b/i.test(question) && !/\b(?:account|card)\s+number\b/i.test(question));
  // Keep every explicitly requested fact; contact details without a named channel mean email + phone.
  const contact = care && !phone && !email;
  if (ussd) return (email && phone) || contact ? "all" : email ? "email-ussd" : phone ? "phone-ussd" : "ussd";
  if (email) return phone ? "contact" : "email";
  if (phone) return "phone";
  if (contact) return "contact";
  if (/\b(?:contact|reach|call)\b/i.test(question) && (/\b(?:my bank|the bank)\b/i.test(question) || BANKS.some(b => b.aliases.some(a => new RegExp("\\b" + a + "\\b", "i").test(question))))) return "contact";
  return null;
}
export function bankInformation(question: string, now = new Date()) {
  const kind = bankIntent(question);
  if (!kind) return null;
  const text = question.toLowerCase().replace(/[-‐‑‒–—]/g, " ").replace(/[’']s\b/g, "").replace(/[’']/g, "");
  const matches = BANKS.filter(b => b.aliases.some(a => new RegExp("\\b" + a + "\\b").test(text)));
  const options = matches.length > 1 ? matches : BANKS;
  if (matches.length !== 1) return { kind, information: null, message: matches.length > 1 ? "Which bank do you mean? Choose one bank so we do not mix its details with another." : "Which bank do you mean? We currently have reviewed details for the banks below. If yours is not listed, use its official app or a branch; we cannot supply an unverified contact or code.", options: options.map(b => ({ id: b.id, name: b.name })) };
  const b = matches[0], keys = requestedFacts[kind];
  const facts = keys.map(k => ({ label: k === "email" ? "Customer-care email" : k === "phone" ? "Customer-care phone" : "USSD menu", value: b[k].value, source: b[k].source }));
  if (facts.some(f => Date.parse(f.source.checked + "T00:00:00Z") > now.getTime() || Date.parse(f.source.expires + "T23:59:59Z") < now.getTime())) return { kind, information: null, options: [], message: "These bank details need a fresh source review. Use the bank’s official app or visit a branch; we will not give you an outdated contact or code." };
  return { kind, information: { bank: b.name, kind, facts } satisfies BankInformation, options: [], message: "Details published by the bank, not generated by a model. Verify on the linked official page before using them." };
}
