import { useState } from "react";
import Dropdown from "./dropdown";
import remarkGfm from "remark-gfm";
import DropOption from "./dropoption";
import ReactMarkdown from "react-markdown";
import ReactHlsPlayer from "react-hls-player";
import { InView } from "react-intersection-observer";

export default function TrendItem(props) {
  // Component State
  const [state, setState] = useState({
    collapsed: false,
    viewed: false,
    views: 0,
  });

  // read only variables from props
  const i = props.index;
  const post = props.post;
  const postListDOMLength = props.postListDOMLength;

  // Return empty div if post is not within viewport
  if (!state.viewed) {
    return (
      <div>
        <InView
          as="div"
          style={{ height: "283px" }}
          threshold={0}
          onChange={(inView) => {
            if (inView && !state.viewed) {
              // Tracking number of trends viewed
              if (window.gtag) {
                window.gtag("event", "trend_view", {
                  event_category: post.id,
                  event_label: post.title,
                });
              }

              // Load post once in viewing range
              setState({ ...state, viewed: true });
            }
          }}
        />
      </div>
    );
  }

  // reset to false
  if (props.collapsedAll) state.collapsed = false;

  // Date since post published
  const timeInDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(post.publishedAt);
  const secondDate = new Date();
  const diffDays = Math.round(Math.abs((firstDate - secondDate) / timeInDay));
  const hours = Math.round(Math.abs(firstDate - secondDate) / (60 * 60 * 1000));
  const minutes = Math.round(Math.abs(firstDate - secondDate) / (60 * 1000));

  // Setting source to specific image in reddit gallery
  if (post.isGallery && !post.isVideo) {
    if (post.mediaMetadata.length > 0) {
      post.source = post.mediaMetadata[post.galleryItem];
    }
  }

  // Setting thumbnail to source if thumbnail not available
  if (post.source != null) {
    if (post.urlToImage === "image" || post.urlToImage === "default")
      post.urlToImage = post.source;
  }

  // Adding blur to posts with images that are NSFW/Spoiler
  let blurred = false;
  if (post.urlDest != null) {
    if (post.nsfw || post.spoiler) {
      // changing thumbnail to img source
      blurred = true;
      post.urlToImage = post.source;
    }
  }

  // Determine whether to show image
  const loadableImg =
    ((post.urlToImage != null &&
      post.urlToImage !== "" &&
      post.urlToImage !== "default" &&
      post.urlToImage !== "self" &&
      (post.source != null || post.urlToImage.includes("https")) &&
      post.urlDest != null) ||
      post.isGallery) &&
    props.showMedia;

  // trends of posts
  const trends = post.trends;

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

  // Missing Image
  const missingImg =
    props.theme === "light" ? "missingLight.png" : "missing.png";

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
        e.target.src = missingImg;
      }}
    />
  );

  // Getting the width of the trends page
  const trendWithWidth = document.getElementById("trends").offsetWidth;
  // Getting the width of the trending with text
  const trendWithTextWidth = getTextWidth(
    "Trending with: " +
      trends.slice(1, isCollapsed() ? trends.length : 3).join(", "),
    getCanvasFontSize(document.getElementById("trends"))
  );
  // Getting the percentage of length taken
  const trendWithLength = trendWithTextWidth / trendWithWidth;

  // Whether post is streamable video link
  const streamable =
    post.urlDest != null && post.urlDest.includes("streamable.com");

  // Getting streamable embed link
  let streamableLink = "";
  if (streamable) {
    const parts = post.urlDest.split("/");
    streamableLink = "https://streamable.com/e/" + parts[parts.length - 1];
  }

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
        <a
          href={post.urlDest}
          target="_blank"
          rel="noreferrer"
          className="postOutLink"
          title="View website"
        >
          {destLink}
          <img
            id={"outLink" + i}
            src="outbound.png"
            alt={"outbound icon"}
            width="13px"
            height="13px"
            loading="lazy"
            style={{ marginLeft: "2px" }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = missingImg;
            }}
          />
        </a>
      )}
    </span>
  );

  // Post author information
  const author = (
    <div className={props.getClass("postAuthor")}>
      {hours === 0 && <span>{minutes} min</span>}
      {hours < 24 && hours > 0 && <span>{hours}h</span>}
      {hours >= 24 && diffDays < 7 && <span>{diffDays}d</span>}
      {diffDays >= 7 && <span>{Math.round(diffDays / 7)}w</span>} ago by{" "}
      <a
        className={props.getClass("searchLink")}
        href={"https://www.reddit.com/u/" + post.author}
        rel="noreferrer"
        target="_blank"
        title={"Visit u/" + post.author + "'s profile"}
      >
        {post.author}
      </a>
    </div>
  );

  // Post upvote ratio
  const upvoteRatio = Math.round(
    (100 * post.upvotes) / (Math.abs(post.downvotes) + post.upvotes + 1)
  );

  // Post thread link DOM
  const threadLinkDOM = (
    <span>
      {isCollapsed() && (
        <div className="postThreadLinkContainer">
          <div
            className={props.getClass("postThreadLink")}
            style={{ float: "left" }}
          >
            {upvoteRatio >= 50 && <span>{upvoteRatio}%</span>}
            {upvoteRatio < 50 && <span>Less than 50%</span>} upvoted
          </div>
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer"
            className={
              props.getClass("postThreadLink") +
              " " +
              props.getClass("searchLink")
            }
            style={{ float: "right" }}
            id={"threadLink" + i}
            title="View on reddit"
            onClick={() => {
              // Tracking trend link click
              if (window.gtag) {
                window.gtag("event", "trend_link", {
                  event_category: post.id,
                  event_label: post.title,
                });
              }
            }}
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
  const markdown = (text, props2) => (
    <ReactMarkdown
      components={{
        a: ({ node, ...props }) => {
          if (props.children != null && props.children.length >= 0) {
            return (
              <a
                className={props2.getClass("searchLink")}
                target="_blank"
                rel="noreferrer"
                style={{ color: "dodgerblue" }}
                href={props.href}
                title="View website"
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
              fontSize: "12px",
              fontWeight: "bold",
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

  // DOM of trend item
  return (
    <InView
      as="div"
      threshold={0}
      onChange={(inView) => {
        if (inView && state.viewed) {
          // Opacity transition if post is viewed
          const elm = document.getElementById("trends-" + i);
          if (elm != null && elm.style.opacity !== "1") elm.style.opacity = "1";
          state.views++;
        }
      }}
    >
      <div
        className="post"
        key={"trends-" + i}
        onClick={(e) => {
          if (
            !e.target.className.includes("postImgStandard") &&
            !e.target.className.includes("postVideoStandard") &&
            !e.target.className.includes("postOutLink") &&
            !e.target.className.includes("searchLink") &&
            !e.target.className.includes("searchLink2") &&
            !e.target.className.includes("iconImg") &&
            !e.target.className.includes("nextButton") &&
            !e.target.className.includes("Mui") &&
            !e.target.id.includes("report") &&
            !e.target.id.includes("threadLink") &&
            !e.target.id.includes("outLink") &&
            !e.target.id.includes("mui") &&
            !props.collapsedAll
          ) {
            if (!isCollapsed()) {
              // Tracking number of trend post clicks
              if (window.gtag) {
                window.gtag("event", "trend_click", {
                  event_category: post.id,
                  event_label: post.title,
                });
              }
            }

            // Percetange of space occupied in the window by a trend
            const elm = document.getElementById("trends-" + i);

            // Distance from top of trend to the bottom of window
            const pixelsFromBottom = Math.abs(
              elm.offsetTop - window.innerHeight - window.scrollY
            );

            // Distance from top of trend to the top of window
            const pixelsFromTop = pixelsFromBottom - window.innerHeight;

            // scroll back to top of trend when uncollapsing
            // if top of trend is out of view due to scrolling down
            if (isCollapsed() && pixelsFromTop >= -70)
              document.getElementById("anchor-" + i).scrollIntoView();

            setState({ ...state, collapsed: isCollapsed() ? false : true });
          }
        }}
      >
        <div
          className={props.getClass("postLink")}
          id={"trends-" + i}
          style={{ opacity: state.views < 1 ? 0 : 1 }}
        >
          <div style={{ position: "relative" }}>
            <div
              id={"anchor-" + i}
              style={{ position: "absolute", top: "-95px" }}
            ></div>
          </div>
          <div
            style={{
              display: "block",
              overflow: "hidden",
              width: "100%",
            }}
          >
            {/* Post rank, subreddit name, and options button */}
            <div className={props.getClass("postRank")}>
              {postListDOMLength + 1} &bull;{" "}
              <a
                className={props.getClass("searchLink2")}
                href={"https://www.reddit.com/r/" + post.subreddit}
                rel="noreferrer"
                target="_blank"
                title={"Visit r/" + post.subreddit}
              >
                {post.subName}
              </a>{" "}
              &bull; {numToString(post.upvotes)} &uarr;{" "}
              <Report theme={props.theme} handleReport={props.handleReport} />
            </div>

            {/* Main Trend associated with post */}
            <div className="postTrend">
              <span className="limitText1">
                <b>{post.trends.length > 0 ? post.trends[0] : post.subName}</b>
              </span>
            </div>

            {/* Post title, if no image */}
            {!loadableImg && (
              <div
                className={props.getClass("postTitle")}
                style={{ width: "100%" }}
              >
                {markdown(postTitle, props)}
              </div>
            )}

            {/* Post text if available */}
            {post.text.length > 0 && (
              <div className={props.getClass("postText")}>
                {!isCollapsed() && (
                  <div className="limitText4">
                    {post.spoiler
                      ? markdown("Text hidden... [click to read more]", props)
                      : markdown(postText, props)}
                  </div>
                )}
                {isCollapsed() && <div>{markdown(postText, props)}</div>}
              </div>
            )}
            {!loadableImg && (
              <span>
                {outLinkDOM}
                {author}
                {threadLinkDOM}
              </span>
            )}
          </div>

          {/* Post with image */}
          {loadableImg && (
            <div className={props.getClass("imgBodyContainer")}>
              <div
                style={{
                  position: "relative",
                  height: "100%",
                }}
              >
                <div className={props.getClass("imgBody")}>
                  {/* Post author name, icon and creation date */}
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                      marginBottom: isCollapsed() ? "5px" : "10px",
                    }}
                  >
                    <a
                      href={"https://www.reddit.com/u/" + post.author}
                      rel="noreferrer"
                      target="_blank"
                      title={"Visit u/" + post.author + "'s profile"}
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
                          e.target.src = missingImg;
                        }}
                      />
                    </a>
                    <div
                      style={{
                        float: "left",
                        marginLeft: "5px",
                      }}
                    >
                      <a
                        className={props.getClass("searchLink2")}
                        href={"https://www.reddit.com/u/" + post.author}
                        rel="noreferrer"
                        target="_blank"
                        title={"Visit u/" + post.author + "'s profile"}
                        style={{
                          color:
                            props.theme === "light" ? "#191919" : "gainsboro",
                        }}
                      >
                        {post.author}
                      </a>{" "}
                      &bull; {hours === 0 && <span>{minutes} min</span>}
                      {hours < 24 && hours > 0 && <span>{hours}h</span>}
                      {hours >= 24 && diffDays < 7 && <span>{diffDays}d</span>}
                      {diffDays >= 7 && (
                        <span>{Math.round(diffDays / 7)}w</span>
                      )}
                    </div>
                  </div>

                  {/* Collapsed post with image */}
                  {isCollapsed() && (
                    <span>
                      <div
                        className={props.getClass("postTitle")}
                        style={{ width: "100%" }}
                      >
                        {markdown(postTitle, props)}
                      </div>
                      <div style={{ width: "100%" }}>
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
                                style={{
                                  marginBottom: "10px",
                                  marginTop: "10px",
                                }}
                              >
                                <div
                                  className={props.getClass("nextButton")}
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
                                >
                                  Prev
                                </div>
                                <div
                                  className={props.getClass("galleryNumber")}
                                >
                                  {post.galleryItem + 1}
                                  &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
                                  {post.mediaMetadata.length}
                                </div>
                                <div
                                  className={props.getClass("nextButton")}
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
                                >
                                  Next
                                </div>
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
                                  maxHeight: "calc(100vh - 360px)",
                                  objectFit: "contain",
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = missingImg;
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

                  {/* Un-collapsed post with thumbnail */}
                  {!isCollapsed() && (
                    <span>
                      {!blurred && <span>{thumbnail}</span>}
                      {blurred && (
                        <div className="blurOuter">
                          <div className="blur">{thumbnail}</div>
                        </div>
                      )}
                      <div
                        className={props.getClass("postTitle")}
                        style={{
                          float: "left",
                          marginLeft: "10px",
                        }}
                      >
                        <span className="limitText3">
                          {markdown(postTitle, props)}
                        </span>
                      </div>
                      <div
                        style={{
                          float: "left",
                          marginLeft: "10px",
                        }}
                      >
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
            <div className={props.getClass("postTrendWithLoc")}>
              <span className={isCollapsed() ? "" : "limitText1"}>
                Trending with:{" "}
                <span className={props.getClass("postTrendWith")}>
                  {trends
                    .slice(
                      1,
                      isCollapsed()
                        ? trends.length
                        : trendWithLength >= 1
                        ? 2
                        : 3
                    )
                    .join(", ")}
                </span>
              </span>
            </div>
          )}

          {/* Post statistics */}
          <div className={props.getClass("postStats")}>
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
              title="Read comments"
              className={props.getClass("searchLink2")}
              onClick={() => {
                // Tracking trend link click
                if (window.gtag) {
                  window.gtag("event", "trend_link", {
                    event_category: post.id,
                    event_label: post.title,
                  });
                }
              }}
            >
              {numToString(post.comments)} comments
            </a>
          </div>
        </div>
      </div>
    </InView>
  );

  /**
   * Report mui icon DOM for posts
   * @param {*} props props to pass (theme and handleReport)
   * @returns dom for report icon
   */
  function Report(props) {
    return (
      <Dropdown
        id={"report-" + postListDOMLength}
        type="report"
        theme={props.theme}
        onChange={() => {
          props.handleReport({ target: { id: "report-" + postListDOMLength } });
        }}
        style={{
          width: "30px",
          float: "right",
          fontSize: "13px",
          height: "20px",
        }}
      >
        <DropOption value={"hide"} theme={props.theme}>
          Hide this post
        </DropOption>
        <DropOption value={"report"} theme={props.theme}>
          Report this post
        </DropOption>
      </Dropdown>
    );
  }

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

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 */
function getTextWidth(text, font) {
  // re-use canvas object for better performance
  const canvas =
    getTextWidth.canvas ||
    (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

function getCssStyle(element, prop) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFontSize(el = document.body) {
  const fontWeight = getCssStyle(el, "font-weight") || "normal";
  const fontSize = getCssStyle(el, "font-size") || "16px";
  const fontFamily = getCssStyle(el, "font-family") || "Times New Roman";

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}
