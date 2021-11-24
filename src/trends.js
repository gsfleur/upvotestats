import axios from "axios";
import { useState, useEffect } from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@mui/material/NativeSelect";

export default function Trends() {
  window.document.title = "Trends on Reddit - Upvote Stats";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    sort: "all",
    sortBy: "hot",
    sortDate: "today",
    data: undefined,
    allData: undefined,
    newsData: undefined,
    funnyData: undefined,
    sportData: undefined,
    expandedPosts: [],
  });

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false) {
      (async () => {
        // Date when starting request
        let beforeDate = new Date();
        // Loading data from backend
        await axios
          .get(
            process.env.REACT_APP_BACKEND +
              "posts/all?sort=" +
              state.sortBy +
              "&time=" +
              state.sortDate
          )
          .then((res) => {
            state.allData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });
        await axios
          .get(
            process.env.REACT_APP_BACKEND +
              "posts/news?sort=" +
              state.sortBy +
              "&time=" +
              state.sortDate
          )
          .then((res) => {
            state.newsData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });
        await axios
          .get(
            process.env.REACT_APP_BACKEND +
              "posts/funny?sort=" +
              state.sortBy +
              "&time=" +
              state.sortDate
          )
          .then((res) => {
            state.funnyData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });
        await axios
          .get(
            process.env.REACT_APP_BACKEND +
              "posts/sports?sort=" +
              state.sortBy +
              "&time=" +
              state.sortDate
          )
          .then((res) => {
            state.sportData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });
        // Date after request is finished
        let afterDate = new Date();

        // Update state
        if (componentMounted) {
          // Delay so load keyshine can complete one full pass (looks smoother/cleaner)
          setTimeout(() => {
            let data = state.allData;
            if (state.sort === "news") data = state.newsData;
            if (state.sort === "funny") data = state.funnyData;
            if (state.sort === "sports") data = state.sportData;
            setState({
              ...state,
              loaded: true,
              data: data,
            });
          }, Math.min(500, Math.max(0, 500 - (afterDate - beforeDate))));
        }
      })();
    }

    return () => {
      componentMounted = false;
    };
  });

  // Handle Time Change Event
  const handleTimeChange = (event) => {
    setState({
      ...state,
      loaded: false,
      expandedPosts: [],
      sortDate: event.target.value,
    });
  };

  // Handle Sort Change Event
  const handleSortChange = (event) => {
    setState({
      ...state,
      loaded: false,
      expandedPosts: [],
      sortBy: event.target.value,
    });
  };

  // Dropdown menu styling
  const useStyles = makeStyles({
    root: {
      "& .MuiNativeSelect-select": {
        color: "silver",
        padding: "5px",
      },
      "& .MuiNativeSelect-icon": {
        color: "silver",
      },
      "& .MuiNativeSelect-nativeInput": {
        backgoundColor: "#222222",
      },
    },
  });

  const classes = useStyles();

  let postListDOM = []; // DOM for posts
  let postLinks = []; // ids of all posts
  if (state.loaded === true && state.error === false) {
    // Creating DOM for posts
    if (state.data.posts !== undefined) {
      for (
        let i = 0;
        i < state.data.posts.length && postListDOM.length < 30;
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

        // Set image to website favicon if possible
        if (state.data.posts[i][1].urlToImage === "default") {
          if (state.data.posts[i][1].urlDest !== undefined) {
            state.data.posts[i][1].urlToImage =
              "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" +
              state.data.posts[i][1].urlDest +
              "&size=128";
          }
        }

        // Determine whether to show image
        let loadableImg =
          state.data.posts[i][1].urlToImage !== null &&
          state.data.posts[i][1].urlToImage !== "" &&
          state.data.posts[i][1].urlToImage !== "default" &&
          state.data.posts[i][1].urlToImage !== "self" &&
          state.data.posts[i][1].urlToImage !== "image" &&
          state.data.posts[i][1].urlToImage !== "nsfw" &&
          state.data.posts[i][1].urlToImage !== "spoiler";

        // DOM for "trending with" section
        let trendingWith = [];
        let trends = state.data.posts[i][1].trends;
        let lengthLimit = 0;

        // Load trends until width would be too large to fit all in one line
        for (
          let t = 1;
          t < trends.length &&
          lengthLimit < Math.min(650, window.innerWidth) - 120;
          t++
        ) {
          lengthLimit += trends[t].length * 13;
          trendingWith.push(
            <div
              style={{
                color: "silver",
                borderRadius: "10px",
                border: "1px solid #222222",
                padding: "5px",
                float: "left",
                marginRight: "5px",
                backgroundImage:
                  "linear-gradient(0deg,transparent 1%, rgb(255,255,255,0.05) 99%",
              }}
              key={"trendWith-" + i + "-" + t}
            >
              {trends[t]}
            </div>
          );
        }

        // Text of the post
        let text = state.data.posts[i][1].text;
        let textParts = text.split("\n");
        let newText = "";

        // Removing links from text
        let removeText = ["www", "https", "http", "*"];
        if (text !== undefined) {
          for (let t = 0; t < textParts.length; t++) {
            let allow = true;
            for (let r = 0; r < removeText.length; r++) {
              if (textParts[t].includes(removeText[r])) allow = false;
              // Removing stray html encodings
              if (textParts[t].startsWith("&") && textParts[t].endsWith(";"))
                allow = false;

              // Remove words that don't have a letter or number
              if (
                textParts[t].match(".*[a-zA-Z].*") === null &&
                textParts[t].match(".*[0-9].*") === null
              ) {
                allow = false;
              }
            }

            if (allow === true) newText += textParts[t] + " ";
          }
        }

        // Determine if title/text has a really long word
        let containsLongWord = false;
        let titleParts = state.data.posts[i][1].title.trim().split(/\s+/);
        for (let t = 0; t < titleParts.length; t++) {
          if (titleParts[t].length > 21) {
            containsLongWord = true;
            break;
          }
        }
        let newTextParts = newText.substring(0, 180).trim().split(/\s+/);
        if (!containsLongWord) {
          for (let t = 0; t < newTextParts.length; t++) {
            if (newTextParts[t].length > 21) {
              containsLongWord = true;
              break;
            }
          }
        }

        // Default post/img body css
        let imgBodyCSS = {
          display: "inline-block",
          width: "100%",
          marginTop: "5px",
        };

        // Break by letter if word is long (long links or words)
        if (containsLongWord) imgBodyCSS["wordBreak"] = "break-all";

        // Image Source
        let imgSource = state.data.posts[i][1].redditMediaDomain
          ? state.data.posts[i][1].urlDest
          : state.data.posts[i][1].urlToImage;

        // Link Destination String
        let destLink = state.data.posts[i][1].urlDest;
        if (destLink !== undefined) {
          destLink = destLink.replace("https://", "");
          destLink = destLink.replace("http://", "");
          destLink = destLink.replace("www.", "");
          destLink = destLink.substring(0, 15) + "...";
        }

        // Destination Link DOM
        let outLinkDOM = (
          <div style={{ display: "inline-block", width: "100%" }}>
            <a
              href={state.data.posts[i][1].urlDest}
              target="_blank"
              rel="noreferrer"
              className="searchLink"
              style={{
                fontSize: "13px",
                color: "DodgerBlue",
                float: "left",
                marginTop: "5px",
              }}
              onMouseOver={(e) => {
                e.target.style.color = "#4BA6FF";
              }}
              onMouseOut={(e) => {
                e.target.style.color = "DodgerBlue";
              }}
            >
              {destLink}
              <img
                id="threadLink"
                src="outbound.png"
                alt={"outbound icon"}
                width="13px"
                height="13px"
                style={{
                  marginLeft: "3px",
                  float: "right",
                  marginTop: "3px",
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "missing.png";
                }}
              />
            </a>
          </div>
        );

        // Reddit Post Link DOM
        let threadLinkDOM = (
          <a
            href={state.data.posts[i][1].url}
            target="_blank"
            rel="noreferrer"
            className="searchLink"
          >
            <span
              id="threadLink"
              style={{
                fontSize: "13px",
              }}
            >
              View thread
            </span>
          </a>
        );

        // Description of posts
        let author = (
          <span>
            {state.data.posts[i][1].author} posted{" "}
            {hours <= 24 && <span>{Math.floor(hours)}h ago</span>}
            {hours > 24 && hours <= 48 && <span>1d ago</span>}
            {hours > 48 && diffDays < 7 && <span>{diffDays}d ago</span>}
            {diffDays >= 7 && diffDays < 14 && <span>1w ago</span>}
            {diffDays >= 14 && diffDays < 21 && <span>2w ago</span>}
            {diffDays >= 21 && diffDays < 28 && <span>3w ago</span>}
            {diffDays >= 28 && diffDays < 35 && <span>1m ago</span>}{" "}
            {threadLinkDOM}
          </span>
        );

        // List of post links
        postLinks.push(state.data.posts[i][1].url);
        // DOM of post in list
        postListDOM.push(
          <div
            className="centering"
            key={"trends-" + i}
            onClick={(e) => {
              if (
                e.target.className !== "postImgStandard" &&
                e.target.className !== "postVideoStandard" &&
                e.target.className !== "searchLink" &&
                e.target.id !== "threadLink"
              )
                openPost(i);
            }}
          >
            <div className="postLink">
              <div
                className="newsText"
                style={{ float: "left", overflow: "hidden" }}
              >
                <div
                  className="searchLink"
                  style={{
                    fontSize: "12px",
                    marginBottom: "5px",
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
                  <div className="searchLink" style={{ fontSize: "14px" }}>
                    <b>{state.data.posts[i][1].trends[0]}</b>
                  </div>
                )}

                {!loadableImg && (
                  <div style={{ fontSize: "14px", marginTop: "5px" }}>
                    {state.data.posts[i][1].title}
                  </div>
                )}

                {newText.length > 0 && (
                  <div
                    className="searchLink"
                    style={{
                      fontSize: "13px",
                      marginTop: "5px",
                      color: "silver",
                    }}
                  >
                    {!state.expandedPosts.includes(i) && (
                      <span>
                        {newText.substring(0, 160)}
                        {newText.length > 160 && (
                          <span>... [click text to read more]</span>
                        )}
                      </span>
                    )}
                    {state.expandedPosts.includes(i) && <span>{newText}</span>}
                  </div>
                )}
                {newText.length === 0 && (
                  <div
                    className="searchLink"
                    style={{
                      fontSize: "13px",
                      marginTop: "5px",
                      color: "silver",
                    }}
                  >
                    {state.expandedPosts.includes(i) && !loadableImg && (
                      <span>OP only provided a title for this post</span>
                    )}
                  </div>
                )}
              </div>
              {loadableImg && (
                <div className="imgBody" style={imgBodyCSS}>
                  <div
                    style={{
                      position: "relative",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        overflow: "auto",
                        border: "1px solid #292929",
                        borderRadius: "20px",
                        padding: "10px 10px 10px 10px",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          display: "inline-block",
                          marginBottom: "5px",
                          fontSize: "12px",
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
                            marginBottom: "5px",
                            marginLeft: "5px",
                          }}
                        >
                          {state.data.posts[i][1].author} &bull;{" "}
                          {hours <= 24 && <span>{Math.floor(hours)}h</span>}
                          {hours > 24 && hours <= 48 && <span>1d</span>}
                          {hours > 48 && diffDays < 7 && (
                            <span>{diffDays}d</span>
                          )}
                          {diffDays >= 7 && diffDays < 14 && <span>1w</span>}
                          {diffDays >= 14 && diffDays < 21 && <span>2w</span>}
                          {diffDays >= 21 && diffDays < 28 && <span>3w</span>}
                          {diffDays >= 28 && diffDays < 35 && <span>1m</span>}
                        </div>
                      </div>
                      {state.expandedPosts.includes(i) && (
                        <span>
                          <div
                            className="postDate"
                            style={{
                              fontSize: "14px",
                              marginBottom: "10px",
                              color: "gainsboro",
                              width: "100%",
                            }}
                          >
                            {state.data.posts[i][1].title}
                            {!state.data.posts[i][1].redditMediaDomain &&
                              state.data.posts[i][1].urlDest !== undefined && (
                                <span> {outLinkDOM}</span>
                              )}
                            <br />
                            <div style={{ float: "right" }}>
                              {threadLinkDOM}
                            </div>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            {!state.data.posts[i][1].isVideo && (
                              <div className="centering">
                                <img
                                  src={imgSource}
                                  className="postImgStandard"
                                  alt="Reddit Post Thumbnail"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    minWidth: "275px",
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "missing.png";
                                  }}
                                />
                              </div>
                            )}
                            {state.data.posts[i][1].isVideo && (
                              <div className="centering">
                                <video
                                  id={"video" + i}
                                  className="postVideoStandard"
                                  height="100%"
                                  poster={state.data.posts[i][1].urlToImage}
                                  preload="auto"
                                  muted
                                  controls
                                >
                                  <source
                                    src={state.data.posts[i][1].media}
                                    type="video/mp4"
                                  />
                                </video>
                              </div>
                            )}
                          </div>
                        </span>
                      )}
                      {!state.expandedPosts.includes(i) && (
                        <span>
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
                              fontSize: "14px",
                              marginBottom: "20px",
                              color: "gainsboro",
                              float: "left",
                              width: "calc(100% - 120px)",
                              marginLeft: "10px",
                            }}
                          >
                            {state.data.posts[i][1].title}
                            {!state.data.posts[i][1].redditMediaDomain &&
                              state.data.posts[i][1].urlDest !== undefined && (
                                <span> {outLinkDOM}</span>
                              )}
                          </div>
                        </span>
                      )}
                      {!state.expandedPosts.includes(i) && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            marginLeft: "110px",
                          }}
                        >
                          {threadLinkDOM}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!state.data.posts[i][1].redditMediaDomain &&
                state.data.posts[i][1].urlDest !== undefined &&
                !loadableImg && <span> {outLinkDOM}</span>}

              {!loadableImg && (
                <div>
                  {!state.expandedPosts.includes(i) && (
                    <div
                      className="postDate"
                      style={{
                        fontSize: "13px",
                        marginTop: "5px",
                        color: "silver",
                      }}
                    >
                      {author}
                    </div>
                  )}
                  {state.expandedPosts.includes(i) && (
                    <div
                      className="postDate"
                      style={{
                        fontSize: "13px",
                        marginTop: "5px",
                        color: "silver",
                      }}
                    >
                      {author}
                    </div>
                  )}
                </div>
              )}
              {trends.length > 0 && (
                <div
                  style={{
                    width: "100%",
                    display: "inline-block",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "5px",
                      color: "gray",
                    }}
                  >
                    <span>{trendingWith}</span>
                  </div>
                </div>
              )}
              <div
                style={{
                  fontSize: "12px",
                  color: "gray",
                  marginTop: "5px",
                }}
              >
                {state.data.posts[i][1].awards > 0 && (
                  <span>
                    {numToString(state.data.posts[i][1].coins)} coins &bull;{" "}
                    {numToString(state.data.posts[i][1].awards)} awards &bull;{" "}
                  </span>
                )}
                <span>
                  {numToString(state.data.posts[i][1].comments)} comments
                </span>
              </div>
            </div>
          </div>
        );
      }
    }
  }

  /**
   * Expands post to show full image/video
   * @param {*} i - id of post to open
   */
  function openPost(i) {
    if (!state.expandedPosts.includes(i)) state.expandedPosts.push(i);
    else state.expandedPosts = state.expandedPosts.filter((e) => e !== i);

    setState({ ...state });
  }

  /**
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

  // Loading Objects
  let loadingDOM = (
    <div>
      <div
        className="loading"
        style={{
          margin: "14px 0px 15px 0px",
          width: "230px",
          height: "20px",
          border: "1.5px solid #292929",
          borderRadius: "20px",
        }}
      ></div>
      <div
        className="loading"
        style={{
          overflow: "auto",
          display: "inline-block",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1.5px solid #292929",
            borderRadius: "20px",
            height: "180px",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="centering">
      <div className="today">
        {state.loaded === false && (
          <div>
            <div className="centering">
              <div
                style={{
                  fontSize: "12px",
                  color: "gray",
                  marginTop: "0px",
                  marginBottom: "6px",
                  width: "90%",
                }}
              >
                <div
                  className="loading"
                  style={{
                    margin: "0px",
                    width: "100%",
                    height: "85px",
                    border: "1.5px solid #292929",
                    borderRadius: "20px",
                  }}
                ></div>
                {loadingDOM}
                {loadingDOM}
                {loadingDOM}
                {loadingDOM}
                {loadingDOM}
                {loadingDOM}
              </div>
            </div>
          </div>
        )}
        {state.loaded === true && state.error === false && (
          <div>
            <div className="centering">
              <div
                style={{
                  width: "90%",
                  borderBottom: "1px solid #222222",
                  marginBottom: "10px",
                }}
              >
                {state.sort === "all" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid DodgerBlue" }}
                  >
                    All
                  </button>
                )}
                {state.sort !== "all" && (
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
                        sort: "all",
                        data: state.allData,
                        expandedPosts: [],
                      })
                    }
                  >
                    All
                  </button>
                )}
                {state.sort === "news" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid DodgerBlue" }}
                  >
                    News
                  </button>
                )}
                {state.sort !== "news" && (
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
                        sort: "news",
                        data: state.newsData,
                        expandedPosts: [],
                      })
                    }
                  >
                    News
                  </button>
                )}
                {state.sort === "funny" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid DodgerBlue" }}
                  >
                    Funny
                  </button>
                )}
                {state.sort !== "funny" && (
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
                        sort: "funny",
                        data: state.funnyData,
                        expandedPosts: [],
                      })
                    }
                  >
                    Funny
                  </button>
                )}
                {state.sort === "sports" && (
                  <button
                    className="timeButton"
                    style={{ borderBottom: "3px solid DodgerBlue" }}
                  >
                    Sports
                  </button>
                )}
                {state.sort !== "sports" && (
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
                        sort: "sports",
                        data: state.sportData,
                        expandedPosts: [],
                      })
                    }
                  >
                    Sports
                  </button>
                )}
              </div>
            </div>

            <div className="centering">
              <div
                style={{
                  fontSize: "12px",
                  color: "gray",
                  marginTop: "0px",
                  marginBottom: "5px",
                  width: "90%",
                }}
              >
                <FormControl focused variant="standard" htmlFor="selectDate">
                  <InputLabel variant="standard">Date</InputLabel>
                  <NativeSelect
                    defaultValue={state.sortDate}
                    className={classes.root}
                    onChange={handleTimeChange}
                    id="selectDate"
                  >
                    <option value={"today"} style={{ color: "black" }}>
                      Today
                    </option>
                    <option value={"week"} style={{ color: "black" }}>
                      Week
                    </option>
                    <option value={"month"} style={{ color: "black" }}>
                      Month
                    </option>
                  </NativeSelect>
                </FormControl>
                <FormControl
                  focused
                  variant="standard"
                  style={{ marginLeft: "20px" }}
                >
                  <InputLabel variant="standard" htmlFor="selectSort">
                    Sort
                  </InputLabel>
                  <NativeSelect
                    defaultValue={state.sortBy}
                    className={classes.root}
                    onChange={handleSortChange}
                    id="selectSort"
                  >
                    <option value={"hot"} style={{ color: "black" }}>
                      Trending
                    </option>
                    <option value={"coins"} style={{ color: "black" }}>
                      Coins
                    </option>
                    <option value={"comments"} style={{ color: "black" }}>
                      Comments
                    </option>
                    <option value={"downvotes"} style={{ color: "black" }}>
                      Downvote Ratio
                    </option>
                  </NativeSelect>
                </FormControl>
              </div>
            </div>
            {postListDOM}

            {state.loaded === true && postListDOM.length === 0 && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    overflow: "auto",
                    display: "inline-block",
                    width: "90%",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      border: "1.5px solid #292929",
                      borderRadius: "20px",
                    }}
                  >
                    <p style={{ margin: "60px 0px 60px 0px" }}>
                      No results for this query were found <br />
                      Please check back soon for updates
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="centering">
              <div
                style={{
                  fontSize: "12px",
                  color: "gray",
                  marginTop: "10px",
                  marginBottom: "10px",
                  textAlign: "center",
                  maxWidth: "90%",
                }}
              >
                <div style={{ marginTop: "5px" }}>
                  Trends from{" "}
                  {state.data.stats.posts.count
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                  posts and {numToString(state.data.stats.comments.count)}{" "}
                  comments
                </div>
                <div
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    display: "inline-block",
                  }}
                >
                  <div className="statsInfo">
                    {numToString(state.data.stats.upvotes)} upvotes
                  </div>
                  <div className="statsInfo">
                    {numToString(state.data.stats.downvotes)} downvotes
                  </div>
                  <div className="statsInfo">
                    {numToString(state.data.stats.awards)} awards
                  </div>
                  <div className="statsInfo">
                    {numToString(state.data.stats.coins)} coins
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
