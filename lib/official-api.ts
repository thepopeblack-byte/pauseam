// Deliberately fail closed: the public official API contract has not been supplied.
// A generic OpenAI-compatible route would be a guess, not an official integration.
export const officialAPIStatus = {
  verified: false,
  endpoint: null,
  contract: null,
  successfulRequests: 0,
} as const;
export async function callOfficialAPI(): Promise<never> {
  throw new Error(
    "Official N-ATLaS API access and contract are unverified. No request was sent.",
  );
}
