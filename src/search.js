import axios from "axios";
import React from "react";
import Results from "./results";
import { useState, useEffect } from "react";
import { topReddits } from "./topReddits";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

// Top Reddit Communities
const communities = topReddits;

export default function Search() {
  window.document.title = "Upvote Stats - Search";

  // Getting id from URL search param
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get("q");
  // Setting and checking that ID param exists
  const query = q !== null && q.length > 0 ? "r/" + q : "Upvote Stats";
  const searching = query.includes("r/");

  if (searching) window.document.title = "Upvote Stats - " + query;

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    name: query,
    value: "",
    limit: 100,
    after: "",
    stats: {
      upvotes: 0,
      downvotes: 0,
      posts: { upvotes: 0, downvotes: 0, count: 0 },
      comments: { upvotes: 0, awards: 0, count: 0 },
      awards: 0,
      coins: 0,
      earnings: 0,
    },
  });

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false && searching) {
      (async () => {
        // Getting all top posts of the month
        let topData = [];
        await axios
          .get(
            "https://www.reddit.com/" +
              query +
              "/top.json?t=month&limit=" +
              state.limit +
              "&after=" +
              state.after
          )
          .then((res) => {
            topData = res.data.data.children;
            state.after = res.data.data.after;

            // Calculating stats for all posts
            calculate(topData, "posts");
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        // Looping through top posts data
        for (let i = 0; i < topData.length; i++) {
          let obj = topData[i].data;
          await axios
            .get("https://www.reddit.com" + obj.permalink + ".json")
            .then((res2) => {
              let commentData = res2.data[1].data.children;

              // Calculating stats for all comments
              calculate(commentData, "comments");
            })
            .catch((err) => {
              console.log(err);
              state.error = true;
            });
        }

        // Finally, calculating the earnings
        state.stats.earnings = Math.floor(state.stats.coins / 500) * 1.99;

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

  /**
   * Calculates the data and adds results to the state
   * @param {*} arr - array with data to calculate
   * @param {*} kind - either 'post' or 'comment'
   */
  function calculate(arr, kind) {
    // Loop through the data
    for (let i = 0; i < arr.length; i++) {
      let obj = arr[i].data;

      // Skip if missing important keys
      if (
        obj.ups === undefined ||
        obj.all_awardings === undefined ||
        obj.total_awards_received === undefined
      )
        continue;

      // Calculate the amount of downvotes
      let downvotes =
        obj.ups - Math.floor((100 * obj.ups) / (100 * obj.upvote_ratio));

      if (obj.upvote_ratio === undefined) downvotes = 0;

      // Adding general stats
      state.stats.upvotes += obj.ups;
      state.stats.downvotes += downvotes;

      // Adding stats for posts
      if (kind === "posts") {
        state.stats.posts.count++;
        state.stats.posts.upvotes += obj.ups;
        state.stats.posts.downvotes += downvotes;
      }
      // Adding stats for comments
      if (kind === "comments") {
        state.stats.comments.count++;
        if (arr[i].kind === "t1") {
          state.stats.comments.upvotes += obj.ups;
          state.stats.comments.awards += obj.total_awards_received;

          // Recursion to access each reply for each comment
          if (obj.replies.data !== undefined)
            calculate(obj.replies.data.children, "comments");
        }
        // Adding 'excess' comments
        if (arr[i].kind === "more") {
          state.stats.comments.upvotes += obj.count;
        }
      }

      // Adding amount of awards
      state.stats.awards += obj.total_awards_received;
      // Adding amount of coins
      for (let j = 0; j < obj.all_awardings.length; j++) {
        state.stats.coins +=
          obj.all_awardings[j].count * obj.all_awardings[j].coin_price;
      }
    }
  }

  /**
   * Callback fired when the value changes
   * @param {*} e - event
   * @param {*} v - value
   * @param {*} r - reason
   */
  function onChange(e, v, r) {
    // if menu option is selected
    if (r === "select-option") {
      state.value = v.substring(2, v.length);
      if (state.value.length > 0)
        window.location.href = "/search?q=" + state.value;
    }
  }

  /**
   * Callback fired when pressing key
   * @param {*} e - event
   */
  function onKeyDown(e) {
    // if enter button is pressed
    if (e.keyCode === 13) {
      if (state.value.length >= 2) {
        if (state.value.substring(0, 2) === "r/") {
          state.value = state.value.substring(2, state.value.length);
        }
      }
      if (state.value.length > 0)
        window.location.href = "/search?q=" + state.value;
    }
  }

  return (
    <div>
      <div className="centering">
        <h1>{state.name}</h1>
      </div>
      <div className="centering">
        <h3>upvotestats.com</h3>
      </div>
      <div className="centering">
        <div
          style={{
            backgroundColor: "white",
            padding: "0px 5px 0px 5px",
            borderRadius: "10px",
            marginBottom: "40px",
            width: "60%",
            minWidth: "300px",
          }}
        >
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={communities.map((obj) => "r/" + obj.subreddit)}
            onInputChange={(e, v) => setState({ ...state, value: v })}
            onChange={(e, v, r) => onChange(e, v, r)}
            onKeyDown={(e) => onKeyDown(e)}
            style={{
              marginTop: "-8px",
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for any subreddit on reddit.com"
                margin="normal"
                variant="outlined"
              />
            )}
          />
        </div>
      </div>
      {state.error === true && (
        <div className="header" style={{ padding: "60px" }}>
          <div>
            An error occured when trying to analyze the subreddit {query} <br />
            <br /> Ad blockers may cause errors by preventing the program from
            fulfilling requests, espcially comments made by a user on reddit,
            that may contain words such as 'advertisement'.
          </div>
        </div>
      )}
      {state.loaded === false && searching && (
        <div className="header" style={{ padding: "60px", color: "gainsboro" }}>
          <div>
            Loading all of the data can take up to 2-3 minutes to process as
            this program will analyze all of the top posts, comments, and
            replies of the subreddit in the last 30 days.
          </div>
        </div>
      )}
      {state.loaded === true && searching && state.error === false && (
        <div>
          {state.after !== undefined &&
            state.after !== null &&
            state.after.length > 0 && (
              <div className="centering">
                <button
                  className="moreButton"
                  onClick={() => setState({ ...state, loaded: false })}
                >
                  Load more posts and comments
                </button>
              </div>
            )}
          <div
            className="centering"
            style={{ color: "gray", width: "100%", textAlign: "center" }}
          >
            <br />
            Showing results for the top{" "}
            {state.stats.posts.count
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
            posts and top{" "}
            {state.stats.comments.count
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
            comments from the past 30 days
            <br />
            <br />
          </div>
          <Results stats={state.stats} />
        </div>
      )}
    </div>
  );
}
