import { topReddits } from "./topReddits";
// Top Reddit Communities
const communities = topReddits;

export default function Home() {
  window.document.title = "Upvote Stats - Home";

  // Getting top 30 communities
  let examples = communities.slice(0, 30);

  // Randomizing profile cards with Schwartzian transformation
  examples = examples
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);

  let cardsDOM = [];
  // Creating cards for communities
  for (let i = 0; i < examples.length && i < 5; i++) {
    cardsDOM.push(
      <button
        className="homeCards"
        style={{ border: "none" }}
        onClick={() =>
          (window.location.href = "/search?q=" + examples[i].subreddit)
        }
      >
        r/{examples[i].subreddit}
      </button>
    );
  }

  return (
    <div className="centering">
      <div className="cardsLoc">{cardsDOM}</div>
    </div>
  );
}
