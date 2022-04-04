import axios from "axios";
import { useState, useEffect } from "react";

export default function SearchOptions(props) {
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
        let subNames = {};
        await axios
          .get(process.env.REACT_APP_BACKEND + "posts/all")
          .then((res) => {
            const posts = res.data.posts;
            for (let i = 0; i < posts.length; i++) {
              const sub = posts[i].subreddit;
              const subName = posts[i].subName;
              const subscribers = posts[i].subscribers;

              // saving name and sub count
              if (communities[sub] == null) {
                communities[sub] = subscribers;
                subNames[sub] = subName;
              }
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
            <a
              key={"searchCard-" + i}
              className={props.getClass("searchCards")}
              href={"/search?q=" + subData[i][0]}
              title="Search subreddit statistics"
            >
              {subNames[subData[i][0]]}
              <br />
              <span style={{ color: "gray", fontSize: "14px" }}>
                {numToString(subData[i][1])} subscribers
              </span>
            </a>
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
  const loadingObj = (key) => (
    <a
      key={"searchCard-" + key}
      className={props.getClass("searchCards")}
      href={window.location.pathname}
      title="Search subreddit statistics"
      style={{ color: "transparent" }}
    >
      loading
      <br />
      <span style={{ color: "transparent", fontSize: "14px" }}>loading</span>
    </a>
  );

  return (
    <div className="centering">
      <div className="cardsLoc">
        {state.loaded === true
          ? state.cardsDOM
          : [...Array(5).keys()].map((n) => (n = loadingObj(n)))}
      </div>
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
