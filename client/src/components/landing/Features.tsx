import {
  FavouriteSvg,
  FilledVisibleSvg,
  RateSvg,
  ReviewSvg,
} from "@/assets/icons";

const features = [
  {
    icon: <FilledVisibleSvg />,
    desc: "Keep track of every film you’ve ever watched (or just start from the day you join)",
  },
  {
    icon: <FavouriteSvg />,
    desc: "Show some love for your favorite films, lists and reviews with a “like”",
  },
  {
    icon: <ReviewSvg />,
    desc: "Write and share reviews, and follow friends and other members to read theirs",
  },
  {
    icon: <RateSvg />,
    desc: "Rate each film on a five-star scale (with halves) to record and share your reaction",
  },
];

export default function Features() {
  const elements = features.map((feature, idx) => (
    <div className="feature-card" key={idx}>
      <span className="feature-icon">{feature.icon}</span>
      <span className="feature-desc">{feature.desc}</span>
    </div>
  ));
  return (
    <section className="limited-width features">
      <div
        className="section-top-row"
        style={{ "--section-translate-y": "0px" } as React.CSSProperties}
      >
        <h4>Reel254 lets you...</h4>
      </div>
      <div className="featured-grid">{elements}</div>
    </section>
  );
}
