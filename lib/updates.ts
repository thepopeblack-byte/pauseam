export type SafetyUpdate = {
  id: string;
  title: string;
  published: string;
  summary: string;
  steps: string[];
  source: string;
  guidanceSource: string;
  checked: string;
  expires: string;
  review: string;
  challenge: string;
  choices: [string, string];
  explanation: string;
};
const review = {
  checked: "2026-10-02",
  expires: "2026-10-09",
  review:
    "Official search-index content checked; direct source retrieval returned 403. Human review pending.",
};
const guidanceSource =
  "https://www.cbn.gov.ng/supervision/cpdfraudandscam.html";
export const SAFETY_UPDATES: SafetyUpdate[] = [
  {
    id: "business-email-2026",
    title: "A familiar email can still ask for the wrong payment",
    published: "2026-08-27",
    source: "https://cert.gov.ng/index.php",
    guidanceSource,
    summary:
      "ngCERT published an advisory about business email compromise and social engineering targeting government and critical institutions.",
    steps: [
      "Pause a request to change payment details, even when the email looks familiar.",
      "Call the organisation using a number established before the request. Confirm the change separately.",
    ],
    challenge:
      "Your supplier emails new bank details. What is the better next step?",
    choices: [
      "Call using the contact I already know",
      "Reply to that email and pay",
    ],
    explanation:
      "Use an independent contact. A reply to the same message may go to someone controlling the mailbox.",
    ...review,
  },
  {
    id: "fake-installer-2026",
    title: "A fake error message can trick you into installing malware",
    published: "2026-07-13",
    source: "https://cert.gov.ng/index.php",
    guidanceSource,
    summary:
      "ngCERT warned about ClickFix attacks: fake errors or CAPTCHA prompts can persuade users to run commands or install malicious software.",
    steps: [
      "Do not run commands or install software because a page says you must fix an error or pass a CAPTCHA.",
      "Close the prompt. Get software and support through the provider's official service.",
    ],
    challenge:
      "A page asks you to paste a command to prove you are human. What would you do?",
    choices: [
      "Close it without running the command",
      "Run it so I can continue",
    ],
    explanation:
      "A command can change your device or install malware. Do not run one from an unexpected prompt.",
    ...review,
  },
  {
    id: "email-password-2026",
    title: "A stolen email password can put other accounts at risk",
    published: "2026-06-15",
    source: "https://cert.gov.ng/",
    guidanceSource,
    summary:
      "ngCERT warned that stolen email credentials can lead to account takeovers, identity theft and further attacks.",
    steps: [
      "Use a unique password and turn on two-factor authentication through the official service.",
      "If you suspect a compromise, change the password through that service. Contact your bank immediately if your banking access may be affected.",
    ],
    challenge:
      "You suspect someone has access to your email. What would you do first?",
    choices: [
      "Secure it through the official service",
      "Give a stranger a code to fix it",
    ],
    explanation:
      "Protect your codes. Use the service's own recovery and security controls, and contact your bank if banking access is affected.",
    ...review,
  },
];
export function currentSafetyUpdates(
  now = new Date(),
  entries: SafetyUpdate[] = SAFETY_UPDATES,
) {
  const trusted = new Set(["cert.gov.ng", "www.cbn.gov.ng"]);
  const safeUrl = (s: string) => {
    try {
      const u = new URL(s);
      return (
        u.protocol === "https:" &&
        !u.username &&
        !u.password &&
        trusted.has(u.hostname)
      );
    } catch {
      return false;
    }
  };
  return entries
    .filter(
      (e) =>
        safeUrl(e.source) &&
        safeUrl(e.guidanceSource) &&
        Date.parse(e.published + "T00:00:00Z") <= now.getTime() &&
        Date.parse(e.checked + "T00:00:00Z") <= now.getTime() &&
        Date.parse(e.expires + "T23:59:59Z") >= now.getTime(),
    )
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, 3);
}
