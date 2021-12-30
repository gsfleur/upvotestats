import axios from "axios";
import { useState, useEffect } from "react";

export default function Home() {
  window.document.title = "Home - Upvote Stats";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    cardsDOM: [],
  });

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false) {
      (async () => {
        // Getting subreddit name and subscribers
        let communities = {};
        await axios
          .get(process.env.REACT_APP_BACKEND + "posts/all")
          .then((res) => {
            let posts = res.data.posts;
            for (let i = 0; i < posts.length; i++) {
              let sub = posts[i].subreddit;
              let subscribers = posts[i].subscribers;

              // saving name and sub count
              if (communities[sub] == null) communities[sub] = subscribers;
            }
          })
          .catch((err) => {
            state.error = true;
            console.log(err);
          });

        let subData = []; // adding data to array
        for (const [key, value] of Object.entries(communities))
          subData.push([key, value]);

        // Randomizing profile cards with Schwartzian transformation
        subData = subData
          .map((a) => ({ sort: Math.random(), value: a }))
          .sort((a, b) => a.sort - b.sort)
          .map((a) => a.value);

        // Creating cards for communities
        for (let i = 0; i < subData.length && state.cardsDOM.length < 5; i++) {
          state.cardsDOM.push(
            <button
              key={"card-" + i}
              className="homeCards"
              style={{ border: "none" }}
              onClick={() =>
                (window.location.href = "/search?q=" + subData[i][0])
              }
            >
              r/{subData[i][0]}
              <br />
              <span style={{ color: "gray", fontSize: "14px" }}>
                {numToString(subData[i][1])} subscribers
              </span>
            </button>
          );
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

  // Loading objects
  const loadingDOM = (
    <div
      className="homeCards"
      style={{
        border: "none",
        height: "50px",
        width: "100%",
        color: "transparent",
        marginBottom: "16px",
      }}
    ></div>
  );

  return (
    <div className="centering">
      {state.loaded === false && (
        <div className="cardsLoc">
          {loadingDOM}
          {loadingDOM}
          {loadingDOM}
          {loadingDOM}
          {loadingDOM}
        </div>
      )}
      {state.loaded === true && state.error === false && (
        <div className="cardsLoc">{state.cardsDOM}</div>
      )}
    </div>
  );
}

/**
 * Converts number to string with abbreviation
 * @param {*} num - Number to convert
 * @returns Number with abbreviation
 */
export function numToString(num) {
  return Math.abs(num) >= 1.0e9
    ? (Math.abs(num) / 1.0e9).toFixed(2) + "B"
    : Math.abs(num) >= 1.0e6
    ? (Math.abs(num) / 1.0e6).toFixed(2) + "M"
    : Math.abs(num) >= 1.0e3
    ? (Math.abs(num) / 1.0e3).toFixed(2) + "K"
    : Math.abs(num);
}
