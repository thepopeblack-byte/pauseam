"use client";
import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { JourneyPanel } from "@/components/journey";
import { Connectivity } from "@/components/connectivity";
import { Pause, Shield, BookOpen, LifeBuoy } from "lucide-react";
import type { Journey } from "@/lib/safety";
const subscribeReady = () => () => {};
const journeys = [
  {
    id: "before",
    title: "Check before I pay",
    detail: "Pause a request. Know what to verify.",
    Icon: Shield,
  },
  {
    id: "after",
    title: "I may have paid a scammer",
    detail: "Find the first actions to take now.",
    Icon: LifeBuoy,
  },
  {
    id: "learn",
    title: "Learn a warning sign",
    detail: "Practise with a short everyday example.",
    Icon: BookOpen,
  },
] as const;
export default function Home() {
  const ready = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
  const [journey, setJourney] = useState<Journey>("before");
  return (
    <div className="site">
      <a className="skip-link" href="#workspace">
        Skip to payment guidance
      </a>
      <header>
        <Link className="brand" href="/">
          <span className="brand-mark">
            <Pause aria-hidden="true" />
          </span>
          <span>
            PauseAm<span className="brand-note">Ask before you pay.</span>
          </span>
        </Link>
        <nav aria-label="Main">
          <Link href="/about">Sources & privacy</Link>
          <Link href="/evaluation">Evaluation</Link>
        </nav>
      </header>
      <main>
        <Connectivity />
        <div className="intro">
          <span className="eyebrow">A MOMENT TO MAKE A BETTER DECISION</span>
          <h1>Ask before you pay.</h1>
          <p>
            A short checklist for a payment you’re unsure about. No account
            needed.
          </p>
        </div>
        <div className="journey-picker" aria-label="Choose what you need">
          {journeys.map(({ id, title, detail, Icon }) => (
            <button
              key={id}
              type="button"
              disabled={!ready}
              aria-pressed={journey === id}
              aria-controls="workspace"
              className={
                journey === id ? "journey-choice selected" : "journey-choice"
              }
              onClick={() => setJourney(id)}
            >
              <Icon aria-hidden="true" />
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="workspace" id="workspace">
          <section
            className="main-card"
            aria-label={journeys.find((x) => x.id === journey)?.title}
          >
            <JourneyPanel key={journey} journey={journey} />
          </section>
          <aside>
            <div className="trust-card">
              <span className="eyebrow">YOUR DECISION, WITH A LITTLE HELP</span>
              <h2>
                Pause.
                <br />
                Verify independently.
                <br />
                Choose your next step.
              </h2>
              <p>
                A message, logo or receipt image cannot establish that a payment
                is safe.
              </p>
              <ul>
                <li>
                  <Shield aria-hidden="true" />
                  No PINs, OTPs or passwords
                </li>
                <li>
                  <BookOpen aria-hidden="true" />
                  Sources behind each checklist
                </li>
                <li>
                  <LifeBuoy aria-hidden="true" />A clear stop when evidence is
                  missing
                </li>
              </ul>
              <Link href="/about">See how guidance works</Link>
            </div>
            <div className="urgent-card">
              <h3>Already sent money?</h3>
              <p>
                Contact your bank now through its official service. Do not wait
                for an AI response.
              </p>
              <button onClick={() => setJourney("after")}>
                Open the first-action checklist
              </button>
            </div>
          </aside>
        </div>
        <footer>
          <span>PauseAm · Ask before you pay.</span>
          <Link href="/about">Official sources & model status</Link>
          <span>Research build · No payment processing</span>
        </footer>
      </main>
    </div>
  );
}
