import Link from "next/link";
import type { CalculatorListing } from "@/lib/calculators";

export function CalculatorCard({ calculator }: { calculator: CalculatorListing }) {
  const isLive = calculator.status === "live" && calculator.href;

  return (
    <article className={`calc-card ${isLive ? "is-live" : "is-soon"}`}>
      <p className="calc-status">{isLive ? "Live" : "Coming soon"}</p>
      <h2>{calculator.title}</h2>
      <p>{calculator.summary}</p>
      {isLive ? (
        <Link className="btn btn-primary" href={calculator.href!}>
          Open calculator
        </Link>
      ) : (
        <p className="soon-note">Listed for the roadmap. Not interactive yet.</p>
      )}
    </article>
  );
}
