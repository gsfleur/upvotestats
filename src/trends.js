import axios from "axios";
import { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function Trends() {
  window.document.title =
    "Upvote Stats - Todays Most Downvoted Posts on Reddit";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    sort: "today",
    data: undefined,
    todayData: undefined,
    weekData: undefined,
    monthData: undefined,
  });

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false) {
      (async () => {
        // Loading data from backend
        await axios
          .get(process.env.REACT_APP_BACKEND + "today")
          .then((res) => {
            state.todayData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        await axios
          .get(process.env.REACT_APP_BACKEND + "week")
          .then((res) => {
            state.weekData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        await axios
          .get(process.env.REACT_APP_BACKEND + "month")
          .then((res) => {
            state.monthData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        // Update state
        if (componentMounted) {
          setState({
            ...state,
            loaded: true,
            data: state.todayData,
          });
        }
      })();
    }
    return () => {
      componentMounted = false;
    };
  });

  let newsListDOM = [];
  if (state.loaded === true) {
    // Creating DOM for posts
    if (state.data.posts !== undefined) {
      for (
        let i = 0;
        i < state.data.posts.length && newsListDOM.length < 50;
        i++
      ) {
        // Skip deleted posts
        if (state.data.posts[i][1].text === "[deleted]") continue;

        const timeInDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(state.data.posts[i][1].publishedAt);
        const secondDate = new Date();
        // Date since article published
        const diffDays = Math.round(
          Math.abs((firstDate - secondDate) / timeInDay)
        );

        // Determine whether to show image
        let loadableImg =
          state.data.posts[i][1].urlToImage !== null &&
          state.data.posts[i][1].urlToImage !== "" &&
          state.data.posts[i][1].urlToImage !== "default" &&
          state.data.posts[i][1].urlToImage !== "self" &&
          state.data.posts[i][1].urlToImage !== "nsfw" &&
          state.data.posts[i][1].urlToImage !== "spoiler";

        // hours since post
        let hours = Math.abs(firstDate - secondDate);
        hours /= 60 * 60 * 1000;

        // Description of posts
        let author = (
          <span>
            {state.data.posts[i][1].author} posted this{" "}
            {hours <= 24 && <span>{Math.floor(hours)} hours ago</span>}
            {hours > 24 && hours <= 48 && <span>1 day ago</span>}
            {hours > 48 && diffDays < 7 && <span>{diffDays} days ago</span>}
            {diffDays >= 7 && diffDays < 14 && <span>1 week ago</span>}
            {diffDays >= 14 && diffDays < 21 && <span>2 weeks ago</span>}
            {diffDays >= 21 && diffDays < 28 && <span>3 weeks ago</span>} for a
            total of {numToString(state.data.posts[i][1].upvotes)} upvotes,{" "}
            {numToString(Math.abs(state.data.posts[i][1].downvotes))} downvotes
            and a ratio of {Math.floor(state.data.posts[i][0] * 100)} percent.{" "}
          </span>
        );

        let text = state.data.posts[i][1].text;

        let textParts = text.split("\n");
        let newText = "";

        // Removing links from text
        let removeText = ["www", "https", "http"];
        if (text !== undefined) {
          for (let t = 0; t < textParts.length; t++) {
            let allow = true;
            for (let r = 0; r < removeText.length; r++) {
              if (textParts[t].includes(removeText[r])) allow = false;
            }

            if (allow === true) newText += textParts[t] + " ";
          }
        }

        // DOM of post in list
        newsListDOM.push(
          <div className="centering" key={"today-" + i}>
            <a
              href={state.data.posts[i][1].url}
              className="postLink"
              target="_blank"
              rel="noreferrer"
            >
              <div
                className="newsText"
                style={{ float: "left", overflow: "hidden" }}
              >
                <div
                  className="searchLink"
                  style={{
                    fontSize: "13px",
                    marginBottom: "10px",
                    color: "silver",
                  }}
                >
                  {newsListDOM.length + 1} &bull;{" "}
                  {"r/" + state.data.posts[i][1].subreddit} &bull;{" "}
                  {numToString(state.data.posts[i][1].subscribers)}
                  {state.data.posts[i][1].nsfw === true && (
                    <span> &bull; NSFW</span>
                  )}
                </div>

                <div className="searchLink" style={{ fontSize: "16px" }}>
                  <b>{state.data.posts[i][1].title}</b>
                </div>
                {newText.length > 0 && (
                  <div
                    className="searchLink"
                    style={{
                      fontSize: "13px",
                      marginBottom: "5px",
                      marginTop: "5px",
                      wordWrap: "break-word",
                      color: "silver",
                    }}
                  >
                    {newText.substring(0, 180)}
                    {newText.length > 180 && <span>...</span>}
                  </div>
                )}
              </div>
              {loadableImg && (
                <div
                  className="imgBody"
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      overflow: "auto",
                      border: "1.5px solid #292929",
                      borderRadius: "10px",
                      padding: "10px",
                    }}
                  >
                    <img
                      src={state.data.posts[i][1].urlToImage}
                      className="postImgStandard"
                      alt="news"
                      style={{
                        float: "left",
                      }}
                    />
                    <div
                      className="postDate"
                      style={{
                        fontSize: "13px",
                        marginBottom: "10px",
                        color: "silver",
                        float: "left",
                        width: "calc(100% - 120px)",
                        marginLeft: "10px",
                      }}
                    >
                      {author}
                    </div>
                  </div>
                </div>
              )}
              {!loadableImg && (
                <div
                  className="postDate"
                  style={{
                    fontSize: "13px",
                    marginBottom: "10px",
                    color: "silver",
                  }}
                >
                  {author}
                </div>
              )}
              <span
                style={{
                  fontSize: "13px",
                  marginBottom: "10px",
                  color: "silver",
                }}
              >
                {numToString(state.data.posts[i][1].comments)} comments
                {state.data.posts[i][1].coins > 0 && (
                  <span>
                    , {numToString(state.data.posts[i][1].coins)} reddit coins
                  </span>
                )}
              </span>
            </a>
          </div>
        );
      }
    }
  }

  /*
   * Converts number to string with abbreviation
   * @param {*} num - Number to convert
   * @returns Number with abbreviation
   */
  function numToString(num) {
    return Math.abs(num) >= 1.0e9
      ? (Math.abs(num) / 1.0e9).toFixed(1) + "B"
      : Math.abs(num) >= 1.0e6
      ? (Math.abs(num) / 1.0e6).toFixed(1) + "M"
      : Math.abs(num) >= 1.0e3
      ? (Math.abs(num) / 1.0e3).toFixed(1) + "K"
      : Math.abs(num);
  }

  return (
    <div className="centering">
      <div className="today">
        {state.loaded === false && (
          <div className="centering">
            <CircularProgress
              style={{
                width: "25px",
                height: "25px",
                color: "rgb(142, 200, 246)",
              }}
            />
          </div>
        )}
        {state.loaded === true && newsListDOM.length > 0 && (
          <div>
            <div className="centering">
              <div style={{ width: "85%" }}>
                <div
                  style={{
                    fontSize: "20px",
                    textAlign: "center",
                    marginBottom: "10px",
                  }}
                >
                  <b>Front Page Trends</b>
                  <br />
                  <span style={{ fontSize: "14px", color: "silver" }}>
                    <b>Sorted by Downvote Ratio</b>
                  </span>
                  <br />
                  <br />
                </div>
                {state.sort === "today" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid goldenrod" }}
                  >
                    Today
                  </button>
                )}
                {state.sort !== "today" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid gray" }}
                    onClick={() =>
                      setState({
                        ...state,
                        sort: "today",
                        data: state.todayData,
                      })
                    }
                  >
                    Today
                  </button>
                )}
                {state.sort === "week" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid goldenrod" }}
                  >
                    Week
                  </button>
                )}
                {state.sort !== "week" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid gray" }}
                    onClick={() =>
                      setState({
                        ...state,
                        sort: "week",
                        data: state.weekData,
                      })
                    }
                  >
                    Week
                  </button>
                )}
                {state.sort === "month" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid goldenrod" }}
                  >
                    Month
                  </button>
                )}
                {state.sort !== "month" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid gray" }}
                    onClick={() =>
                      setState({
                        ...state,
                        sort: "month",
                        data: state.monthData,
                      })
                    }
                  >
                    Month
                  </button>
                )}
              </div>
            </div>
            {newsListDOM}
            <div
              style={{ padding: "20px", textAlign: "center", fontSize: "14px" }}
            >
              <b>
                {state.data.stats.posts.count
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                posts and {numToString(state.data.stats.comments.count)}{" "}
                comments
              </b>
              <br />
              <span style={{ fontSize: "14px", color: "silver" }}>
                {numToString(state.data.stats.upvotes)} upvotes &bull;{" "}
                {numToString(state.data.stats.downvotes)} downvotes &bull;{" "}
                {numToString(state.data.stats.awards)} awards &bull;{" "}
                {numToString(state.data.stats.coins)} coins
              </span>
            </div>
          </div>
        )}
        {state.loaded === true && newsListDOM.length === 0 && (
          <div style={{ textAlign: "center" }}>
            This page is currently unavailable. Please check back soon for
            updates.
          </div>
        )}
      </div>
    </div>
  );
}
