import axios from "axios";
import React from "react";
import TrendItem from "./trendItem";
import { styled } from "@mui/system";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import PopperUnstyled from "@mui/base/PopperUnstyled";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import CheckBoxOutlineBlankOutlinedIcon from "@mui/icons-material/CheckBoxOutlineBlankOutlined";
import SelectUnstyled, {
  selectUnstyledClasses,
} from "@mui/base/SelectUnstyled";
import OptionUnstyled, {
  optionUnstyledClasses,
} from "@mui/base/OptionUnstyled";

export default function Trends(props) {
  window.document.title = "Reddit Trends - Upvote Stats";

  // React Router History
  const history = useHistory();

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    sortBy: "hot",
    sortTab: "all",
    sortTime: "today",
    data: null,
    allData: null,
    newsData: null,
    funnyData: null,
    sportsData: null,
    collapsedAll: false,
    nsfw: true,
    spoiler: true,
    media: true,
  });

  useEffect(() => {
    let componentMounted = true;

    // Names of all menu options
    const timeOptions = ["today", "week", "month"];
    const tabOptions = ["all", "news", "funny", "sports"];
    const sortOptions = [
      "hot",
      "new",
      "upvotes",
      "downvotes",
      "coins",
      "awards",
      "comments",
      "downratio",
      "upvoteratio",
    ];

    // Page search parameters
    if ("URLSearchParams" in window) {
      const searchParams = new URLSearchParams(window.location.search);

      // old page path
      const oldPath = window.location.pathname + "?" + searchParams.toString();

      // Set search values to state values when first loading data
      if (state.data == null) {
        const tab = searchParams.get("tab");
        const sort = searchParams.get("sort");
        const time = searchParams.get("time");

        if (tabOptions.includes(tab) && state.sortTab !== tab)
          state.sortTab = tab;
        if (sortOptions.includes(sort) && state.sortBy !== sort)
          state.sortBy = sort;
        if (timeOptions.includes(time) && state.sortTime !== time)
          state.sortTime = time;

        // Forward and Back button event
        history.listen((location) => {
          // update path
          window.location.href = location.pathname + location.search;
        });
      }

      // Set new search param values
      searchParams.set("tab", state.sortTab);
      searchParams.set("sort", state.sortBy);
      searchParams.set("time", state.sortTime);

      // current page path
      const newPath = window.location.pathname + "?" + searchParams.toString();

      if (window.gtag) {
        // Tracking trend tab category
        window.gtag("event", "trend_tab", {
          event_category: state.sortTab,
          event_label: state.sortTab,
        });
        // Tracking trend sort type
        window.gtag("event", "trend_sort", {
          event_category: state.sortBy,
          event_label: state.sortBy,
        });
        // Tracking trend sort time
        window.gtag("event", "trend_time", {
          event_category: state.sortTime,
          event_label: state.sortTime,
        });
      }

      // Update path if changed
      if (oldPath !== newPath) {
        window.scrollTo({ top: 0 });
        window.history.pushState(null, "", newPath);
      }
    }

    if (state.loaded === false) {
      const nsfw = localStorage.getItem("nsfw");
      const spoiler = localStorage.getItem("spoiler");
      const media = localStorage.getItem("media");

      // initializing menu option values
      if (nsfw == null) localStorage.setItem("nsfw", "true");
      if (spoiler == null) localStorage.setItem("spoiler", "true");
      if (media == null) localStorage.setItem("media", "true");

      // updating to locally saved values
      state.nsfw = localStorage.getItem("nsfw") === "true";
      state.spoiler = localStorage.getItem("spoiler") === "true";
      state.media = localStorage.getItem("media") === "true";

      (async () => {
        // Loading all category data from backend
        await Promise.all(
          tabOptions.map(async (category) => {
            await axios
              .get(
                process.env.REACT_APP_BACKEND +
                  "posts/" +
                  category +
                  "?sort=" +
                  state.sortBy +
                  "&time=" +
                  state.sortTime
              )
              .then((res) => {
                state[category + "Data"] = res.data;
              })
              .catch(() => (state.error = true));
          })
        );

        // Update state
        if (componentMounted) {
          // Scroll to top
          window.scrollTo({ top: 0 });
          setState({
            ...state,
            loaded: true,
            data: state[state.sortTab + "Data"],
          });
        }
      })();
    }

    return () => {
      componentMounted = false;
    };
  });

  // Dropdown menu styling
  const blue = {
    100: "#DAECFF",
    200: "#99CCF3",
    400: "#3399FF",
    500: "#007FFF",
    600: "#0072E5",
    900: "#003A75",
  };

  const grey = {
    100: "#E7EBF0",
    200: "#E0E3E7",
    300: "rgb(0, 0, 0, 0.1)",
    400: "dodgerblue",
    500: "#A0AAB4",
    600: "#6F7E8C",
    700: "dodgerblue",
    800: "#222222",
    900: "#191919",
  };

  const StyledButton = styled("button")(
    ({ theme }) => `
    font-size: 14px;
    box-sizing: border-box;
    background: transparent;
    border: 1px solid ${props.theme === "dark" ? grey[800] : grey[300]};
    border-radius: 10px;
    padding: 5px 10px 5px 10px;
    width: 105%;
    text-align: left;
    color: ${props.theme === "dark" ? "silver" : grey[900]};

    &:hover {
      background: none;
      border-color: ${props.theme === "dark" ? grey[700] : grey[400]};
    }

    &.${selectUnstyledClasses.focusVisible} {
      outline: 3px solid ${props.theme === "dark" ? blue[600] : blue[100]};
    }

    &.${selectUnstyledClasses.expanded} {
      &::after {
        content: '▴';
      }
    }

    &::after {
      content: '▾';
      float: right;
    }
    `
  );

  const StyledListbox = styled("ul")(
    ({ theme }) => `
    font-size: 14px;
    box-sizing: border-box;
    padding: 5px;
    margin: 10px 0px 10px 0px;
    width: 150px;
    background: ${props.theme === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${props.theme === "dark" ? grey[800] : grey[300]};
    border-radius: 10px;
    color: ${props.theme === "dark" ? "silver" : grey[900]};
    overflow: auto;
    outline: 0px;
    `
  );

  const StyledOption = styled(OptionUnstyled)(
    ({ theme }) => `
    list-style: none;
    padding: 5px;
    border-radius: 0.45em;
    cursor: default;

    &:last-of-type {
      border-bottom: none;
    }

    &.${optionUnstyledClasses.selected} {
      background-color: ${props.theme === "dark" ? blue[900] : blue[100]};
      color: ${props.theme === "dark" ? blue[100] : blue[900]};
    }

    &.${optionUnstyledClasses.highlighted} {
      background-color: ${props.theme === "dark" ? grey[800] : grey[100]};
      color: ${props.theme === "dark" ? "silver" : grey[900]};
    }

    &.${optionUnstyledClasses.highlighted}.${optionUnstyledClasses.selected} {
      background-color: ${props.theme === "dark" ? blue[900] : blue[100]};
      color: ${props.theme === "dark" ? blue[100] : blue[900]};
    }

    &.${optionUnstyledClasses.disabled} {
      color: ${props.theme === "dark" ? grey[700] : grey[400]};
    }

    &:hover:not(.${optionUnstyledClasses.disabled}) {
      background-color: ${props.theme === "dark" ? grey[800] : grey[100]};
      color: ${props.theme === "dark" ? "silver" : grey[900]};
    }
    `
  );

  const StyledPopper = styled(PopperUnstyled)`
    z-index: 1;
  `;

  const CustomSelect = React.forwardRef(function CustomSelect(props, ref) {
    const components = {
      Root: StyledButton,
      Listbox: StyledListbox,
      Popper: StyledPopper,
      ...props.components,
    };

    return <SelectUnstyled {...props} ref={ref} components={components} />;
  });

  // Handle Time Change Event
  const handleTimeChange = (time) => {
    const onlyForToday = state.sortBy === "hot" || state.sortBy === "new";
    // if sort is hot/new and date is not today, default to upvotes
    if (time !== "today" && onlyForToday) state.sortBy = "upvotes";

    setState({
      ...state,
      loaded: false,
      sortTime: time,
    });
  };

  // Handle Sort Change Event
  const handleSortChange = (sort) => {
    setState({
      ...state,
      loaded: false,
      sortBy: sort,
    });
  };

  let postListDOM = []; // DOM for posts
  let postLinks = []; // urls of all posts

  // If data was loaded properly
  if (state.loaded && !state.error) {
    const posts = state.data.posts;
    // Creating DOM for posts
    if (posts != null) {
      for (let i = 0; i < posts.length && postListDOM.length < 100; i++) {
        // Skip deleted, cross, or duped posts
        if (posts[i].text === "[deleted]") continue;
        if (posts[i].author === "[deleted]") continue;
        if (posts[i].isCrossPost) continue;
        if (posts[i].subreddit.startsWith("u_")) continue;
        if (posts[i].comments < 3) continue;
        if (posts[i].trends.length < 3) continue;
        if (postLinks.includes(posts[i].url)) continue;

        // Skip nsfw posts if requested
        if (!state.nsfw && posts[i].nsfw) continue;
        // Skip spoiler posts if requested
        if (!state.spoiler && posts[i].spoiler) continue;

        // Key of hidden posts requested user (new key every month)
        const d = new Date();
        const removeKey = "upvotestats-hidden-" + d.getFullYear();

        // Initializing stored key value pair
        if (localStorage.getItem(removeKey) === null)
          localStorage.setItem(removeKey, "");

        // Getting list of all posts
        let removedList = localStorage.getItem(removeKey).split(" ");
        removedList = removedList.filter((url) => url.includes("reddit.com"));

        // Skip posts the user has requested to remove
        if (removedList.includes(posts[i].url)) continue;

        // List of post links
        postLinks.push(posts[i].url);

        // Handle Request Post Removal Event
        const handleReport = (event) => {
          const d = new Date();
          const id = event.target.id.split("-")[1];
          const key = "upvotestats-hidden-" + d.getFullYear();

          // Initializing stored key value pair
          if (localStorage.getItem(key) === null) localStorage.setItem(key, "");

          // Storing url of removed posts requested user
          localStorage.setItem(
            key,
            localStorage.getItem(key) + " " + postLinks[id]
          );

          // Tracking reported posts
          if (window.gtag) {
            window.gtag("event", "trend_report", {
              event_category: posts[i].id,
              event_label: posts[i].id,
            });
          }

          setState({
            ...state,
            loaded: false,
          });
        };

        // DOM of post in list
        postListDOM.push(
          <TrendItem
            index={i}
            post={posts[i]}
            postLinks={postLinks}
            collapsedAll={state.collapsedAll}
            handleReport={handleReport}
            postListDOMLength={postListDOM.length}
            key={state.sortTab + "-post-" + i + "-" + new Date().getTime()}
            showMedia={state.media}
            getClass={props.getClass}
            theme={props.theme}
          />
        );
      }
    }
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
        {state.sortTab === category && (
          <button
            className={props.getClass("timeButton")}
            style={{
              borderBottom: "3px solid dodgerblue",
              color: "dodgerblue",
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        )}
        {state.sortTab !== category && (
          <button
            className={props.getClass("timeButton")}
            onClick={() => {
              setState({
                ...state,
                sortTab: category,
                data: state[category + "Data"],
              });
            }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        )}
      </span>
    );
  }

  // Loading Objects
  const loadingObj = (key) => (
    <div key={"trendLoading-" + key}>
      <div
        className="loading"
        style={{
          overflow: "auto",
          display: "inline-block",
          width: "100%",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            border:
              props.theme === "light"
                ? "1px solid rgb(0, 0, 0, 0.1)"
                : "1px solid #222222",
            borderRadius: "20px",
            height: window.innerWidth > 600 ? "150px" : "110px",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="centering">
      <div className={props.getClass("trends")} id="trends">
        {!state.loaded && (
          <div>
            {/* Loading Keyframe Display */}
            <div className="centering">
              <div
                style={{
                  fontSize: "13px",
                  color: "gray",
                  marginBottom: "6px",
                  width: "90%",
                }}
              >
                {[...Array(10).keys()].map((n) => (n = loadingObj(n)))}
              </div>
            </div>
          </div>
        )}
        {state.loaded && !state.error && (
          <div>
            <div className="centering" id="trendLoc">
              <div className={props.getClass("trendMenu")} id="trendMenu">
                {/* Menu Category Items */}
                <div className="centering">
                  <div
                    style={{
                      width: "90%",
                      marginBottom: "10px",
                      boxShadow:
                        props.theme === "light"
                          ? "inset 0 -1px 0 rgb(0,0,0,0.1)"
                          : "inset 0 -1px 0 #222222",
                    }}
                  >
                    {menuCategory("all")}
                    {menuCategory("news")}
                    {menuCategory("funny")}
                    {menuCategory("sports")}
                  </div>
                </div>
                {/* Sort and Expand Buttons */}
                <div className="centering">
                  <div
                    style={{
                      color: "gainsboro",
                      width: "90%",
                      overflowX: "scroll",
                      overflowY: "hidden",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      height: "30px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        width: "800%",
                        maxWidth: "400px",
                      }}
                    >
                      <button
                        className={props.getClass("sortButton2")}
                        style={{ padding: "0px" }}
                        onClick={() => {
                          // Toggle Display of Menu
                          const elm = document.getElementById("trendSortMenu");
                          if (elm) {
                            if (elm.style.display === "block")
                              elm.style.display = "none";
                            else elm.style.display = "block";
                          }
                        }}
                      >
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Sort
                        </div>
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: "3px",
                          }}
                        >
                          <SortRoundedIcon fontSize="medium" />
                        </div>
                      </button>
                      <button
                        className={props.getClass("sortButton2")}
                        style={{ padding: "0px" }}
                        onClick={() => {
                          setState({
                            ...state,
                            collapsedAll: state.collapsedAll ? false : true,
                          });
                        }}
                      >
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Expand
                        </div>
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: "-5px",
                          }}
                        >
                          {state.collapsedAll && (
                            <div>
                              <UnfoldLessIcon fontSize="medium" />
                            </div>
                          )}
                          {!state.collapsedAll && (
                            <div>
                              <UnfoldMoreIcon fontSize="medium" />
                            </div>
                          )}
                        </div>
                      </button>
                      <button
                        className={props.getClass("sortButton2")}
                        style={{ padding: "0px" }}
                        onClick={() => {
                          if (state.nsfw) localStorage.setItem("nsfw", "false");
                          else localStorage.setItem("nsfw", "true");
                          setState({
                            ...state,
                            nsfw: state.nsfw ? false : true,
                          });
                        }}
                      >
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Nsfw
                        </div>
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: "4px",
                          }}
                        >
                          {state.nsfw && (
                            <div>
                              <CheckBoxOutlinedIcon fontSize="medium" />
                            </div>
                          )}
                          {!state.nsfw && (
                            <div>
                              <CheckBoxOutlineBlankOutlinedIcon fontSize="medium" />
                            </div>
                          )}
                        </div>
                      </button>
                      <button
                        className={props.getClass("sortButton2")}
                        style={{ padding: "0px" }}
                        onClick={() => {
                          if (state.spoiler)
                            localStorage.setItem("spoiler", "false");
                          else localStorage.setItem("spoiler", "true");
                          setState({
                            ...state,
                            spoiler: state.spoiler ? false : true,
                          });
                        }}
                      >
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Spoiler
                        </div>
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: "4px",
                          }}
                        >
                          {state.spoiler && (
                            <div>
                              <CheckBoxOutlinedIcon fontSize="medium" />
                            </div>
                          )}
                          {!state.spoiler && (
                            <div>
                              <CheckBoxOutlineBlankOutlinedIcon fontSize="medium" />
                            </div>
                          )}
                        </div>
                      </button>
                      <button
                        className={props.getClass("sortButton2")}
                        style={{ padding: "0px" }}
                        onClick={() => {
                          if (state.media)
                            localStorage.setItem("media", "false");
                          else localStorage.setItem("media", "true");
                          setState({
                            ...state,
                            media: state.media ? false : true,
                          });
                        }}
                      >
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          Media
                        </div>
                        <div
                          style={{
                            float: "right",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: "4px",
                          }}
                        >
                          {state.media && (
                            <div>
                              <CheckBoxOutlinedIcon fontSize="medium" />
                            </div>
                          )}
                          {!state.media && (
                            <div>
                              <CheckBoxOutlineBlankOutlinedIcon fontSize="medium" />
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Sorting Menu Options */}
                <div className="centering">
                  <div className="trendSortMenu" id="trendSortMenu">
                    <FormControl
                      focused
                      variant="standard"
                      htmlFor="selectTime"
                    >
                      <CustomSelect
                        defaultValue={state.sortTime}
                        onChange={handleTimeChange}
                        id="selectTime"
                      >
                        <StyledOption value={"today"}>Today</StyledOption>
                        <StyledOption value={"week"}>Week</StyledOption>
                        <StyledOption value={"month"}>Month</StyledOption>
                      </CustomSelect>
                    </FormControl>
                    <FormControl
                      focused
                      variant="standard"
                      style={{ marginLeft: "10px" }}
                    >
                      <CustomSelect
                        defaultValue={state.sortBy}
                        onChange={handleSortChange}
                        IconComponent={ExpandMoreIcon}
                        id="selectSort"
                        width="100%"
                      >
                        {state.sortTime === "today" && (
                          <StyledOption value={"hot"}>Hot</StyledOption>
                        )}
                        {state.sortTime === "today" && (
                          <StyledOption value={"new"}>New</StyledOption>
                        )}
                        <StyledOption value={"awards"}>Awards</StyledOption>
                        <StyledOption value={"coins"}>Coins</StyledOption>
                        <StyledOption value={"comments"}>Comments</StyledOption>
                        <StyledOption value={"upvotes"}>Upvotes</StyledOption>
                        <StyledOption value={"downvotes"}>
                          Downvotes
                        </StyledOption>
                        <StyledOption value={"upvoteratio"}>
                          Upvote Ratio
                        </StyledOption>
                        <StyledOption value={"downratio"}>
                          Downvote Ratio
                        </StyledOption>
                      </CustomSelect>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
            {/* List of Trend Items */}
            {postListDOM}
            {/* No posts were found */}
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
                      border:
                        props.theme === "light"
                          ? "1px solid rgb(0,0,0,0.1)"
                          : "1px solid #222222",
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
            {/* Stats of data processed by backend */}
            <div className="centering">
              <div className={props.getClass("trendStats")}>
                <div style={{ marginTop: "5px" }}>
                  Trends from {numToString(state.data.stats.posts)} posts and{" "}
                  {numToString(state.data.stats.comments)} comments
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
        {/* Error message if failing to load data from backend */}
        {state.loaded && state.error && (
          <div>
            <div className="centering">
              <span style={{ fontSize: "20px", marginTop: "10vh" }}>
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
                onClick={() => window.location.reload()}
                className={props.getClass("reloadButton")}
              >
                RELOAD
              </button>
              <br />
              <br />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
