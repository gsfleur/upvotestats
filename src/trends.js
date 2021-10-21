import axios from "axios";
import { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function Trends() {
  window.document.title = "Upvote Stats - Most Awarded Posts on Reddit";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
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

  let postListDOM = []; // DOM for posts
  let postLinks = []; // ids of all posts
  if (state.loaded === true && state.error === false) {
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

        // Date since post published
        const timeInDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(state.data.posts[i][1].publishedAt);
        const secondDate = new Date();
        const diffDays = Math.round(
          Math.abs((firstDate - secondDate) / timeInDay)
        );

        // hours since post
        let hours = Math.abs(firstDate - secondDate);
        hours /= 60 * 60 * 1000;

        // Determine whether to show image
        let loadableImg =
          state.data.posts[i][1].urlToImage !== null &&
          state.data.posts[i][1].urlToImage !== "" &&
          state.data.posts[i][1].urlToImage !== "default" &&
          state.data.posts[i][1].urlToImage !== "self" &&
          state.data.posts[i][1].urlToImage !== "image" &&
          state.data.posts[i][1].urlToImage !== "nsfw" &&
          state.data.posts[i][1].urlToImage !== "spoiler";

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

        // DOM for "trending with" section
        let trendingWith = [];
        let trends = state.data.posts[i][1].trends;
        for (let t = 1; t < trends.length && t < 3; t++) {
          trendingWith.push(
            <span
              style={{ color: "goldenrod" }}
              key={"trendWith-" + i + "-" + t}
            >
              {trends[t]}
              {trends.length > 2 && t < 2 && (
                <span style={{ color: "gainsboro" }}>,</span>
              )}{" "}
            </span>
          );
        }

        // Text of the post
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
              // Removing stray html encodings
              if (textParts[t].startsWith("&") && textParts[t].endsWith(";"))
                allow = false;
            }

            if (allow === true) newText += textParts[t] + " ";
          }
        }

        // Determine if title/text has a really long word
        let containsLongWord = false;
        let titleParts = state.data.posts[i][1].title.trim().split(/\s+/);
        for (let t = 0; t < titleParts.length; t++) {
          if (titleParts[t].length > 20) {
            containsLongWord = true;
            break;
          }
        }
        let newTextParts = newText.trim().split(/\s+/);
        if (!containsLongWord) {
          for (let t = 0; t < newTextParts.length; t++) {
            if (newTextParts[t].length > 20) {
              containsLongWord = true;
              break;
            }
          }
        }

        // Default post/img body css
        let imgBodyCSS = {
          display: "inline-block",
          width: "100%",
          marginTop: "10px",
        };

        // Break by letter if word is long (long links or words)
        if (containsLongWord) imgBodyCSS["wordBreak"] = "break-all";

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
                    color: "gray",
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
                      color: "silver",
                    }}
                  >
                    {newText.substring(0, 180)}
                    {newText.length > 180 && <span>...</span>}
                  </div>
                )}
              </div>
              {loadableImg && (
                <div className="imgBody" style={imgBodyCSS}>
                  <div
                    style={{
                      overflow: "auto",
                      border: "1.5px solid #292929",
                      borderRadius: "20px",
                      padding: "10px 10px 10px 10px",
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
                  color: "gray",
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
              {state.data.posts[i][1].trends.length > 0 && (
                <div
                  style={{
                    fontSize: "13px",
                    marginTop: "5px",
                    color: "gray",
                  }}
                >
                  <span>Trending with: {trendingWith}</span>
                </div>
              )}
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
        {state.loaded === true &&
          state.error === false &&
          postListDOM.length > 0 && (
            <div>
              <div className="centering">
                <div style={{ width: "85%" }}>
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
                      style={{ color: "silver" }}
                      onMouseOver={(e) => {
                        e.target.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.color = "silver";
                      }}
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
                      style={{ color: "silver" }}
                      onMouseOver={(e) => {
                        e.target.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.color = "silver";
                      }}
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
                      style={{ color: "silver" }}
                      onMouseOver={(e) => {
                        e.target.style.color = "white";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.color = "silver";
                      }}
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

              <div className="centering">
                <div
                  style={{
                    fontSize: "13px",
                    color: "gray",
                    marginTop: "0px",
                    marginBottom: "5px",
                    width: "85%",
                  }}
                >
                  Front Page Trends of posts with the most coins
                  <br />
                </div>
              </div>
              {postListDOM}

              <div className="centering">
                <div
                  style={{
                    fontSize: "14px",
                    color: "silver",
                    marginTop: "10px",
                    marginBottom: "10px",
                    textAlign: "center",
                    maxWidth: "75%",
                  }}
                >
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
