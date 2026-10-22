"use client";

import axios from "axios";
import { FormEvent, useEffect, useRef, useState } from "react";
import defaultPlans from "../api/data/plans.json";

type PlanKind = "mobile" | "fiber";
type Plan = {
  name: string;
  eyebrow: string;
  price: number;
  allowance: string;
  unit: string;
  detail: string;
  features: string[];
  featured?: boolean;
};
// Same data the API seeds into the Plans table; shown until (or if) the API responds
const fallbackPlans = defaultPlans as Record<PlanKind, Plan[]>;
// Empty on Azure (API served at /api); http://localhost:7071 locally via .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function Icon({
  name,
  className = "",
}: {
  name:
    | "arrow"
    | "check"
    | "signal"
    | "wifi"
    | "globe"
    | "phone"
    | "plus"
    | "close";
  className?: string;
}) {
  const shapes = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    signal: (
      <>
        <path d="M5 19v-3m5 3v-7m5 7V8m5 11V4" />
      </>
    ),
    wifi: (
      <>
        <path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0" />
        <circle cx="12" cy="20" r=".5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="3" />
        <path d="M10 18h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name]}
    </svg>
  );
}

function ConnectionArtwork() {
  return (
    <div
      className="connection-art"
      aria-label="Illustration of a phone and a connected home"
      role="img"
    >
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <span className="orbit-dot dot-one" />
      <span className="orbit-dot dot-two" />
      <span className="orbit-dot dot-three" />
      <div className="floating-label label-top">
        <span className="live-dot" /> A world of possibilities
      </div>
      <div className="phone-art">
        <div className="phone-speaker" />
        <div className="phone-status">
          <span>9:41</span>
          <Icon name="signal" />
        </div>
        <div className="screen-symbol">
          <span />
          <span />
          <span />
          <i />
        </div>
        <div className="phone-caption">
          Your world.
          <br />
          <strong>Closer.</strong>
        </div>
        <span className="phone-bottom" />
      </div>
      <div className="wifi-bubble">
        <Icon name="wifi" />
      </div>
      <div className="home-card">
        <span className="home-icon">
          <Icon name="wifi" />
        </span>
        <div>
          <small>Home, connected.</small>
          <strong>Good things flow.</strong>
        </div>
        <span className="home-dot" />
      </div>
      <span className="art-caption">FROM YOUR SOFA TO YOUR NEXT ADVENTURE</span>
    </div>
  );
}

export default function Home() {
  const [plans, setPlans] = useState(fallbackPlans);
  const [planSource, setPlanSource] = useState<"api" | "built-in">("built-in");
  const [kind, setKind] = useState<PlanKind>("mobile");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [postcode, setPostcode] = useState("");
  const [coverage, setCoverage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);

  useEffect(() => {
    axios
      .get<Record<PlanKind, Plan[]>>(`${API_BASE_URL}/api/plans`, { timeout: 5000 })
      .then(({ data }) => {
        if (data.mobile?.length && data.fiber?.length) {
          setPlans(data);
          setPlanSource("api");
        }
      })
      .catch(() => setPlanSource("built-in"));
  }, []);

  function checkCoverage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{5}$/.test(postcode.trim())) {
      setCoverage("Enter a five-digit US ZIP code to try the demo.");
      return;
    }
    setCoverage(
      `Demo for ${postcode.trim()}: explore our example mobile and fiber plans below. Live availability is not checked; a real service would verify your full address.`,
    );
  }

  function closeDialog() {
    dialog.current?.close();
    setSelected(null);
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        A little more connection. A lot more possibility.{" "}
        <a href="#plans">
          Find your plan <span aria-hidden="true">↗</span>
        </a>
      </div>
      <header className="site-header">
        <div className="container nav-wrap">
          <a className="brand" href="#" aria-label="Relay home">
            relay<span>.</span>
          </a>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <Icon name="close" />
            ) : (
              <>
                <span />
                <span />
              </>
            )}
          </button>
          <nav
            id="navigation"
            className={menuOpen ? "nav-links is-open" : "nav-links"}
            aria-label="Main navigation"
          >
            <a
              href="#plans"
              onClick={() => {
                setKind("mobile");
                setMenuOpen(false);
              }}
            >
              Mobile
            </a>
            <a
              href="#plans"
              onClick={() => {
                setKind("fiber");
                setMenuOpen(false);
              }}
            >
              Home internet
            </a>
            <a href="#why-relay" onClick={() => setMenuOpen(false)}>
              Why Relay
            </a>
            <a href="#help" onClick={() => setMenuOpen(false)}>
              Help & support
            </a>
            <a
              className="button button-small button-dark nav-cta"
              href="#coverage"
              onClick={() => setMenuOpen(false)}
            >
              Check coverage <Icon name="arrow" />
            </a>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="tiny-star" aria-hidden="true">
                  ✳
                </span>{" "}
                FOR THE WAY YOU LIVE
              </p>
              <h1>
                Life happens.
                <br />
                Stay <span className="underlined">connected.</span>
              </h1>
              <p className="hero-description">
                The catch-ups. The big ideas. The just-one-more episodes. Make
                room for it all with mobile and home internet that fit your
                world.
              </p>
              <div className="hero-actions">
                <a className="button button-dark" href="#plans">
                  Explore our plans <Icon name="arrow" />
                </a>
                <a className="text-link" href="#coverage">
                  Find your connection <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="hero-note">
                <span className="check-circle">
                  <Icon name="check" />
                </span>{" "}
                Simple plans. Room to be you.
              </div>
            </div>
            <ConnectionArtwork />
          </div>
          <div className="container benefit-bar">
            <div>
              <Icon name="signal" />
              <span>Mobile for your everyday</span>
            </div>
            <div>
              <Icon name="wifi" />
              <span>Fiber for your whole home</span>
            </div>
            <div>
              <Icon name="globe" />
              <span>More ways to feel closer</span>
            </div>
          </div>
        </section>

        <section
          className="plans-section section-space"
          id="plans"
          aria-labelledby="plans-heading"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR CONNECTION, YOUR CALL</p>
                <h2 id="plans-heading">A plan for your kind of life.</h2>
                <p>Find your fit. Keep things simple.</p>
              </div>
              <div
                className="plan-switch"
                role="group"
                aria-label="Plan category"
              >
                <button
                  aria-pressed={kind === "mobile"}
                  onClick={() => setKind("mobile")}
                >
                  <Icon name="phone" /> Mobile
                </button>
                <button
                  aria-pressed={kind === "fiber"}
                  onClick={() => setKind("fiber")}
                >
                  <Icon name="wifi" /> Home fiber
                </button>
              </div>
            </div>
            <div className="plan-grid" aria-live="polite">
              {plans[kind].map((plan) => (
                <article
                  className={`plan-card ${plan.featured ? "featured" : ""}`}
                  key={plan.name}
                >
                  {plan.featured && (
                    <span className="plan-badge">
                      THE HAPPY MEDIUM <span aria-hidden="true">✦</span>
                    </span>
                  )}
                  <p className="plan-eyebrow">{plan.eyebrow}</p>
                  <h3>{plan.name}</h3>
                  <div className="plan-allowance">
                    {plan.allowance}
                    <span>{plan.unit}</span>
                  </div>
                  <p className="plan-description">{plan.detail}</p>
                  <div className="plan-price">
                    <strong>${plan.price}</strong>
                    <span>/ month</span>
                  </div>
                  <button
                    className={`button ${plan.featured ? "button-dark" : "button-outline"}`}
                    onClick={() => setSelected(plan)}
                  >
                    Explore this plan <Icon name="arrow" />
                  </button>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Icon name="check" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="demo-disclaimer">
              Illustrative plans and USD prices for this training demo. No
              service is offered for purchase.{" "}
              {planSource === "api"
                ? "Plans loaded from the API."
                : "Showing built-in plans (API not connected)."}
            </p>
          </div>
        </section>

        <section
          className="coverage-section"
          id="coverage"
          aria-labelledby="coverage-heading"
        >
          <div className="container coverage-grid">
            <div>
              <p className="eyebrow">LET’S FIND YOUR CONNECTION</p>
              <h2 id="coverage-heading">
                Big possibilities.
                <br />
                Starting at your place.
              </h2>
              <p>
                Thinking mobile or home internet? Try our coverage experience
                with your ZIP code.
              </p>
            </div>
            <div className="coverage-panel">
              <form onSubmit={checkCoverage} noValidate>
                <label htmlFor="postcode">Your ZIP code</label>
                <div className="coverage-input">
                  <input
                    id="postcode"
                    name="postcode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    placeholder="e.g. 10001"
                    value={postcode}
                    onChange={(event) => {
                      setPostcode(event.target.value);
                      setCoverage("");
                    }}
                    aria-describedby="coverage-note coverage-result"
                  />
                  <button className="button button-lime" type="submit">
                    Check coverage <Icon name="arrow" />
                  </button>
                </div>
                <p id="coverage-note">
                  Demo only. Your ZIP code is not stored or sent anywhere.
                </p>
                <p id="coverage-result" role="status">
                  {coverage}
                </p>
              </form>
            </div>
          </div>
        </section>

        <section
          className="why-section section-space"
          id="why-relay"
          aria-labelledby="why-heading"
        >
          <div className="container why-grid">
            <div>
              <p className="eyebrow">LESS FUSS. MORE LIFE.</p>
              <h2 id="why-heading">
                A connection you
                <br />
                can feel good about.
              </h2>
              <p>Because your internet should be the easy part of your day.</p>
              <a className="text-link" href="#help">
                A few things to know <Icon name="arrow" />
              </a>
            </div>
            <div className="why-list">
              <article>
                <span className="feature-number">01</span>
                <div>
                  <h3>Simply makes sense.</h3>
                  <p>
                    Clear plan details, with the data and speeds up front. Find
                    what works for you at a glance.
                  </p>
                </div>
              </article>
              <article>
                <span className="feature-number">02</span>
                <div>
                  <h3>Made for real life.</h3>
                  <p>
                    From a solo commute to a full house online, explore options
                    for the way you connect.
                  </p>
                </div>
              </article>
              <article>
                <span className="feature-number">03</span>
                <div>
                  <h3>A little more freedom.</h3>
                  <p>
                    Our example plans keep things flexible with straightforward
                    monthly pricing.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="faq-section section-space"
          id="help"
          aria-labelledby="faq-heading"
        >
          <div className="container faq-grid">
            <div>
              <p className="eyebrow">GOOD QUESTIONS.</p>
              <h2 id="faq-heading">
                Let’s clear
                <br />a few things up.
              </h2>
              <p>A little clarity goes a long way.</p>
            </div>
            <div className="faq-list">
              {[
                [
                  "Can I actually order a Relay plan?",
                  "Relay is a fictional telecom brand for an Azure training project. These example plans cannot be purchased, and no account or payment is needed.",
                ],
                [
                  "How does the coverage checker work?",
                  "It validates the format of a five-digit US ZIP code and shows an example response in your browser. It does not query a network, confirm service availability, or store your ZIP code.",
                ],
                [
                  "What is the difference between mobile and home fiber?",
                  "Mobile data connects a compatible phone over a cellular network, so you can use it on the go. Home fiber connects a fixed address, with a router sharing the connection over Wi-Fi.",
                ],
                [
                  "Can I keep my existing phone number?",
                  "In a real service, number transfers depend on eligibility and your current provider. The mobile plans here illustrate that option; this demo does not request or transfer any numbers.",
                ],
              ].map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <Icon name="plus" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-top">
            <a className="brand" href="#" aria-label="Relay home">
              relay<span>.</span>
            </a>
            <p>A little more connected.</p>
            <a href="#plans">
              Find your next connection <Icon name="arrow" />
            </a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Relay. A fictional brand.</span>
            <span>Training demo · No customer data collected</span>
            <a href="#help">About this demo</a>
          </div>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className="plan-dialog"
        aria-labelledby="plan-dialog-title"
        onCancel={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        {selected && (
          <>
            <button
              className="dialog-close"
              aria-label="Close plan details"
              onClick={closeDialog}
            >
              <Icon name="close" />
            </button>
            <p className="eyebrow">A CLOSER LOOK</p>
            <h2 id="plan-dialog-title">{selected.name}</h2>
            <p>{selected.detail}</p>
            <p className="dialog-price">
              ${selected.price}
              <span> / month · illustrative USD price</span>
            </p>
            <ul>
              {selected.features.map((feature) => (
                <li key={feature}>
                  <Icon name="check" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="dialog-note">
              This is an example plan for training. No order will be placed, and
              no payment or personal information is required.
            </p>
            <button className="button button-dark" onClick={closeDialog}>
              Back to exploring <Icon name="arrow" />
            </button>
          </>
        )}
      </dialog>
    </>
  );
}
