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

  if (query.includes("r/")) window.document.title = "Upvote Stats - " + query;

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    name: query,
    value: "",
    stats: {
      upvotes: 0,
      downvotes: 0,
      posts: { upvotes: 0, downvotes: 0 },
      comments: { upvotes: 0, downvotes: 0 },
      awards: 0,
      coins: 0,
      earnings: 0,
    },
  });

  useEffect(() => {
    let componentMounted = true;
    // Loading all titled player names for search
    if (state.loaded === false && query.includes("r/")) {
      (async () => {
        // Getting amount of active monthly users
        let topData = [];
        await axios
          .get("https://www.reddit.com/" + query + "/top.json?t=month&limit=1")
          .then((res) => {
            topData = res.data.data.children;

            calculate(topData, "posts");
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        for (let i = 0; i < topData.length; i++) {
          let obj = topData[i].data;
          await axios
            .get("https://www.reddit.com" + obj.permalink + ".json")
            .then((res2) => {
              let commentData = res2.data[1].data.children;
              console.log(commentData);
              calculate(commentData, "comments");
            })
            .catch((err) => {
              console.log(err);
              state.error = true;
            });
        }

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

  function calculate(arr, kind) {
    for (let i = 0; i < arr.length; i++) {
      let obj = arr[i].data;

      if (
        obj.ups === undefined ||
        obj.all_awardings === undefined ||
        obj.total_awards_received === undefined
      )
        continue;

      let downvotes =
        obj.ups - Math.floor((100 * obj.ups) / (100 * obj.upvote_ratio));

      if (obj.upvote_ratio === undefined) downvotes = 0;

      state.stats.upvotes += obj.ups;
      state.stats.downvotes += downvotes;
      if (kind === "posts") {
        state.stats.posts.upvotes += obj.ups;
        state.stats.posts.downvotes += downvotes;
      }
      if (kind === "comments") {
        if (arr[i].kind === "t1") {
          state.stats.comments.upvotes += obj.ups;

          if (obj.replies.data !== undefined)
            calculate(obj.replies.data.children, "comments");
        }
        if (arr[i].kind === "more") {
          state.stats.comments.upvotes += obj.count;
        }
      }

      state.stats.awards += obj.total_awards_received;

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
      {state.loaded === true && query.includes("r/") && (
        <Results stats={state.stats} />
      )}
    </div>
  );
}
