import { useState } from "react";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import ReactHlsPlayer from "react-hls-player";
import { InView } from "react-intersection-observer";
import { makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@mui/material/NativeSelect";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

export default function TrendItem(props) {
  // Component State
  const [state, setState] = useState({
    collapsed: false,
    viewed: false,
  });

  // Dropdown menu styling
  const useStyles = makeStyles({
    root: {
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

  // read only variables from props
  const i = props.index;
  const post = props.post;
  const postListDOMLength = props.postListDOMLength;

  // reset to false
  if (props.collapsedAll) state.collapsed = false;

  // Date since post published
  const timeInDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(post.publishedAt);
  const secondDate = new Date();
  const diffDays = Math.round(Math.abs((firstDate - secondDate) / timeInDay));
  const hours = Math.floor(Math.abs(firstDate - secondDate) / (60 * 60 * 1000));
  const minutes = Math.floor(Math.abs(firstDate - secondDate) / (60 * 1000));

  // Adding blur to posts with images that are NSFW/Spoiler
  let blurred = false;
  if (post.urlDest != null) {
    if (post.nsfw || post.spoiler) {
      // changing thumbnail to img source
      blurred = true;
      post.urlToImage = post.source;
    }
  }

  // Setting thumbnail to source if thumbnail not available
  if (post.source != null) {
    if (post.urlToImage === "image" || post.urlToImage === "default")
      post.urlToImage = post.source;
  }

  // Setting source to specific image in reddit gallery
  if (post.isGallery && !post.isVideo) {
    if (post.mediaMetadata.length > 0) {
      post.source = post.mediaMetadata[post.galleryItem];
    }
  }

  // Determine whether to show image
  const loadableImg =
    post.urlToImage != null &&
    post.urlToImage !== "" &&
    post.urlToImage !== "default" &&
    post.urlToImage !== "self" &&
    (post.source != null || post.urlToImage.includes("https")) &&
    post.urlDest != null;

  // DOM for "trending with" section
  let trendingWith = [];
  const trends = post.trends;

  // Load dom for all sub level trends
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
            "linear-gradient(0deg,transparent 1%, rgb(255,255,255,0.03) 99%",
        }}
        key={"trendWith-" + i + "-" + t}
      >
        {trends[t]}
      </div>
    );
  }

  // Arary of words in title and text
  let postTitle = post.title;
  let postText = fixMarkdown(post.text);

  // Adding content warning tags in text, later to be converted in markdown
  if (loadableImg) {
    if (post.nsfw) postTitle = "![NSFW](0) " + postTitle;
    if (post.spoiler) postTitle = "![SPOILER](0) " + postTitle;
  } else {
    if (post.nsfw) postTitle += " ![NSFW](2.5)";
    if (post.spoiler) postTitle += " ![SPOILER](2.5)";
  }

  // Image Source
  const imgSource = post.redditMediaDomain
    ? post.urlDest
    : post.source == null
    ? post.urlToImage
    : post.source;

  // Image thumbnail
  const thumbnail = (
    <img
      src={post.urlToImage}
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

  // Link Destination converted to string
  let destLink = post.urlDest;
  if (destLink != null) {
    destLink = destLink.replace("https://", "");
    destLink = destLink.replace("http://", "");
    destLink = destLink.replace("www.", "");
    destLink = destLink.substring(0, 15) + "...";
  }

  // Destination Link DOM
  const outLinkDOM = (
    <span>
      {!post.redditMediaDomain && post.urlDest != null && (
        <div
          style={{
            display: "inline-block",
            width: "100%",
            marginTop: loadableImg ? "4px" : "2px",
          }}
        >
          <a
            href={post.urlDest}
            target="_blank"
            rel="noreferrer"
            className="searchLink"
            style={{
              fontSize: "13px",
              color: "DodgerBlue",
              position: "relative",
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
                position: "absolute",
                bottom: "1.5px",
                marginLeft: "2px",
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
      {hours === 0 && <span>{minutes} min</span>}
      {hours < 24 && hours > 0 && <span>{hours}h</span>}
      {hours >= 24 && diffDays < 7 && <span>{diffDays}d</span>}
      {diffDays >= 7 && <span>{Math.floor(diffDays / 7)}w</span>} ago by{" "}
      <a
        className="searchLink2"
        href={"https://www.reddit.com/u/" + post.author}
        rel="noreferrer"
        target="_blank"
      >
        {post.author}
      </a>
    </div>
  );

  // Post thread link DOM
  const threadLinkDOM = (
    <span>
      {isCollapsed() && (
        <div
          style={{
            marginTop: "5px",
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
              (100 * post.upvotes) / (Math.abs(post.downvotes) + post.upvotes)
            )}
            % Upvoted
          </div>
          <a
            href={post.url}
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

  // Markdown DOM bullet
  const bullet = (props) => {
    if (
      props.children != null &&
      props.children.length > 0 &&
      props.children[1].props.children != null
    ) {
      return <span>- {props.children[1].props.children[0]}</span>;
    } else {
      return <span></span>;
    }
  };

  // Markdown DOM for post text
  const markdown = (text) => (
    <ReactMarkdown
      components={{
        a: ({ node, ...props }) => {
          if (props.children != null && props.children.length >= 0) {
            return (
              <a
                className="searchLink"
                target="_blank"
                rel="noreferrer"
                style={{ color: "dodgerblue" }}
                href={props.href}
              >
                {props.children[0]}
              </a>
            );
          } else {
            return <span></span>;
          }
        },
        p: ({ node, ...props }) => <p style={{ margin: "0px" }} {...props} />,
        strong: ({ node, ...props }) => <span {...props} />,
        em: ({ node, ...props }) => <span {...props} />,
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
        li: ({ node, ...props }) => bullet(props),
        ol: ({ node, ...props }) => bullet(props),
        ul: ({ node, ...props }) => bullet(props),
      }}
      children={text}
      remarkPlugins={[remarkGfm]}
    />
  );

  // Whether post is streamable video link
  const streamable =
    post.urlDest != null && post.urlDest.includes("streamable.com");

  // Getting streamable embed link
  let streamableLink = "";
  if (streamable) {
    const parts = post.urlDest.split("/");
    streamableLink = "https://streamable.com/e/" + parts[parts.length - 1];
  }

  // DOM of trend item
  return (
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
          e.target.className.baseVal == null &&
          !props.collapsedAll
        )
          setState({ ...state, collapsed: isCollapsed() ? false : true });
      }}
    >
      <div className="postLink" id={"trends-" + i}>
        <InView
          as="div"
          threshold={0.01}
          onChange={(inView, entry) => {
            let elm = document.getElementById("trends-" + i);
            if (inView) {
              elm.style.opacity = "1";
              state.viewed = true;
            } else if (!state.viewed) {
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
              {postListDOMLength + 1} &bull;{" "}
              <a
                className="searchLink"
                href={"https://www.reddit.com/r/" + post.subreddit}
                rel="noreferrer"
                target="_blank"
              >
                {post.subName}
              </a>{" "}
              &bull; {numToString(post.upvotes)} &uarr;
              <div style={{ float: "right", display: "inline-block" }}>
                <NativeSelect
                  disableUnderline
                  className={classes.root}
                  id={"report-" + postListDOMLength}
                  onChange={props.handleReport}
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
              <b>{post.trends.length > 0 ? post.trends[0] : post.subName}</b>
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
            {post.text.length > 0 && (
              <div
                style={{
                  fontSize: "13px",
                  color: "silver",
                  paddingTop: "5px",
                }}
              >
                {!isCollapsed() && (
                  <div className="limitText4">
                    {post.spoiler
                      ? markdown("Text hidden... [click to read more]")
                      : markdown(postText)}
                  </div>
                )}
                {isCollapsed() && <div>{markdown(postText)}</div>}
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
            {post.text.length === 0 && !loadableImg && (
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
                      href={"https://www.reddit.com/u/" + post.author}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img
                        className="iconImg"
                        src={
                          post.icon !== ""
                            ? post.icon
                            : "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png"
                        }
                        loading="lazy"
                        alt={post.author + " icon"}
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
                        href={"https://www.reddit.com/u/" + post.author}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {post.author}
                      </a>{" "}
                      &bull; {hours === 0 && <span>{minutes} min</span>}
                      {hours < 24 && hours > 0 && <span>{hours}h</span>}
                      {hours >= 24 && diffDays < 7 && <span>{diffDays}d</span>}
                      {diffDays >= 7 && (
                        <span>{Math.floor(diffDays / 7)}w</span>
                      )}
                    </div>
                  </div>

                  {/* Collapsed post with image */}
                  {isCollapsed() && (
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
                        {!post.isVideo && !streamable && (
                          <span>
                            {/* Post is a gallery with multiple images */}
                            {post.isGallery && (
                              <div
                                className="centering"
                                style={{ marginBottom: "10px" }}
                              >
                                <ArrowCircleLeftIcon
                                  className="nextButton"
                                  onClick={() => {
                                    let currIndex = post.galleryItem;
                                    // getting next index for gallery item
                                    post.galleryItem = Math.max(
                                      0,
                                      post.galleryItem - 1
                                    );
                                    // if index changed, update
                                    if (currIndex !== post.galleryItem) {
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
                                  {post.galleryItem + 1}
                                  &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
                                  {post.mediaMetadata.length}
                                </div>
                                <ArrowCircleRightIcon
                                  className="nextButton"
                                  onClick={() => {
                                    let currIndex = post.galleryItem;
                                    // getting next index for gallery item
                                    post.galleryItem = Math.min(
                                      post.mediaMetadata.length - 1,
                                      post.galleryItem + 1
                                    );
                                    // if index changed, update
                                    if (currIndex !== post.galleryItem) {
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
                        {post.isVideo && (
                          <InView
                            as="div"
                            threshold={0.3}
                            onChange={(inView, entry) => {
                              let video = document.getElementById("video" + i);
                              if (inView) video.play();
                              else video.pause();
                            }}
                          >
                            <div className="centering">
                              <ReactHlsPlayer
                                src={post.media}
                                muted={true}
                                controls={true}
                                loop={true}
                                width="100%"
                                id={"video" + i}
                                className="postVideoStandard"
                                height="100%"
                                poster={post.source}
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
                              title={post.title + "-streamable-" + i}
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
                  {!isCollapsed() && (
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
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "gray",
                  overflow: "hidden",
                  height: "100%",
                  maxHeight: isCollapsed() ? "80px" : "40px",
                }}
              >
                {trendingWith}
              </div>
            </div>
          )}

          {/* Post statistics */}
          <div
            style={{
              fontSize: "13px",
              color: "gray",
              marginTop: "3px",
            }}
          >
            {post.awards > 0 && (
              <span>
                {numToString(post.coins)} coins &bull;{" "}
                {numToString(post.awards)} awards &bull;{" "}
              </span>
            )}
            <a
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="searchLink"
            >
              {numToString(post.comments)} comments
            </a>
          </div>
        </InView>
      </div>
    </div>
  );

  /**
   * Determine whether post is collapsed
   * @returns whether post has been collapsed
   */
  function isCollapsed() {
    return state.collapsed || props.collapsedAll;
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
   * Ensure markdown contents are in correct form
   * @param {*} text - text to search through
   * @returns array of text with words
   */
  function fixMarkdown(text) {
    // getting everything surrounded by parenthesis
    const p = text.match(/\((.*?)\)/g);
    if (p !== null) {
      for (let i = 0; i < p.length; i++) {
        // Changing all spaces within a link to '%20'
        if (p[i].includes("https://") || p[i].includes("http://")) {
          if (text.charAt(text.indexOf(p[i]) - 1) === "]") {
            let link = p[i];
            link = link.replace(/\s/g, "%20");
            text = text.replace(p[i], link);
          }
        }
      }
    }
    return text;
  }
}
