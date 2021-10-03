import axios from "axios";
import { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function Trends() {
  window.document.title = "Upvote Stats - Most Awarded Posts on Reddit";

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
          .get(process.env.REACT_APP_BACKEND + "posts/today")
          .then((res) => {
            state.todayData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        await axios
          .get(process.env.REACT_APP_BACKEND + "posts/week")
          .then((res) => {
            state.weekData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        await axios
          .get(process.env.REACT_APP_BACKEND + "posts/month")
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

  let postListDOM = [];
  let postLinks = [];
  if (state.loaded === true) {
    // Creating DOM for posts
    if (state.data.posts !== undefined) {
      for (
        let i = 0;
        i < state.data.posts.length && postListDOM.length < 50;
        i++
      ) {
        // Skip deleted posts
        if (state.data.posts[i][1].text === "[deleted]") continue;

        // Skip potential duplicates
        if (postLinks.includes(state.data.posts[i][1].url)) continue;

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
          state.data.posts[i][1].urlToImage !== "image" &&
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
            {diffDays >= 21 && diffDays < 28 && <span>3 weeks ago</span>}
            {diffDays >= 28 && diffDays < 35 && <span>1 month ago</span>} for a
            total of {numToString(state.data.posts[i][1].upvotes)} upvotes,{" "}
            {numToString(Math.abs(state.data.posts[i][1].downvotes))} downvotes
            and a ratio of{" "}
            {(
              100 *
              (state.data.posts[i][1].upvotes /
                (state.data.posts[i][1].upvotes +
                  Math.abs(state.data.posts[i][1].downvotes)))
            ).toFixed(0)}{" "}
            percent.
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
            for (let r = 0; r < removeText.length; r++)
              if (textParts[t].includes(removeText[r])) allow = false;

            if (allow === true) newText += textParts[t] + " ";
          }
        }

        let subName = "" + state.data.posts[i][1].subreddit;

        postLinks.push(state.data.posts[i][1].url);
        // DOM of post in list
        postListDOM.push(
          <div className="centering" key={"trends-" + i}>
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
                  {postListDOM.length + 1} &bull;{" "}
                  {"r/" + state.data.posts[i][1].subreddit} &bull;{" "}
                  {numToString(state.data.posts[i][1].upvotes)} &uarr; &bull;{" "}
                  {numToString(Math.abs(state.data.posts[i][1].downvotes))}{" "}
                  &darr;
                  {state.data.posts[i][1].nsfw === true && (
                    <span> &bull; NSFW</span>
                  )}
                </div>

                {state.data.posts[i][1].trends.length > 0 && (
                  <div className="searchLink" style={{ fontSize: "16px" }}>
                    <b>{state.data.posts[i][1].trends[0]}</b>
                  </div>
                )}
                {state.data.posts[i][1].trends.length === 0 && (
                  <div className="searchLink" style={{ fontSize: "16px" }}>
                    <b>{subName.toLowerCase()}</b>
                  </div>
                )}

                {!loadableImg && (
                  <div
                    className="searchLink"
                    style={{ fontSize: "16px", marginTop: "5px" }}
                  >
                    {state.data.posts[i][1].title}
                  </div>
                )}

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
                      padding: "5px 10px 10px 10px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "inline-block",
                        marginBottom: "7px",
                        fontSize: "14px",
                        color: "silver",
                      }}
                    >
                      {state.data.posts[i][1].icon === "" && (
                        <img
                          className="iconImg"
                          src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png"
                          alt={state.data.posts[i][1].author + " icon"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "missing.png";
                          }}
                        />
                      )}
                      {state.data.posts[i][1].icon !== "" && (
                        <img
                          className="iconImg"
                          src={state.data.posts[i][1].icon}
                          alt={state.data.posts[i][1].author + " icon"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "missing.png";
                          }}
                        />
                      )}
                      <div
                        style={{
                          float: "left",
                          marginTop: "5px",
                          marginLeft: "5px",
                        }}
                      >
                        {state.data.posts[i][1].author} &bull;{" "}
                        {hours <= 24 && <span>{Math.floor(hours)}h</span>}
                        {hours > 24 && hours <= 48 && <span>1d</span>}
                        {hours > 48 && diffDays < 7 && <span>{diffDays}d</span>}
                        {diffDays >= 7 && diffDays < 14 && <span>1w</span>}
                        {diffDays >= 14 && diffDays < 21 && <span>2w</span>}
                        {diffDays >= 21 && diffDays < 28 && <span>3w</span>}
                        {diffDays >= 28 && diffDays < 35 && <span>1m</span>}
                      </div>
                    </div>
                    <img
                      src={state.data.posts[i][1].urlToImage}
                      className="postImgStandard"
                      alt="Reddit Post Thumbnail"
                      style={{
                        float: "left",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "missing.png";
                      }}
                    />
                    <div
                      className="postDate"
                      style={{
                        fontSize: "16px",
                        marginBottom: "10px",
                        color: "gainsboro",
                        float: "left",
                        width: "calc(100% - 120px)",
                        marginLeft: "10px",
                      }}
                    >
                      {state.data.posts[i][1].title}
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
              <div
                style={{
                  fontSize: "13px",
                  marginTop: "5px",
                  color: "silver",
                }}
              >
                {state.data.posts[i][1].awards > 0 && (
                  <span>
                    {numToString(state.data.posts[i][1].coins)} coins,{" "}
                    {numToString(state.data.posts[i][1].awards)} awards,{" "}
                  </span>
                )}
                <span>
                  {numToString(state.data.posts[i][1].comments)} comments
                </span>
              </div>
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
        {state.loaded === true && postListDOM.length > 0 && (
          <div>
            <div className="centering">
              <div style={{ width: "85%" }}>
                <div
                  style={{
                    fontSize: "20px",
                    marginBottom: "10px",
                  }}
                >
                  <b>Front Page Trends</b>
                  <br />
                  <div
                    style={{
                      fontSize: "14px",
                      color: "silver",
                      marginTop: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <b>The Worlds Most Awarded Posts</b>
                    <br />
                    <div style={{ marginTop: "5px" }}>
                      Out of the top{" "}
                      {state.data.stats.posts.count
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                      posts and {numToString(state.data.stats.comments.count)}{" "}
                      comments that made r/All
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        width: "100%",
                        display: "inline-block",
                      }}
                    >
                      <div
                        className="statsInfo"
                        style={{ borderBottom: "3px dotted red" }}
                      >
                        {numToString(state.data.stats.upvotes)} upvotes
                      </div>
                      <div
                        className="statsInfo"
                        style={{ borderBottom: "3px dotted royalblue" }}
                      >
                        {numToString(state.data.stats.downvotes)} downvotes
                      </div>
                      <div
                        className="statsInfo"
                        style={{ borderBottom: "3px dotted goldenrod" }}
                      >
                        {numToString(state.data.stats.awards)} awards
                      </div>
                      <div
                        className="statsInfo"
                        style={{ borderBottom: "3px dotted gold" }}
                      >
                        {numToString(state.data.stats.coins)} coins
                      </div>
                    </div>
                  </div>
                </div>
                {state.sort === "today" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid rgb(29,161,242)" }}
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
                    style={{ borderBottom: "3px solid rgb(29,161,242)" }}
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
                    style={{ borderBottom: "3px solid rgb(29,161,242)" }}
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
            {postListDOM}
          </div>
        )}
        {state.loaded === true && postListDOM.length === 0 && (
          <div style={{ textAlign: "center" }}>
            This page is currently unavailable. Please check back soon for
            updates.
          </div>
        )}
      </div>
    </div>
  );
}
