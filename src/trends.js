import axios from "axios";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import ReactHlsPlayer from "react-hls-player";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { InView } from "react-intersection-observer";
import { makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@mui/material/NativeSelect";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

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
    expandAll: false,
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
        await Promise.all(
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
              .catch(() => (state.error = true));
          })
        );

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

  // Handle Request Post Removal Event
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
        // Skip deleted, cross, or duped posts
        if (posts[i][1].text === "[deleted]") continue;
        if (posts[i][1].author === "[deleted]") continue;
        if (posts[i][1].isCrossPost) continue;
        if (postLinks.includes(posts[i][1].url)) continue;
        if (posts[i][1].subreddit.startsWith("u_")) continue;
        if (posts[i][1].trends.length < 3) continue;

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

        // Setting thumbnail to source if thumbnail not available
        if (posts[i][1].source !== undefined) {
          if (
            posts[i][1].urlToImage === "image" ||
            posts[i][1].urlToImage === "default"
          )
            posts[i][1].urlToImage = posts[i][1].source;
        }

        // Setting source to specific image in reddit gallery
        if (posts[i][1].isGallery && !posts[i][1].isVideo) {
          if (posts[i][1].mediaMetadata.length > 0) {
            posts[i][1].source =
              posts[i][1].mediaMetadata[posts[i][1].galleryItem];
          }
        }

        // Determine whether to show image
        const loadableImg =
          posts[i][1].urlToImage !== undefined &&
          posts[i][1].urlToImage !== null &&
          posts[i][1].urlToImage !== "" &&
          posts[i][1].urlToImage !== "default" &&
          posts[i][1].urlToImage !== "self" &&
          (posts[i][1].source !== undefined ||
            posts[i][1].urlToImage.includes("https")) &&
          posts[i][1].urlDest !== undefined;

        // DOM for "trending with" section
        let trendingWith = [];
        const trends = posts[i][1].trends;

        // Load dom for all sub level trends
        for (let t = 1; t < trends.length; t++) {
          trendingWith.push(
            <span
              style={{
                color: "silver",
                marginRight: "5px",
              }}
              key={"trendWith-" + i + "-" + t}
            >
              {trends[t]}
              {t < trends.length - 1 && <span>,</span>}
            </span>
          );
        }

        // Arary of words in title and text
        let postTitle = posts[i][1].title;
        let postText = posts[i][1].text;

        // Adding content warning tags in text, later to be converted in markdown
        if (loadableImg) {
          if (posts[i][1].nsfw) postTitle = "![NSFW](0) " + postTitle;
          if (posts[i][1].spoiler) postTitle = "![SPOILER](0) " + postTitle;
        } else {
          if (posts[i][1].nsfw) postTitle += " ![NSFW](2.5)";
          if (posts[i][1].spoiler) postTitle += " ![SPOILER](2.5)";
        }

        // Break by character if word is very long (long links or words)
        postTitle = breakLongWords(postTitle);
        postText = breakLongWords(postText);
        postTitle = breakLongCharacters(postTitle);
        postText = breakLongCharacters(postText);

        // Image Source
        const imgSource = posts[i][1].redditMediaDomain
          ? posts[i][1].urlDest
          : posts[i][1].source === undefined
          ? posts[i][1].urlToImage
          : posts[i][1].source;

        // Image thumbnail
        const thumbnail = (
          <img
            src={posts[i][1].urlToImage}
            className="postImgStandard"
            alt="Reddit Post Thumbnail"
            loading="lazy"
            style={{
              float: "left",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "missing.png";
            }}
          />
        );

        // Post author information
        const author = (
          <div
            className="postDate"
            style={{
              fontSize: "13px",
              color: "silver",
              marginTop: "5px",
            }}
          >
            {hours <= 24 && <span>{Math.floor(hours)}h</span>}
            {hours > 24 && diffDays < 7 && <span>{diffDays}d</span>}
            {diffDays >= 7 && <span>{Math.floor(diffDays / 7)}w</span>} ago by{" "}
            <a
              className="searchLink2"
              href={"https://www.reddit.com/u/" + posts[i][1].author}
              rel="noreferrer"
              target="_blank"
            >
              {posts[i][1].author}
            </a>
          </div>
        );

        // Link Destination converted to string
        let destLink = posts[i][1].urlDest;
        if (destLink !== undefined) {
          destLink = destLink.replace("https://", "");
          destLink = destLink.replace("http://", "");
          destLink = destLink.replace("www.", "");
          destLink = destLink.substring(0, 15) + "...";
        }

        // Destination Link DOM
        const outLinkDOM = (
          <span>
            {!posts[i][1].redditMediaDomain &&
              posts[i][1].urlDest !== undefined && (
                <div
                  style={{
                    display: "inline-block",
                    width: "100%",
                    marginTop: "5px",
                  }}
                >
                  <a
                    href={posts[i][1].urlDest}
                    target="_blank"
                    rel="noreferrer"
                    className="searchLink"
                    style={{
                      fontSize: "13px",
                      color: "DodgerBlue",
                      float: "left",
                    }}
                  >
                    {destLink}
                    <img
                      id="threadLink"
                      src="outbound.png"
                      alt={"outbound icon"}
                      width="13px"
                      height="13px"
                      loading="lazy"
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
              )}
          </span>
        );

        // Post thread link DOM
        const threadLinkDOM = (
          <span>
            {isExpanded(i) && (
              <div
                style={{
                  marginTop: "5px",
                  overflow: "auto",
                }}
              >
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
                <a
                  href={posts[i][1].url}
                  target="_blank"
                  rel="noreferrer"
                  className="searchLink"
                  id="threadLink"
                  style={{ float: "right", fontSize: "13px" }}
                >
                  View thread
                </a>
              </div>
            )}
          </span>
        );

        // Markdown DOM for post text
        const markdown = (text) => (
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                // eslint-disable-next-line
                <a
                  className="searchLink"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "dodgerblue" }}
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p style={{ margin: "0px" }} {...props} />
              ),
              strong: ({ node, ...props }) => <span {...props} />,
              em: ({ node, ...props }) => (
                <span style={{ wordBreak: "break-all" }} {...props} />
              ),
              img: ({ node, ...props }) => (
                <span
                  {...props}
                  style={{
                    color: "indianred",
                    border: "1px solid indianred",
                    padding: "0px 2px 0px 2px",
                    borderRadius: "3px",
                    fontSize: "10px",
                    marginLeft: props.src + "px",
                    marginRight: "2.5px",
                  }}
                >
                  {props.alt}
                </span>
              ),
              li: () => <span></span>,
              ol: () => <span></span>,
              ul: () => <span></span>,
            }}
            children={text}
            remarkPlugins={[remarkGfm]}
          />
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
                e.target.id !== "threadLink" &&
                e.target.className.baseVal === undefined &&
                !state.expandAll
              )
                openPost(i);
            }}
          >
            <div className="postLink" id={"trends-" + i}>
              <InView
                as="div"
                threshold={0.1}
                onChange={(inView, entry) => {
                  let elm = document.getElementById("trends-" + i);
                  if (inView) {
                    elm.style.opacity = "1";
                  } else {
                    elm.style.opacity = "0";
                  }
                }}
              >
                <div
                  className="newsText"
                  style={{ float: "left", overflow: "hidden", width: "100%" }}
                >
                  {/* Post rank, subreddit name, and options button */}
                  <div
                    style={{
                      fontSize: "13px",
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
                    &bull; {numToString(posts[i][1].upvotes)} &uarr;
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

                  {/* Main Trend associated with post */}
                  <div style={{ fontSize: "14px", marginBottom: "5px" }}>
                    <b>
                      {posts[i][1].trends.length > 0
                        ? posts[i][1].trends[0]
                        : posts[i][1].subName}
                    </b>
                  </div>

                  {/* Post title, if no image */}
                  {!loadableImg && (
                    <div
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      {markdown(postTitle)}
                    </div>
                  )}

                  {/* Post text if available */}
                  {posts[i][1].text.length > 0 && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "silver",
                        paddingTop: "5px",
                      }}
                    >
                      {!isExpanded(i) && (
                        <div className="limitText4">
                          {posts[i][1].spoiler
                            ? markdown("Text hidden... [click to read more]")
                            : markdown(postText)}
                        </div>
                      )}
                      {isExpanded(i) && <div>{markdown(postText)}</div>}
                      {!loadableImg && (
                        <span>
                          {author}
                          {outLinkDOM}
                          {threadLinkDOM}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Post text if unavailable */}
                  {posts[i][1].text.length === 0 && !loadableImg && (
                    <span>
                      {author}
                      {outLinkDOM}
                      {threadLinkDOM}
                    </span>
                  )}
                </div>

                {/* Post with image */}
                {loadableImg && (
                  <div
                    className="imgBody"
                    style={{
                      display: "inline-block",
                      width: "100%",
                      marginTop: "5px",
                    }}
                  >
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
                        {/* Post author name, icon and creation date */}
                        <div
                          style={{
                            width: "100%",
                            display: "inline-block",
                            marginBottom: "5px",
                            fontSize: "13px",
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
                            <img
                              className="iconImg"
                              src={
                                posts[i][1].icon !== ""
                                  ? posts[i][1].icon
                                  : "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png"
                              }
                              loading="lazy"
                              alt={posts[i][1].author + " icon"}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "missing.png";
                              }}
                            />
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
                            {hours > 24 && diffDays < 7 && (
                              <span>{diffDays}d</span>
                            )}
                            {diffDays >= 7 && (
                              <span>{Math.floor(diffDays / 7)}w</span>
                            )}
                          </div>
                        </div>

                        {/* Expanded post with image */}
                        {isExpanded(i) && (
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
                              {markdown(postTitle)}
                              {outLinkDOM}
                              {threadLinkDOM}
                            </div>
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              {/* Post is not a video */}
                              {!posts[i][1].isVideo && !streamable && (
                                <span>
                                  {/* Post is a gallery with multiple images */}
                                  {posts[i][1].isGallery && (
                                    <div
                                      className="centering"
                                      style={{ marginBottom: "10px" }}
                                    >
                                      <ArrowCircleLeftIcon
                                        className="nextButton"
                                        onClick={() => {
                                          let currIndex =
                                            posts[i][1].galleryItem;
                                          // getting next index for gallery item
                                          posts[i][1].galleryItem = Math.max(
                                            0,
                                            posts[i][1].galleryItem - 1
                                          );
                                          // if index changed, update
                                          if (
                                            currIndex !==
                                            posts[i][1].galleryItem
                                          ) {
                                            setState({
                                              ...state,
                                            });
                                          }
                                        }}
                                      />
                                      <div
                                        style={{
                                          marginLeft: "10px",
                                          marginRight: "10px",
                                          border: "1px solid gray",
                                          borderRadius: "10px",
                                          padding: "5px 5px 5px 5px",
                                          fontSize: "11px",
                                          width: "60px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {posts[i][1].galleryItem + 1}
                                        &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
                                        {posts[i][1].mediaMetadata.length}
                                      </div>
                                      <ArrowCircleRightIcon
                                        className="nextButton"
                                        onClick={() => {
                                          let currIndex =
                                            posts[i][1].galleryItem;
                                          // getting next index for gallery item
                                          posts[i][1].galleryItem = Math.min(
                                            posts[i][1].mediaMetadata.length -
                                              1,
                                            posts[i][1].galleryItem + 1
                                          );
                                          // if index changed, update
                                          if (
                                            currIndex !==
                                            posts[i][1].galleryItem
                                          ) {
                                            setState({
                                              ...state,
                                            });
                                          }
                                        }}
                                      />
                                    </div>
                                  )}
                                  {/* Post image */}
                                  <div className="centering">
                                    <img
                                      src={imgSource}
                                      className="postImgStandard"
                                      alt="Reddit Post Thumbnail"
                                      loading="lazy"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        maxHeight: "50vh",
                                        objectFit: "contain",
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "missing.png";
                                      }}
                                    />
                                  </div>
                                </span>
                              )}
                              {/* Post video */}
                              {posts[i][1].isVideo && (
                                <InView
                                  as="div"
                                  threshold={0.3}
                                  onChange={(inView, entry) => {
                                    let video = document.getElementById(
                                      "video" + i
                                    );
                                    if (inView) video.play();
                                    else video.pause();
                                  }}
                                >
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
                                      poster={posts[i][1].source}
                                      webkit-playsinline="true"
                                      playsInline={true}
                                    />
                                  </div>
                                </InView>
                              )}
                              {/* Post is a streamable.com video */}
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
                                    title={
                                      posts[i][1].title + "-streamable-" + i
                                    }
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      position: "absolute",
                                    }}
                                  ></iframe>
                                </div>
                              )}
                            </div>
                          </span>
                        )}

                        {/* Collapsed post with thumbnail */}
                        {!isExpanded(i) && (
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
                                marginLeft: "10px",
                              }}
                            >
                              <span className="limitText3">
                                {markdown(postTitle)}
                              </span>
                              {outLinkDOM}
                            </div>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section for other trending phrases */}
                {trends.length > 1 && (
                  <div
                    style={{
                      width: "100%",
                      display: "inline-block",
                      marginTop: "5px",
                      fontSize: "13px",
                      color: "gray",
                    }}
                  >
                    {isExpanded(i) && trendingWith}
                    {!isExpanded(i) && (
                      <span className="limitText2">{trendingWith}</span>
                    )}
                  </div>
                )}

                {/* Post statistics */}
                <div
                  style={{
                    fontSize: "13px",
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
              </InView>
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
    // adding/removing to expanded posts list
    if (!isExpanded(i)) state.expandedPosts.push(i);
    else state.expandedPosts = state.expandedPosts.filter((e) => e !== i);

    setState({ ...state });
  }

  /**
   * Break up long words by adding em tag in markdown which
   * react markdown will turn into a span with the break-all property
   * @param {*} text - text to search through
   * @returns array of text with long words surrounded by em markdown tag
   */
  function breakLongWords(text) {
    // getting array of text surrounded by brackets
    let m = text.match(/\[(.*?)\]/g);
    let m2 = text.match(/\[(.*?)\[(.*?)\](.*?)\]/g);

    if (m !== null) {
      // combining arrays of text that are enclosed by brackets
      if (m2 !== null) m = m.concat(m2.filter((item) => m.indexOf(item) < 0));
      // replacing spaces with ":s:" in text, goal is to keep link
      // and url markdown as one after being seperated by spaces
      for (let i = 0; i < m.length; i++) {
        let r = m[i].replace(/\s+/g, ":s:");
        text = text.replace(m[i], r);
      }
    }

    // getting array of text surrouned by parentheses
    let p = text.match(/\((.*?)\)/g);
    if (p !== null) {
      // replacing spaces with "%20" in text that contains markdown link
      for (let i = 0; i < p.length; i++) {
        if (p[i].includes("https://") || p[i].includes("http://")) {
          let r = p[i].replace(/\s+/g, "%20");
          text = text.replace(p[i], r);
        }
      }
    }

    // splitting text by spaces
    text = text.split(/\s+/);

    // Loop through each word in text array
    for (let t = 0; t < text.length; t++) {
      const isMarkdownLink = text[t].match(/\[(.*?)\]\((.*?)\)/g) !== null;

      // text that will actually be viewable (href links are hidden)
      let visibleText = text[t];
      // Remove ref and keep title from markdown link
      if (isMarkdownLink) {
        p = text[t].match(/\((.*?)\)/g);
        if (p !== null) {
          // getting visible text from markdown link
          for (let i = 0; i < p.length; i++) {
            if (p[i].includes("https://") || p[i].includes("http://"))
              visibleText = visibleText.replace(p[i], "");
          }
        }
      }

      // replace ":s:" with regular spaces
      text[t] = text[t].replace(/:s:/g, " ");
      visibleText = visibleText.replace(/:s:/g, " ");

      // getting the length of the longest word
      let maxLength = visibleText.split(/\s+/g).map((n) => (n = n.length));
      maxLength = maxLength.reduce((max, n) => Math.max(max, n));

      // Add markdown that will convert to a span with break-all
      if (maxLength > 25) text[t] = "***" + text[t] + "***";
    }

    return text.join(" ");
  }

  /**
   * Break up text with long non letter/number characters
   * @param {*} text - text to search through
   * @returns array of text with long characters seperated by space
   */
  function breakLongCharacters(text) {
    text = text.split(/\s+/);
    let consecutiveNonLetters = 0;

    // Loop through characters
    for (let t = 0; t < text.length; t++) {
      for (let c = 0; c < text[t].length; c++) {
        let ch = text[t].charCodeAt(c);
        // char is letter or number
        let isLetterOrNum =
          (ch > 64 && ch < 91) || (ch > 96 && ch < 123) || (ch > 47 && ch < 58);

        if (isLetterOrNum) consecutiveNonLetters = 0;

        // text has long non consecutive non letters/numbers, seperate with space
        if (consecutiveNonLetters > 25) {
          text[t] = text[t].slice(0, c) + " " + text[t].slice(c);
          consecutiveNonLetters = 0;
        }

        if (!isLetterOrNum) consecutiveNonLetters++;
      }
    }

    return text.join(" ");
  }

  /**
   * Determine whether post is expanded
   * @param {*} index num in array to check
   * @returns whether post has been expanded
   */
  function isExpanded(index) {
    return state.expandedPosts.includes(index) || state.expandAll;
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
                  fontSize: "13px",
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
                  position: "relative",
                  height: "20px",
                  marginBottom: "10px",
                }}
              >
                <b>Trends on Reddit</b>
                <button
                  className="sortButton2"
                  style={{ padding: "0px" }}
                  onClick={() =>
                    setState({
                      ...state,
                      showOptions: state.showOptions ? false : true,
                    })
                  }
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "120px",
                      bottom: "-5px",
                    }}
                  >
                    <SortRoundedIcon fontSize="small" />
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      position: "absolute",
                      bottom: "0px",
                      right: "80px",
                    }}
                  >
                    SORT
                  </div>
                </button>
                <button
                  className="sortButton2"
                  style={{ padding: "0px" }}
                  onClick={() => {
                    setState({
                      ...state,
                      expandAll: state.expandAll ? false : true,
                      expandedPosts: [],
                    });
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "55px",
                      bottom: "-5px",
                    }}
                  >
                    {state.expandAll && (
                      <div>
                        <UnfoldLessIcon fontSize="small" />
                      </div>
                    )}
                    {!state.expandAll && (
                      <div>
                        <UnfoldMoreIcon fontSize="small" />
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      position: "absolute",
                      bottom: "0px",
                      right: "0px",
                    }}
                  >
                    EXPAND
                  </div>
                </button>
              </div>
            </div>

            {state.showOptions && (
              <div className="centering">
                <div
                  style={{
                    fontSize: "13px",
                    color: "gray",
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
                  fontSize: "13px",
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
