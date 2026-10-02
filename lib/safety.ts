export const MODEL = "NCAIR1/NigerianAccentedEnglish";
export const REVISION = "3c52c6e6c9ec508014a7b9db6a42b503b8930dff";
export const MODEL_URL = "https://huggingface.co/" + MODEL;
export const KB_VERSION = "2026-10-02.2";
export type Journey = "before" | "after" | "learn";
export type Card = {
  id: string;
  title: string;
  keywords: string[];
  steps: string[];
  source: string;
  sourceTitle: string;
  section: string;
  why?: string[];
  basis?: string;
  checked: string;
  expires: string;
  review: string;
};
const review = {
  checked: "2026-10-01",
  expires: "2026-11-01",
  review:
    "Source-checked by Codex (automated); independent human review pending",
};
const fraud = "https://www.cbn.gov.ng/supervision/cpdfraudandscam.html";
export const CARDS: Card[] = [
  {
    id: "supplier",
    title: "Verify changed supplier details independently",
    keywords: [
      "supplier",
      "changed",
      "invoice",
      "vendor",
      "beneficiary",
      "suppliers",
      "invoices",
    ],
    steps: [
      "Pause this payment.",
      "Call your supplier using a contact established before this request. Confirm the change separately.",
      "If you cannot confirm the request independently, keep the payment on hold.",
    ],
    why: [
      "A changed instruction needs a fresh check.",
      "A reply to the same message may reach the impersonator.",
      "Uncertainty is not evidence that a payment is safe.",
    ],
    basis:
      "PauseAm scenario checklist applying CBN identity-verification advice; not a bank-authentication service.",
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "Phishing and social engineering",
    ...review,
  },
  {
    id: "school",
    title: "Check fee instructions with the school",
    keywords: [
      "school",
      "tuition",
      "fees",
      "bursary",
      "admission",
      "college",
      "university",
      "campus",
    ],
    steps: [
      "Pause payment on instructions received in a forwarded message.",
      "Reach the school through its independently located official office or portal.",
      "Confirm the payment process there before taking the next step.",
    ],
    why: [
      "Forwarded instructions can be altered.",
      "The sender's link is not independent confirmation.",
      "PauseAm has no school-payment directory or account-verification integration.",
    ],
    basis:
      "PauseAm scenario checklist applying CBN advice to contact the organisation directly.",
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "Phishing scams",
    ...review,
  },
  {
    id: "receipt",
    title: "A receipt image cannot prove payment",
    keywords: ["receipt", "alert", "screenshot", "proof"],
    steps: [
      "Pause handing over goods based only on a message or receipt image.",
      "Check your own bank's official service independently for the transaction.",
      "Ask your bank about any uncertainty before relying on the claimed payment.",
    ],
    why: [
      "PauseAm cannot authenticate receipts.",
      "The claimed sender's evidence is not independent verification.",
      "Only the institution can investigate its transaction records.",
    ],
    basis:
      "PauseAm scenario checklist applying independent verification; no receipt-authenticity verdict.",
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "Social engineering; contact your financial institution",
    ...review,
  },

  {
    id: "impersonation",
    title: "Pause and verify the request",
    keywords: [
      "link",
      "caller",
      "call",
      "bank",
      "message",
      "whatsapp",
      "otp",
      "pin",
      "password",
      "code",
      "urgent",
      "prize",
      "fee",
      "grant",
    ],
    steps: [
      "Do not open a suspicious link or disclose banking secrets.",
      "Contact the organisation independently to check who is asking. Pressure to act is a reason to pause.",
    ],
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "Phishing scams; social engineering",
    ...review,
  },
  {
    id: "shopping",
    title: "Check the seller before paying",
    keywords: [
      "seller",
      "shop",
      "buy",
      "purchase",
      "delivery",
      "goods",
      "phone",
      "market",
      "online",
      "item",
    ],
    steps: [
      "Check independent reviews and the seller’s credibility.",
      "An unusually attractive deal can be a warning. A secure-looking website alone does not verify a seller.",
    ],
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "Online shopping scams",
    ...review,
  },
  {
    id: "investment",
    title: "Be cautious about promised returns",
    keywords: [
      "investment",
      "invest",
      "profit",
      "double",
      "return",
      "crypto",
      "ponzi",
    ],
    steps: [
      "Promises of quick profits with little risk are warning signs.",
      "Research independently and seek qualified advice before committing money.",
    ],
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "Investment scams",
    ...review,
  },
  {
    id: "report",
    title: "Contact your bank immediately",
    keywords: ["scam", "fraud", "stolen", "hacked"],
    steps: [
      "Contact your bank through a trusted official channel now. Ask it to secure the affected account and investigate the transaction.",
      "If access was compromised, change passwords through the official service and enable two-factor authentication.",
      "Keep the payment confirmation and messages privately. Ask your bank for a complaint reference. Recovery is not guaranteed.",
    ],
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "How to report fraud and scams",
    ...review,
  },
  {
    id: "secrets",
    title: "Your secrets are yours to protect",
    keywords: [
      "pin",
      "otp",
      "password",
      "secret",
      "credential",
      "code",
      "codes",
      "banking",
    ],
    steps: [
      "Keep your PIN, passwords and banking codes private.",
      "Report suspected fraud or compromised banking information promptly to your bank. Do not enter those details in this app.",
    ],
    source: "https://www.cbn.gov.ng/FinInc/FinLit/BillOfRights.html",
    sourceTitle: "CBN · Bank Customers’ Bill of Rights and Duties",
    section:
      "Duty to protect instruments and information; duty to report suspected fraud",
    ...review,
  },
  {
    id: "complaint",
    title: "Keep a record of your complaint",
    keywords: [
      "complaint",
      "escalate",
      "unresolved",
      "refund",
      "reference",
      "reversal",
      "pending",
      "failed",
      "debited",
      "charged",
      "dispute",
      "reversed",
      "charges",
      "duplicate",
      "deducted",
      "deduction",
      "missing",
      "resolve",
    ],
    steps: [
      "Lodge your complaint with your bank first and ask for a tracking reference.",
      "If it remains unresolved, use the CBN complaint guidance to check the applicable escalation process. Do not wait to report suspected fraud.",
    ],
    source: "https://www.cbn.gov.ng/FinInc/FinLit/LodgeComplaint.html",
    sourceTitle: "CBN · How to Lodge a Complaint",
    section: "Contact your institution first; if your bank fails to resolve",
    ...review,
  },
  {
    id: "mistaken",
    title: "Ask your bank to investigate a mistaken transfer",
    keywords: ["mistaken", "accidentally", "accidental"],
    steps: [
      "Contact your bank through its official service promptly. Explain that the transfer may have gone to the wrong recipient.",
      "Keep the confirmation privately. Give the transaction details only through the bank's verified complaints channel.",
      "Ask for a complaint reference and the next step. A reversal or recovery is not guaranteed.",
    ],
    source: "https://www.cbn.gov.ng/FinInc/FinLit/BillOfRights.html",
    sourceTitle: "CBN · Bank Customers' Bill of Rights and Duties",
    section: "Duty to report suspected fraud or error; right to redress",
    basis:
      "Scenario checklist applying the duty to report errors and the right to complain; it does not assert a right to reverse a completed transfer.",
    ...review,
    checked: "2026-10-02",
  },
  {
    id: "account-security",
    title: "Protect your accounts through the official service",
    keywords: [
      "phishing",
      "malware",
      "breach",
      "compromised",
      "cybersecurity",
      "virus",
    ],
    steps: [
      "Avoid the suspicious link, download or support contact. Open the provider's official service independently.",
      "If access may be compromised, change passwords there and turn on two-factor authentication. Keep every recovery code private.",
      "If banking information or access may be affected, contact your bank immediately and ask it to secure the account.",
    ],
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section:
      "Phishing scams; identity theft; change passwords and secure accounts",
    basis:
      "General protective steps for possible account compromise; this is not malware detection or a device-security assessment.",
    ...review,
    checked: "2026-10-02",
  },
  {
    id: "payment",
    title: "Check the request before sending money",
    keywords: [
      "pay",
      "payment",
      "payments",
      "money",
      "transfer",
      "transfers",
      "deposit",
      "cash",
      "send",
      "sending",
      "paying",
    ],
    steps: [
      "Pause if you are unsure why the money is being requested.",
      "Confirm who is asking through a contact you found independently, especially if they are rushing you.",
      "Keep banking codes private. If you remain unsure, ask your bank through its official service before paying.",
    ],
    why: [
      "A general checklist cannot authenticate the request.",
      "A message or familiar name alone does not prove who sent it.",
      "Your bank is the appropriate place to check questions about its transactions.",
    ],
    basis:
      "General PauseAm checklist adapted from CBN advice on independent verification, social engineering and seeking help when uncertain. This does not resolve every payment issue.",
    source: fraud,
    sourceTitle: "CBN · Fraud and Scam Awareness",
    section: "Phishing scams; social engineering; stay informed",
    ...review,
    checked: "2026-10-02",
  },
];
export function containsSensitive(text: string): boolean {
  return (
    /\d/.test(text) ||
    /\b(?:zero|one|two|three|four|five|six|seven|eight|nine)(?:[\s,-]+(?:zero|one|two|three|four|five|six|seven|eight|nine)){2,}\b/i.test(
      text,
    ) ||
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) ||
    /\b(?:my|the)\s+(?:pin|otp|password|passcode|credential|account number)\s*(?:is|:|=)\s*\S+/i.test(
      text,
    )
  );
}
export type Answer = {
  status: "ok" | "unavailable" | "no_match" | "sensitive";
  cards: Card[];
  message: string;
  engine: string;
  model: string | null;
  modelRevision?: string;
  kbVersion: string;
};
export function retrieve(
  question: string,
  journey: Journey,
  options: { disabled?: boolean; now?: Date; cards?: Card[] } = {},
): Answer {
  const base = {
    engine: "Source-checked keyword retrieval (no generative answer model)",
    model: null,
    kbVersion: KB_VERSION,
  };
  if (containsSensitive(question))
    return {
      ...base,
      status: "sensitive",
      cards: [],
      message:
        "Remove all numbers and private details. Describe only the situation.",
    };
  if (options.disabled)
    return {
      ...base,
      status: "unavailable",
      cards: [],
      message:
        "The safety library is unavailable. I cannot assess this request. Pause the payment and contact your bank through a trusted channel.",
    };
  const now = options.now || new Date();
  const cards = currentSourceCards(options.cards || CARDS, now);
  if (!cards.length)
    return {
      ...base,
      status: "unavailable",
      cards: [],
      message:
        "No current source-checked guidance is available. Pause and ask your bank through an independently trusted channel.",
    };
  const text = question.toLowerCase().replace(/[\u2019\u2018]/g, "'");
  const urgent =
    (journey === "after" &&
      !/\b(?:complaint|unresolved|escalate|reference)\b/.test(text)) ||
    /\b(already paid|already sent|been scammed|was scammed|account hacked|money stolen|unauthori[sz]ed)\b/.test(
      text,
    ) ||
    /\b(?:sent|paid|transferred)\b.*\b(?:stopped replying|stopped responding|blocked me|not replying|not delivered|never arrived|never delivered|disappeared|scam|fraud)\b/.test(
      text,
    );
  const tokens = new Set(text.match(/[a-z]+/g) || []);
  const scored = cards
    .map((c) => ({
      c,
      score:
        c.keywords.filter((k) => tokens.has(k)).length *
          (c.id === "payment" ? 0.1 : 1) +
        (urgent && c.id === "report" ? 100 : 0) +
        (c.id === "complaint" &&
        /\b(?:did not|didn't|has not|hasn't|not)\b.*\b(?:arrive|arrived|received|receive|gone through)\b/.test(
          text,
        ) &&
        /\b(?:transfer|bank|money|transaction)\b/.test(text)
          ? 5
          : 0) +
        (c.id === "supplier" &&
        /\b(?:different|new|changed)\b.*\b(?:bank|account|details)\b/.test(text)
          ? 5
          : 0) +
        (c.id === "account-security" &&
        /\b(?:clicked|opened|installed|tapped)\b/.test(text) &&
        /\b(?:phishing|malware|link|download)\b/.test(text)
          ? 5
          : 0) +
        (c.id === "mistaken" &&
        /\b(?:wrong|mistaken)\b/.test(text) &&
        /\b(?:transfer|transferred|sent|recipient|account)\b/.test(text)
          ? 5
          : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (!scored.length)
    return {
      ...base,
      status: "no_match",
      cards: [],
      message:
        "I cannot help with that question yet. Describe what happened with a payment, seller, bank message or banking code. For urgent banking concerns, contact your bank through its official service.",
    };
  return {
    ...base,
    status: "ok",
    cards: scored.slice(0, 1).map((x) => x.c),
    message: "These are safety steps, not a verdict on a person or payment.",
  };
}
export const TEST_PROMPTS = [
  "Someone sent me a link and asked for my banking code.",
  "I already paid a seller and I think it is a scam.",
  "An investment promises to double my money.",
];
export function currentSourceCards(
  cards: Card[] = CARDS,
  now: Date = new Date(),
) {
  return cards.filter(
    (c) =>
      c.checked &&
      Date.parse(c.checked + "T00:00:00Z") <= now.getTime() &&
      Date.parse(c.expires + "T23:59:59Z") >= now.getTime() &&
      c.source.startsWith("https://www.cbn.gov.ng/"),
  );
}
export function wordErrors(reference: string, hypothesis: string) {
  const words = (s: string) =>
    s
      .normalize("NFC")
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\s]/gu, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  const a = words(reference),
    b = words(hypothesis);
  let row = b.map((_, i) => i + 1);
  row.unshift(0);
  for (let i = 1; i <= a.length; i++) {
    const next = [i];
    for (let j = 1; j <= b.length; j++)
      next[j] = Math.min(
        next[j - 1] + 1,
        row[j] + 1,
        row[j - 1] + Number(a[i - 1] !== b[j - 1]),
      );
    row = next;
  }
  return { errors: row[b.length], words: a.length };
}
