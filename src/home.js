import axios from "axios";
import { numToString } from "./results";
import { topReddits } from "./topReddits";
import { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

// Top Reddit Communities
const communities = topReddits;

export default function Home() {
  window.document.title = "Upvote Stats - Home";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    cardsDOM: [],
  });

  // Getting top 30 communities
  let examples = communities.slice(0, 30);

  // Randomizing profile cards with Schwartzian transformation
  examples = examples
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false) {
      (async () => {
        // Creating cards for communities
        for (let i = 0; i < examples.length && i < 5; i++) {
          await axios
            .get(
              "https://www.reddit.com/r/" +
                examples[i].subreddit +
                "/top.json?t=month&limit=1"
            )
            .then((res) => {
              let subs = res.data.data.children[0].data.subreddit_subscribers;

              state.cardsDOM.push(
                <button
                  key={"card-" + i}
                  className="homeCards"
                  style={{ border: "none" }}
                  onClick={() =>
                    (window.location.href =
                      "/search?q=" + examples[i].subreddit)
                  }
                >
                  r/{examples[i].subreddit}
                  <br />
                  <span style={{ color: "gray", fontSize: "14px" }}>
                    {numToString(subs)} subscribers
                  </span>
                </button>
              );
            })
            .catch((err) => {
              console.log(err);
              state.error = true;
            });
        }

        // Update state
        if (componentMounted) {
          setState({
            ...state,
            loaded: true,
          });
        }
      })();
    }
    return () => {
      componentMounted = false;
    };
  });

  return (
    <div className="centering">
      {state.loaded === false && (
        <CircularProgress
          style={{
            width: "25px",
            height: "25px",
            color: "rgb(142, 200, 246)",
          }}
        />
      )}
      {state.loaded === true && state.error === false && (
        <div className="cardsLoc">{state.cardsDOM}</div>
      )}
    </div>
  );
}
