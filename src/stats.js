import axios from "axios";
import { useState, useEffect } from "react";

export default function Stats() {
  window.document.title = "Upvote Stats - Most Awarded Posts on Reddit";

  // Component State
  const [state, setState] = useState({
    loaded: false,
    error: false,
    sort: "month",
    data: undefined,
    todayData: undefined,
    weekData: undefined,
    monthData: undefined,
  });

  useEffect(() => {
    let componentMounted = true;
    if (state.loaded === false) {
      (async () => {
        await axios
          .get(
            process.env.REACT_APP_BACKEND + "posts/all?sort=coins&time=month"
          )
          .then((res) => {
            state.monthData = res.data;
          })
          .catch((err) => {
            console.log(err);
            state.error = true;
          });

        // Update state
        if (componentMounted) {
          setTimeout(() => {
            setState({
              ...state,
              loaded: true,
              data: state.monthData,
            });
          }, 500);
        }
      })();
    }
    return () => {
      componentMounted = false;
    };
  });

  let postListDOM = []; // DOM for posts
  let postLinks = []; // ids of all posts
  let markdown = "";
  if (state.loaded === true && state.error === false) {
    // Creating DOM for posts
    if (state.data.posts !== undefined) {
      for (
        let i = 0;
        i < state.data.posts.length && postListDOM.length < 10;
        i++
      ) {
        // Skip deleted posts
        if (state.data.posts[i].text === "[deleted]") continue;

        // Skip potential duplicates
        if (postLinks.includes(state.data.posts[i].url)) continue;

        // Default post/img body css
        let imgBodyCSS = {
          display: "inline-block",
          width: "100%",
          margin: "0px",
          padding: "0px",
        };

        markdown +=
          i +
          1 +
          ". [" +
          state.data.posts[i].title +
          "](" +
          state.data.posts[i].url +
          ") ";

        postLinks.push(state.data.posts[i].url);
        // DOM of post in list
        postListDOM.push(
          <div className="centering" key={"trends-" + i}>
            <a
              href={state.data.posts[i].url}
              className="postLink"
              target="_blank"
              rel="noreferrer"
              style={{
                margin: "0px 0px 10px 0px",
                padding: "0px",
                width: "100%",
              }}
            >
              <div className="imgBody" style={imgBodyCSS}>
                <div
                  style={{
                    overflow: "auto",
                    paddingBottom: "0px",
                  }}
                >
                  {i + 1 < 10 && (
                    <div
                      style={{
                        float: "left",
                        fontSize: "40px",
                        marginTop: "15px",
                        marginLeft: "-15px",
                        padding: "5px 25px 10px 20px",
                        color: "black",
                      }}
                    >
                      {i + 1}
                    </div>
                  )}
                  {i + 1 >= 10 && (
                    <div
                      style={{
                        float: "left",
                        fontSize: "40px",
                        marginTop: "15px",
                        marginLeft: "-26px",
                        padding: "5px 15px 10px 20px",
                        color: "black",
                      }}
                    >
                      {i + 1}
                    </div>
                  )}
                  <img
                    src={state.data.posts[i].urlToImage}
                    className="postImgStandard"
                    alt="Reddit Post Thumbnail"
                    style={{
                      float: "left",
                      width: "100px",
                      height: "100px",
                      borderRadius: "10px",
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
                      color: "black",
                      float: "left",
                      width: "calc(100% - 180px)",
                      marginLeft: "10px",
                    }}
                  >
                    <span style={{ color: "black" }}>
                      {"r/" + state.data.posts[i].subreddit} &bull;{" "}
                      {numToString(state.data.posts[i].awards)} Awards &bull;{" "}
                      {numToString(state.data.posts[i].upvotes)} &uarr;
                      {state.data.posts[i].nsfw === true && (
                        <span> &bull; NSFW</span>
                      )}
                    </span>
                    <br />
                    <span className="limitText2">
                      <b>{state.data.posts[i].title}</b>
                    </span>
                    <div
                      style={{
                        lineHeight: "normal",
                        width:
                          Math.ceil(
                            100 *
                              (state.data.posts[i].coins /
                                state.data.posts[0].coins)
                          ) + "%",
                        display: "inline-block",
                        border: "0.1px solid black",
                        borderRadius: "10px",
                        backgroundColor: "gold",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          textAlign: "center",
                          color: "black",
                          fontWeight: "bold",
                          paddingRight: "5px",
                        }}
                      >
                        +{numToString(state.data.posts[i].coins)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        );
      }
      console.log(markdown);
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

  let loadingDOM = (
    <div>
      <div
        className="loading"
        style={{
          margin: "25px 0px 25px 0px",
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
            height: "140px",
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="centering">
      <div className="stats">
        {state.loaded === false && (
          <div>
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
                <div
                  className="loading"
                  style={{
                    margin: "0px",
                    width: "100%",
                    height: "60px",
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
        {state.loaded === true &&
          state.error === false &&
          postListDOM.length > 0 && (
            <div>
              <div className="centering">
                <span style={{ fontSize: "24px" }}>
                  POSTS AWARDED THE MOST REDDIT COINS
                </span>
              </div>
              <br />
              {postListDOM}
              <div className="centering">
                <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                  upvotestats.com/trends
                </span>
                <br />
                <br />
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
