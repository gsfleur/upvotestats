import axios from "axios";
import TrendItem from "./trendItem";
import { useState, useEffect } from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { makeStyles } from "@material-ui/core/styles";
import NativeSelect from "@mui/material/NativeSelect";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export default function Trends() {
  window.document.title = "Reddit Trends - Upvote Stats";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    sort: "all",
    sortBy: "hot",
    sortDate: "today",
    data: null,
    allData: null,
    newsData: null,
    funnyData: null,
    sportsData: null,
    showOptions: false,
    collapsedAll: false,
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
      sortDate: event.target.value,
    });
  };

  // Handle Sort Change Event
  const handleSortChange = (event) => {
    setState({
      ...state,
      loaded: false,
      sortBy: event.target.value,
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
  });

  // Material UI Styling
  const classes = useStyles();

  let postListDOM = []; // DOM for posts
  let postLinks = []; // urls of all posts

  // If data was loaded properly
  if (state.loaded && !state.error) {
    const posts = state.data.posts;
    // Creating DOM for posts
    if (posts != null) {
      for (let i = 0; i < posts.length && postListDOM.length < 30; i++) {
        // Skip deleted, cross, or duped posts
        if (posts[i].text === "[deleted]") continue;
        if (posts[i].author === "[deleted]") continue;
        if (posts[i].isCrossPost) continue;
        if (posts[i].subreddit.startsWith("u_")) continue;
        if (posts[i].trends.length < 3) continue;
        if (postLinks.includes(posts[i].url)) continue;

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
        if (removedList.includes(posts[i].url)) continue;

        // List of post links
        postLinks.push(posts[i].url);

        // Handle Request Post Removal Event
        const handleReport = (event) => {
          const d = new Date();
          const id = event.target.id.split("-")[1];
          const key =
            "upvotestats-hidden-" + d.getMonth() + "-" + d.getFullYear();

          // Initializing stored key value pair
          if (localStorage.getItem(key) === null) localStorage.setItem(key, "");

          // Storing url of removed posts requested user
          localStorage.setItem(
            key,
            localStorage.getItem(key) + " " + postLinks[id]
          );

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
            key={state.sort + +"-post-" + i}
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
          margin: "0px 0px 15px 0px",
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
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            border: "1.5px solid #292929",
            borderRadius: "20px",
            height: window.innerWidth > 600 ? "150px" : "110px",
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
                {loadingDOM}
                {loadingDOM}
                {loadingDOM}
                {loadingDOM}
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
            {/* Menu Category Items */}
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
            {/* Sort and Expand Buttons */}
            <div className="centering">
              <div
                className="trendHeader"
                style={{
                  color: "gainsboro",
                  width: "90%",
                  marginBottom: "10px",
                }}
              >
                <b>Reddit Trends</b>
                <button
                  className="sortButton2"
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
                      fontWeight: "bold",
                      float: "right",
                      marginTop: "4px",
                    }}
                  >
                    EXPAND
                  </div>
                  <div
                    style={{
                      float: "right",
                    }}
                  >
                    {state.collapsedAll && (
                      <i class="material-icons">unfold_less</i>
                    )}
                    {!state.collapsedAll && (
                      <i class="material-icons">unfold_more</i>
                    )}
                  </div>
                </button>

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
                      fontWeight: "bold",
                      float: "right",
                      marginRight: "5px",
                      marginTop: "4px",
                    }}
                  >
                    SORT
                  </div>
                  <div
                    style={{
                      float: "right",
                      marginRight: "3px",
                    }}
                  >
                    <i class="material-icons">sort</i>
                  </div>
                </button>
              </div>
            </div>
            {/* Sorting Menu Options */}
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
                        Hot
                      </option>
                      <option value={"new"} style={{ color: "black" }}>
                        New
                      </option>
                      <option value={"awards"} style={{ color: "black" }}>
                        Awards
                      </option>
                      <option value={"coins"} style={{ color: "black" }}>
                        Coins
                      </option>
                      <option value={"comments"} style={{ color: "black" }}>
                        Comments
                      </option>
                      <option value={"upvotes"} style={{ color: "black" }}>
                        Upvotes
                      </option>
                      <option value={"downvotes"} style={{ color: "black" }}>
                        Downvotes
                      </option>
                      <option value={"upvoteratio"} style={{ color: "black" }}>
                        Upvote Ratio
                      </option>
                      <option value={"downratio"} style={{ color: "black" }}>
                        Downvote Ratio
                      </option>
                    </NativeSelect>
                  </FormControl>
                </div>
              </div>
            )}
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
            {/* Stats of data processed by backend */}
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
