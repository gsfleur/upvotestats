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
        let subTitle = {};
        let subLink = {};
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
                subTitle[sub] = posts[i].title;
                subLink[sub] = posts[i].url;
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
          <div className={props.getClass("h3")} key={"searchCard-trends"}>
            Trending subreddits
          </div>
        );

        // Creating cards for communities
        for (
          let i = 0;
          i < subData.length && state.cardsDOM.length < props.numOptions + 1;
          i++
        ) {
          state.cardsDOM.push(
            <div
              key={"searchCard-" + i}
              className={props.getClass("searchCards")}
            >
              <div
                style={{
                  float: "left",
                  width: "100%",
                }}
              >
                <TrendingUpIcon
                  style={{ marginRight: "10px", float: "left" }}
                />
                <span className="limitText1" style={{ float: "left" }}>
                  {subNames[subData[i][0]]}
                </span>
                <span className="limitText1" style={{ float: "right" }}>
                  {numToString(subData[i][1])}
                </span>
              </div>
              <div
                style={{
                  marginLeft: "34px",
                  float: "left",
                }}
              >
                <span style={{ color: "gray" }}>{subTitle[subData[i][0]]}</span>
                <br />
                <a
                  className={props.getClass("searchCardLink")}
                  href={"/search?q=" + subData[i][0]}
                  title="Search subreddit statistics"
                >
                  Search Stats
                </a>
                <span style={{ fontSize: "13px" }}> &#x2022; </span>
                <a
                  target="_blank"
                  rel="noreferrer"
                  className={props.getClass("searchCardLink")}
                  href={subLink[subData[i][0]]}
                  title="View post on reddit"
                >
                  View Post
                </a>
              </div>
            </div>
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
      key={"searchLoadCard-" + key}
      className={props.getClass("searchCards")}
      href={window.location.pathname}
      title="Search subreddit statistics"
      style={{ border: "none" }}
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
    <div
      className={props.getClass("h3")}
      key={"searchLoadCard"}
      style={{ color: "transparent" }}
    >
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
