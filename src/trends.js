import axios from "axios";
import { useState, useEffect } from "react";
import ReactHlsPlayer from "react-hls-player";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@mui/material/NativeSelect";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SortRoundedIcon from "@mui/icons-material/SortRounded";

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
    sportsData: undefined,
    expandedPosts: [],
    showOptions: false,
  });

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false) {
      (async () => {
        // Names of all categories
        const categories = ["all", "news", "funny", "sports"];

        // Date when starting request
        const beforeDate = new Date();

        // Loading all category data from backend
        categories.map(async (category) => {
          await axios
            .get(
              process.env.REACT_APP_BACKEND +
                "posts/" +
                category +
                "?sort=" +
                state.sortBy +
                "&time=" +
                state.sortDate
            )
            .then((res) => {
              state[category + "Data"] = res.data;
            })
            .catch((err) => {
              console.log(err);
              state.error = true;
            });
        });

        // Date after request is finished
        const afterDate = new Date();

        // Update state
        if (componentMounted) {
          // Delay so load keyshine can complete one full pass (looks smoother/cleaner)
          setTimeout(() => {
            setState({
              ...state,
              loaded: true,
              data: state[state.sort + "Data"],
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

  // Handle Requst Post Removal Event
  const handleReport = (event) => {
    const d = new Date();
    const id = event.target.id.split("-")[1];
    const key = "upvotestats-hidden-" + d.getMonth() + "-" + d.getFullYear();

    // Initializing stored key value pair
    if (localStorage.getItem(key) === null) localStorage.setItem(key, "");

    // Storing url of removed posts requested user
    localStorage.setItem(key, localStorage.getItem(key) + " " + postLinks[id]);

    setState({
      ...state,
      loaded: false,
      expandedPosts: [],
    });
  };

  // Dropdown menu styling
  const useStyles = makeStyles({
    root: {
      "& .MuiNativeSelect-select": {
        color: "silver",
        padding: "5px",
        fontSize: "13px",
        height: "25px",
      },
      "& .MuiNativeSelect-icon": {
        color: "gray",
      },
    },
    root2: {
      "& .MuiNativeSelect-root": {
        border: "none",
      },
      "& .MuiNativeSelect-select": {
        color: "silver",
        padding: "5px",
        fontSize: "13px",
        height: "0px",
        borderStyle: "hidden",
        width: "5px",
      },
      "& .MuiNativeSelect-icon": {
        color: "gray",
        fontSize: "medium",
        marginTop: "3.2px",
      },
    },
  });

  // Material UI Styling
  const classes = useStyles();

  let postListDOM = []; // DOM for posts
  let postLinks = []; // ids of all posts

  // If data was loaded properly
  if (state.loaded && !state.error) {
    const posts = state.data.posts;
    // Creating DOM for posts
    if (posts !== undefined) {
      for (let i = 0; i < posts.length && postListDOM.length < 30; i++) {
        // Skip deleted posts
        if (posts[i][1].text === "[deleted]") continue;

        // Skip potential duplicates
        if (postLinks.includes(posts[i][1].url)) continue;

        // Key of hidden posts requested user (new key every month)
        const d = new Date();
        const removeKey =
          "upvotestats-hidden-" + d.getMonth() + "-" + d.getFullYear();

        // Initializing stored key value pair
        if (localStorage.getItem(removeKey) === null)
          localStorage.setItem(removeKey, "");

        // Getting list of all posts
        let removedList = localStorage.getItem(removeKey).split(" ");
        removedList = removedList.filter((url) => url.includes("reddit.com"));

        // Skip posts the user has requested to remove
        if (removedList.includes(posts[i][1].url)) continue;

        // Date since post published
        const timeInDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(posts[i][1].publishedAt);
        const secondDate = new Date();
        const diffDays = Math.round(
          Math.abs((firstDate - secondDate) / timeInDay)
        );

        // hours since post
        const hours = Math.abs(firstDate - secondDate) / (60 * 60 * 1000);

        let blurred = false;
        // Adding blur to posts with images that are NSFW/Spoiler
        if (posts[i][1].urlDest !== undefined) {
          if (posts[i][1].nsfw || posts[i][1].spoiler) {
            blurred = true;

            // changing thumbnail to img source
            posts[i][1].urlToImage = posts[i][1].source;
          }
        }

        // Setting thumbnail to source
        if (posts[i][1].urlToImage === "image")
          posts[i][1].urlToImage = posts[i][1].source;

        // Determine whether to show image
        let loadableImg =
          posts[i][1].urlToImage !== null &&
          posts[i][1].urlToImage !== "" &&
          posts[i][1].urlToImage !== "default" &&
          posts[i][1].urlToImage !== "self" &&
          posts[i][1].urlDest !== undefined;

        // DOM for "trending with" section
        let trendingWith = [];
        const trends = posts[i][1].trends;

        // Load trends until width would be too large to fit all in one line
        for (let t = 1; t < trends.length; t++) {
          trendingWith.push(
            <div
              style={{
                color: "silver",
                borderRadius: "10px",
                border: "1px solid #222222",
                padding: "5px",
                float: "left",
                marginRight: "5px",
                marginTop: "10px",
                backgroundImage:
                  "linear-gradient(0deg,transparent 1%, rgb(255,255,255,0.05) 99%",
              }}
              key={"trendWith-" + i + "-" + t}
            >
              {trends[t]}
            </div>
          );
        }

        // Default post img body css
        let imgBodyCSS = {
          display: "inline-block",
          width: "100%",
          marginTop: "5px",
        };
        // Default post text body css
        let textBodyCSS = {
          fontSize: "13px",
          marginTop: "5px",
          color: "silver",
        };

        // Arary of words in title and text
        const titleParts = posts[i][1].title.trim().split(/\s+/);
        const textParts = posts[i][1].text.trim().split(/\s+/);

        // Break by letter if word is very long (long links or words)
        if (hasLongWords(titleParts) || hasLongWords(textParts)) {
          imgBodyCSS["wordBreak"] = "break-all";
          textBodyCSS["wordBreak"] = "break-all";
        }

        // Image Source
        const imgSource = posts[i][1].redditMediaDomain
          ? posts[i][1].urlDest
          : posts[i][1].source === undefined
          ? posts[i][1].urlToImage
          : posts[i][1].source;

        const thumbnail = (
          <img
            src={posts[i][1].urlToImage}
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
        );

        // Link Destination as String
        let destLink = posts[i][1].urlDest;
        if (destLink !== undefined) {
          destLink = destLink.replace("https://", "");
          destLink = destLink.replace("http://", "");
          destLink = destLink.replace("www.", "");
          destLink = destLink.substring(0, 15) + "...";
        }

        // Destination Link DOM
        const outLinkDOM = (
          <div style={{ display: "inline-block", width: "100%" }}>
            <a
              href={posts[i][1].urlDest}
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
        const threadLinkDOM = (
          <a
            href={posts[i][1].url}
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
        const author = (
          <span>
            {hours <= 24 && <span>{Math.floor(hours)}h ago</span>}
            {hours > 24 && hours <= 48 && <span>1d ago</span>}
            {hours > 48 && diffDays < 7 && <span>{diffDays}d ago</span>}
            {diffDays >= 7 && diffDays < 14 && <span>1w ago</span>}
            {diffDays >= 14 && diffDays < 21 && <span>2w ago</span>}
            {diffDays >= 21 && diffDays < 28 && <span>3w ago</span>}
            {diffDays >= 28 && diffDays < 35 && <span>1m ago</span>} by{" "}
            <a
              className="searchLink2"
              href={"https://www.reddit.com/u/" + posts[i][1].author}
              rel="noreferrer"
              target="_blank"
            >
              {posts[i][1].author}
            </a>
            {state.expandedPosts.includes(i) && (
              <div style={{ float: "right", marginRight: "20px" }}>
                {threadLinkDOM}
              </div>
            )}
          </span>
        );

        // Post Upvote Ratio DOM
        const percentUpvoted = (
          <div
            style={{
              float: "left",
              fontSize: "13px",
              color: "gray",
            }}
          >
            {Math.floor(
              (100 * posts[i][1].upvotes) /
                (Math.abs(posts[i][1].downvotes) + posts[i][1].upvotes)
            )}
            % Upvoted
          </div>
        );

        // Whether post is streamable video link
        const streamable =
          posts[i][1].urlDest !== undefined &&
          posts[i][1].urlDest.includes("streamable.com");

        // Getting streamable embed link
        let streamableLink = "";
        if (streamable) {
          const parts = posts[i][1].urlDest.split("/");
          streamableLink =
            "https://streamable.com/e/" + parts[parts.length - 1];
        }

        // Whether post is gfycat gif
        const gfycat =
          posts[i][1].urlDest !== undefined &&
          posts[i][1].urlDest.includes("gfycat.com");

        // Getting gfycat embed link
        let gfycatLink = "";
        if (gfycat) {
          const parts = posts[i][1].urlDest.split("/");
          gfycatLink = "https://gfycat.com/ifr/" + parts[parts.length - 1];
        }

        // Whether post is imgur
        const imgur =
          posts[i][1].urlDest !== undefined &&
          posts[i][1].urlDest.includes("imgur.com");

        // Getting imgur embed link
        let imgurLink = "";
        if (imgur) {
          let parts = posts[i][1].urlDest.split("/");
          parts = parts[parts.length - 1].split(".");
          imgurLink = "https://imgur.com/" + parts[0] + "/embed";
        }

        // Content warnings such as NSFW and Spoilers
        const contentWarnings = (
          <span>
            {posts[i][1].nsfw && (
              <span
                style={{
                  color: "indianred",
                  border: "1px solid indianred",
                  padding: "0px 2px 0px 2px",
                  borderRadius: "3px",
                  fontSize: "10.5px",
                  marginLeft: "10px",
                }}
              >
                NSFW
              </span>
            )}
            {posts[i][1].spoiler && (
              <span
                style={{
                  color: "gray",
                  border: "1px solid gray",
                  padding: "0px 2px 0px 2px",
                  borderRadius: "3px",
                  fontSize: "10.5px",
                  marginLeft: "10px",
                }}
              >
                SPOILER
              </span>
            )}
          </span>
        );

        // List of post links
        postLinks.push(posts[i][1].url);
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
                e.target.className !== "searchLink2" &&
                e.target.className !== "iconImg" &&
                !e.target.id.includes("report") &&
                e.target.id !== "threadLink"
              )
                openPost(i);
            }}
          >
            <div className="postLink">
              <div
                className="newsText"
                style={{ float: "left", overflow: "hidden", width: "100%" }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    marginBottom: "5px",
                    color: "gray",
                    width: "100%",
                  }}
                >
                  {postListDOM.length + 1} &bull;{" "}
                  <a
                    className="searchLink"
                    href={"https://www.reddit.com/r/" + posts[i][1].subreddit}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {posts[i][1].subName}
                  </a>{" "}
                  &bull; {numToString(posts[i][1].upvotes)} &uarr; &bull;{" "}
                  {numToString(Math.abs(posts[i][1].downvotes))} &darr;
                  <div style={{ float: "right", display: "inline-block" }}>
                    <NativeSelect
                      disableUnderline
                      className={classes.root2}
                      id={"report-" + postListDOM.length}
                      onChange={handleReport}
                      IconComponent={MoreHorizIcon}
                      defaultValue="default"
                    >
                      <option value="default" hidden disabled>
                        Not interested?
                      </option>
                      <option value={"interest"} style={{ color: "black" }}>
                        Hide this post
                      </option>
                      <option value={"report"} style={{ color: "black" }}>
                        Report this post
                      </option>
                    </NativeSelect>
                  </div>
                </div>

                {posts[i][1].trends.length > 0 && (
                  <div style={{ fontSize: "14px" }}>
                    <b>{posts[i][1].trends[0]}</b>
                  </div>
                )}

                {!loadableImg && (
                  <div style={{ fontSize: "14px", marginTop: "5px" }}>
                    {posts[i][1].title}
                    {contentWarnings}
                  </div>
                )}

                {posts[i][1].text.length > 0 && (
                  <div style={textBodyCSS}>
                    {!state.expandedPosts.includes(i) && (
                      <span>
                        {posts[i][1].text.substring(0, 160)}
                        {posts[i][1].text.length > 160 && (
                          <span>... [click text to read more]</span>
                        )}
                      </span>
                    )}
                    {state.expandedPosts.includes(i) && (
                      <span>
                        {posts[i][1].text}
                        <div style={{ marginRight: "20px" }}>
                          {percentUpvoted}
                        </div>
                      </span>
                    )}
                  </div>
                )}
                {posts[i][1].text.length === 0 && (
                  <div
                    style={{
                      fontSize: "13px",
                      marginTop: "5px",
                      color: "silver",
                    }}
                  >
                    {state.expandedPosts.includes(i) && !loadableImg && (
                      <div
                        style={{
                          marginRight: "20px",
                        }}
                      >
                        {percentUpvoted}
                      </div>
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
                        <a
                          href={
                            "https://www.reddit.com/u/" + posts[i][1].author
                          }
                          rel="noreferrer"
                          target="_blank"
                        >
                          {posts[i][1].icon === "" && (
                            <img
                              className="iconImg"
                              src="https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png"
                              alt={posts[i][1].author + " icon"}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "missing.png";
                              }}
                            />
                          )}
                          {posts[i][1].icon !== "" && (
                            <img
                              className="iconImg"
                              src={posts[i][1].icon}
                              alt={posts[i][1].author + " icon"}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "missing.png";
                              }}
                            />
                          )}
                        </a>
                        <div
                          style={{
                            float: "left",
                            marginTop: "6.5px",
                            marginBottom: "6.5px",
                            marginLeft: "5px",
                          }}
                        >
                          <a
                            className="searchLink2"
                            href={
                              "https://www.reddit.com/u/" + posts[i][1].author
                            }
                            rel="noreferrer"
                            target="_blank"
                          >
                            {posts[i][1].author}
                          </a>{" "}
                          &bull;{" "}
                          {hours <= 24 && <span>{Math.floor(hours)}h</span>}
                          {hours > 24 && hours <= 48 && <span>1d</span>}
                          {hours > 48 && diffDays < 7 && (
                            <span>{diffDays}d</span>
                          )}
                          {diffDays >= 7 && diffDays < 14 && <span>1w</span>}
                          {diffDays >= 14 && diffDays < 21 && <span>2w</span>}
                          {diffDays >= 21 && diffDays < 28 && <span>3w</span>}
                          {diffDays >= 28 && diffDays < 35 && <span>1m</span>}
                          {contentWarnings}
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
                            {posts[i][1].title}
                            {!posts[i][1].redditMediaDomain &&
                              posts[i][1].urlDest !== undefined && (
                                <span> {outLinkDOM}</span>
                              )}
                            <br />
                            <br />
                            {percentUpvoted}
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
                            {!posts[i][1].isVideo &&
                              !streamable &&
                              !gfycat &&
                              !imgur && (
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
                            {posts[i][1].isVideo && (
                              <div className="centering">
                                <ReactHlsPlayer
                                  src={posts[i][1].media}
                                  muted={true}
                                  controls={true}
                                  loop={true}
                                  width="100%"
                                  id={"video" + i}
                                  className="postVideoStandard"
                                  height="100%"
                                  poster={posts[i][1].urlToImage}
                                />
                              </div>
                            )}
                            {streamable && (
                              <div
                                style={{
                                  width: "100%",
                                  height: "0px",
                                  position: "relative",
                                  paddingBottom: "56.250%",
                                }}
                              >
                                <iframe
                                  src={streamableLink}
                                  frameBorder="0"
                                  width="100%"
                                  height="100%"
                                  allowFullScreen
                                  title={posts[i][1].title + "-streamable-" + i}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    position: "absolute",
                                  }}
                                ></iframe>
                              </div>
                            )}
                            {gfycat && (
                              <div
                                style={{
                                  position: "relative",
                                  paddingBottom: "calc(70.80% + 44px)",
                                }}
                              >
                                <iframe
                                  src={gfycatLink}
                                  frameBorder="0"
                                  scrolling="no"
                                  width="100%"
                                  height="100%"
                                  title={posts[i][1].title + "-gfycat-" + i}
                                  style={{
                                    position: "absolute",
                                    top: "0",
                                    left: "0",
                                  }}
                                  allowFullScreen
                                ></iframe>
                              </div>
                            )}
                            {imgur && (
                              <div
                                style={{
                                  position: "relative",
                                  paddingBottom: "100%",
                                }}
                              >
                                <iframe
                                  src={imgurLink}
                                  frameBorder="0"
                                  width="100%"
                                  height="100%"
                                  title={posts[i][1].title + "-imgur-" + i}
                                  style={{
                                    position: "absolute",
                                    top: "0",
                                    left: "0",
                                  }}
                                  allowFullScreen
                                ></iframe>
                              </div>
                            )}
                          </div>
                        </span>
                      )}
                      {!state.expandedPosts.includes(i) && (
                        <span>
                          {!blurred && <span>{thumbnail}</span>}
                          {blurred && (
                            <div className="blurOuter">
                              <div className="blur">{thumbnail}</div>
                            </div>
                          )}
                          <div
                            className="postDate"
                            style={{
                              fontSize: "14px",
                              color: "gainsboro",
                              float: "left",
                              width:
                                window.innerWidth > 600
                                  ? "calc(100% - 120px)"
                                  : "calc(100% - 90px)",
                              marginLeft: "10px",
                            }}
                          >
                            {posts[i][1].title}
                            {!posts[i][1].redditMediaDomain &&
                              posts[i][1].urlDest !== undefined && (
                                <span> {outLinkDOM}</span>
                              )}
                          </div>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!posts[i][1].redditMediaDomain &&
                posts[i][1].urlDest !== undefined &&
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
                      color: "gray",
                      overflow: "hidden",
                      height: state.expandedPosts.includes(i) ? "100%" : "38px",
                    }}
                  >
                    {trendingWith}
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
                {posts[i][1].awards > 0 && (
                  <span>
                    {numToString(posts[i][1].coins)} coins &bull;{" "}
                    {numToString(posts[i][1].awards)} awards &bull;{" "}
                  </span>
                )}

                <a
                  href={posts[i][1].url}
                  target="_blank"
                  rel="noreferrer"
                  className="searchLink"
                >
                  {numToString(posts[i][1].comments)} comments
                </a>
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
   * Determine if title/text has a really long word
   * @param {*} text - text to search through
   * @returns whether text contains long words
   */
  function hasLongWords(text) {
    for (let t = 0; t < text.length; t++) {
      if (text[t].length > 21) return true;
    }
    return false;
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

  /**
   * Creates menu button for specific cateogry
   * @param {*} category - category to create menu for
   * @returns DOM for category menu button
   */
  function menuCategory(category) {
    return (
      <span>
        {state.sort === category && (
          <button
            className="timeButton"
            style={{ borderBottom: "3px solid DodgerBlue" }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        )}
        {state.sort !== category && (
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
                sort: category,
                data: state[category + "Data"],
                expandedPosts: [],
              })
            }
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        )}
      </span>
    );
  }

  // Loading Objects
  const loadingDOM = (
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
            height: window.innerWidth > 600 ? "180px" : "120px",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="centering">
      <div className="today">
        {!state.loaded && (
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
                    height: state.showOptions ? "138px" : "78px",
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
        {state.loaded && !state.error && (
          <div>
            <div className="centering">
              <div
                style={{
                  width: "90%",
                  borderBottom: "1px solid #222222",
                  marginBottom: "10px",
                }}
              >
                {menuCategory("all")}
                {menuCategory("news")}
                {menuCategory("funny")}
                {menuCategory("sports")}
              </div>
            </div>
            <div className="centering">
              <div
                style={{
                  fontSize: "16px",
                  color: "gainsboro",
                  width: "90%",
                }}
              >
                <b>Trends on Reddit</b>
                <button
                  className="sortButton2"
                  style={{ padding: "2px 0px 0px 0px" }}
                  onClick={() =>
                    setState({
                      ...state,
                      showOptions: state.showOptions ? false : true,
                    })
                  }
                >
                  <div
                    style={{
                      float: "right",
                      fontWeight: "bold",
                    }}
                  >
                    SORT
                  </div>
                  <div
                    style={{
                      float: "right",
                      marginTop: "-7.16%",
                      marginRight: "3px",
                    }}
                  >
                    <SortRoundedIcon fontSize="medium" />
                  </div>
                </button>
              </div>
            </div>

            {state.showOptions && (
              <div className="centering">
                <div
                  style={{
                    fontSize: "12px",
                    color: "gray",
                    marginTop: "5px",
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
                      IconComponent={ExpandMoreIcon}
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
                      IconComponent={ExpandMoreIcon}
                      id="selectSort"
                      width="100%"
                    >
                      <option value={"hot"} style={{ color: "black" }}>
                        Popular
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
            )}
            {postListDOM}

            {state.loaded && postListDOM.length === 0 && (
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
        {state.loaded && state.error && (
          <div>
            <div className="centering">
              <img src="errorImg.jpg" alt="error koala" width="250px" />
            </div>
            <div className="centering">
              <span style={{ fontSize: "20px" }}>
                <b>Sorry, something went wrong</b>
              </span>
            </div>
            <br />
            <div className="centering">
              <span style={{ textAlign: "center", fontSize: "13px" }}>
                Try reloading the page. I'm working hard to fix
              </span>
            </div>
            <div className="centering">
              <span style={{ textAlign: "center", fontSize: "13px" }}>
                Upvote Stats for you as quick as possible.
              </span>
            </div>
            <div className="centering">
              <button
                onClick={() => (window.location.href = "trends")}
                className="reloadButton"
              >
                RELOAD
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
