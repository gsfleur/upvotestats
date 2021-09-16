import axios from "axios";
import { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

export default function Today() {
  window.document.title = "Upvote Stats - Today";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    data: {},
  });

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false) {
      (async () => {
        await axios
          .get(process.env.REACT_APP_BACKEND + "posts")
          .then((res) => {
            state.data = res.data;
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
    for (let i = 0; i < state.data.posts.length && i < 100; i++) {
      const timeInDay = 24 * 60 * 60 * 1000;
      const firstDate = new Date(state.data.posts[i][1].publishedAt);
      const secondDate = new Date();
      // Date since article published
      const diffDays = Math.round(
        Math.abs((firstDate - secondDate) / timeInDay)
      );

      let loadableImg =
        state.data.posts[i][1].urlToImage !== null &&
        state.data.posts[i][1].urlToImage !== "" &&
        state.data.posts[i][1].urlToImage !== "default" &&
        state.data.posts[i][1].urlToImage !== "self" &&
        state.data.posts[i][1].urlToImage !== "nsfw" &&
        state.data.posts[i][1].urlToImage !== "spoiler";

      let author = (
        <span>
          Posted by {state.data.posts[i][1].author}{" "}
          {diffDays === 0 && <span>today</span>}
          {diffDays === 1 && <span>{diffDays} day ago</span>}
          {diffDays > 1 && diffDays < 7 && <span>{diffDays} days ago</span>}
          {diffDays >= 7 && diffDays < 14 && <span>1 week ago</span>}
          {diffDays >= 14 && diffDays < 21 && <span>2 weeks ago</span>}
          {diffDays >= 21 && diffDays < 28 && <span>3 weeks ago</span>} on r/
          {state.data.posts[i][1].subreddit} for a total of{" "}
          {state.data.posts[i][1].ups} upvotes and{" "}
          {Math.abs(state.data.posts[i][1].downvotes)} downvotes for a ratio of{" "}
          {Math.floor(state.data.posts[i][0] * 100)} percent.
        </span>
      );

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
                  fontSize: "12px",
                  marginBottom: "10px",
                  color: "silver",
                }}
              >
                <b>
                  {i + 1} &bull; {"r/" + state.data.posts[i][1].subreddit}{" "}
                  &bull; {numToString(state.data.posts[i][1].subscribers)}
                </b>
              </div>

              <div className="searchLink" style={{ fontSize: "18px" }}>
                <b>{state.data.posts[i][1].title}</b>
              </div>
            </div>
            {loadableImg && (
              <div
                style={{
                  display: "inline-block",
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                <div style={{ overflow: "auto" }}>
                  <img
                    src={state.data.posts[i][1].urlToImage}
                    className="postImgStandard"
                    alt="news"
                    style={{ float: "left", marginLeft: "10px" }}
                  />
                  <div
                    className="postDate"
                    style={{
                      fontSize: "12px",
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
                  fontSize: "12px",
                  marginBottom: "10px",
                  color: "silver",
                }}
              >
                {author}
              </div>
            )}
            <span
              style={{
                fontSize: "12px",
                marginBottom: "10px",
                color: "silver",
                fontWeight: "bold",
              }}
            >
              {state.data.posts[i][1].comments
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
              people are talking about this
            </span>
          </a>
        </div>
      );
    }
  }

  /*
   * Converts number to string with abbreviation
   * @param {*} num - Number to convert
   * @returns Number with abbreviation
   */
  function numToString(num) {
    return Math.abs(num) >= 1.0e9
      ? (Math.abs(num) / 1.0e9).toFixed(3) + " B"
      : Math.abs(num) >= 1.0e6
      ? (Math.abs(num) / 1.0e6).toFixed(3) + " M"
      : Math.abs(num) >= 1.0e3
      ? (Math.abs(num) / 1.0e3).toFixed(3) + " K"
      : Math.abs(num).toFixed(2);
  }

  return (
    <div className="centering">
      <div className="today">
        {state.loaded === false && (
          <CircularProgress
            style={{
              width: "25px",
              height: "25px",
              color: "rgb(142, 200, 246)",
            }}
          />
        )}
        {state.loaded === true && <div>{newsListDOM}</div>}
      </div>
    </div>
  );
}
