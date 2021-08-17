import React from "react";
import { useState } from "react";
import { topReddits } from "./topReddits";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

// Top Reddit Communities
const communities = topReddits;

export default function Search() {
  // Getting id from URL search param
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get("q");
  // Setting and checking that ID param exists
  const query = q !== null && q.length > 0 ? "r/" + q : "Upvote Stats";

  // Component State
  const [state, setState] = useState({ loaded: false, name: query, value: "" });

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
            minWidth: "310px",
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
    </div>
  );
}
