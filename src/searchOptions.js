import axios from "axios";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
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
        let freq = {};
        await axios
          .get(process.env.REACT_APP_BACKEND + "posts/all")
          .then((res) => {
            const posts = res.data.posts;
            for (let i = 0; i < posts.length; i++) {
              const sub = posts[i].subreddit;
              const subName = posts[i].subName;
              const subscribers = posts[i].subscribers;

              // subreddit frequency
              if (freq[sub] == null) freq[sub] = 1;
              else freq[sub] = freq[sub] + 1;

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

        // Sorting subreddit frequency
        freq = Object.keys(freq).map((key) => [key, freq[key]]);
        freq = freq.sort((a, b) => b[1] - a[1]);

        let subData = []; // adding data to array
        for (const [key] of freq) subData.push([key, communities[key]]);

        state.cardsDOM.push(
          <div className={props.getClass("h3")}>Trending subreddits</div>
        );

        // Creating cards for communities
        for (
          let i = 0;
          i < subData.length && state.cardsDOM.length < props.numOptions + 1;
          i++
        ) {
          state.cardsDOM.push(
            <a
              key={"searchCard-" + i}
              className={props.getClass("searchCards")}
              href={"/search?q=" + subData[i][0]}
              title="Search subreddit statistics"
            >
              <TrendingUpIcon style={{ marginRight: "10px" }} />
              <span className="limitText1">{subNames[subData[i][0]]}</span>
              <span className="limitText1" style={{ color: "gray" }}>
                {numToString(subData[i][1])}
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
    >
      <TrendingUpIcon style={{ color: "transparent" }} />
      <span className="limitText1" style={{ color: "transparent" }}>
        Loading
      </span>
      <span className="limitText1" style={{ color: "transparent" }}>
        Loading
      </span>
    </a>
  );

  // Adding multiple objects to DOM
  const loadingDOM = [...Array(props.numOptions).keys()].map(
    (n) => (n = loadingObj(n))
  );

  loadingDOM.unshift(
    <div className={props.getClass("h3")} style={{ color: "transparent" }}>
      Loading
    </div>
  );

  return (
    <div className="centering">
      <div className="cardsLoc">
        {state.loaded ? state.cardsDOM : loadingDOM}
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
