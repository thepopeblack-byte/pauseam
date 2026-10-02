"use client";
import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { JourneyPanel } from "@/components/journey";
import { Connectivity } from "@/components/connectivity";
import { Pause, LifeBuoy, BookOpen } from "lucide-react";
import type { Journey } from "@/lib/safety";
const subscribeReady = () => () => {};
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
        Skip to your question
      </a>
      <header>
        <Link prefetch={false} className="brand" href="/" aria-label="PauseAm home">
          <span className="brand-mark">
            <Pause aria-hidden="true" />
          </span>
          <span>
            PauseAm<span className="brand-note">Ask before you pay.</span>
          </span>
        </Link>
        <nav aria-label="Main">
          <Link prefetch={false} href="/about">How it works</Link>
        </nav>
      </header>
      <main className="consumer-main">
        <Connectivity />
        <div className="journey-nav" aria-label="What do you need?">
          <button
            type="button"
            disabled={!ready}
            aria-pressed={journey === "before"}
            onClick={() => setJourney("before")}
          >
            Ask a question
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-pressed={journey === "after"}
            onClick={() => setJourney("after")}
          >
            <LifeBuoy size={17} aria-hidden="true" />
            Report a problem
          </button>
          <button
            type="button"
            disabled={!ready}
            aria-pressed={journey === "learn"}
            onClick={() => setJourney("learn")}
          >
            <BookOpen size={17} aria-hidden="true" />
            Learn
          </button>
        </div>
        <section id="workspace" className="main-card" aria-label="Payment help">
          <JourneyPanel key={journey} journey={journey} />
        </section>
        <footer>
          <span>English · No account needed</span>
          <div>
            <Link prefetch={false} href="/about">Privacy</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
