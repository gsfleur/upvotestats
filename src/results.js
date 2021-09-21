import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import HighchartsExporting from "highcharts/modules/exporting";
import HighchartsAccessibility from "highcharts/modules/accessibility";

// Highcharts Graph Configuration
HighchartsExporting(Highcharts);
HighchartsAccessibility(Highcharts);
HighchartsMore(Highcharts);

export default function Results(props) {
  // Awarded coins data
  const data = props.stats.dates;

  // Chart configuration
  const options = {
    chart: {
      zoomType: "x",
      backgroundColor: "transparent",
    },
    title: {
      text: "Coins awarded per day",
      style: { color: "gainsboro" },
    },
    subtitle: {
      text:
        document.ontouchstart === undefined
          ? "Click and drag in the plot area to zoom in"
          : "Pinch the chart to zoom in",
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      title: {
        text: "Coins Given",
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, Highcharts.getOptions().colors[0]],
            [
              1,
              Highcharts.color(Highcharts.getOptions().colors[0])
                .setOpacity(0)
                .get("rgba"),
            ],
          ],
        },
        marker: {
          radius: 2,
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1,
          },
        },
        threshold: null,
      },
    },

    series: [
      {
        type: "area",
        name: "Coins",
        data: data,
      },
    ],
  };

  let newsListDOM = [];
  for (
    let i = 0;
    i < props.mostDownvoted.length && newsListDOM.length < 50;
    i++
  ) {
    // Skip deleted posts
    if (props.mostDownvoted[i][1].text === "[deleted]") continue;

    // DOM of post in list
    newsListDOM.push(
      <div className="centering" key={"today-" + i}>
        <a
          href={props.mostDownvoted[i][1].url}
          className="postLink"
          target="_blank"
          rel="noreferrer"
          style={{
            maxWidth: "450px",
            border: "1.5px solid #292929",
            borderRadius: "10px",
            padding: "10px 10px 0px 10px",
            marginTop: "10px",
            marginBottom: "10px",
          }}
        >
          <div
            className="newsText"
            style={{
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              className="searchLink"
              style={{
                fontSize: "13px",
                marginBottom: "10px",
                color: "silver",
              }}
            >
              {newsListDOM.length + 1} &bull;{" "}
              {"r/" + props.mostDownvoted[i][1].subreddit} &bull;{" "}
              {numToString(props.mostDownvoted[i][1].upvotes)} upvotes &bull;{" "}
              {numToString(Math.abs(props.mostDownvoted[i][1].downvotes))}{" "}
              downvotes
              {props.mostDownvoted[i][1].nsfw === true && (
                <span> &bull; NSFW</span>
              )}
            </div>
            <div
              style={{
                width: Math.floor(props.mostDownvoted[i][0] * 100 - 5) + "%",
                backgroundColor: "indianred",
                height: "20px",
                fontSize: "13px",
                padding: "0px 10px 0px 0px",
                float: "left",
                textAlign: "right",
                borderTopLeftRadius: "10px",
                borderBottomLeftRadius: "10px",
              }}
            >
              {Math.floor(props.mostDownvoted[i][0] * 100)}%
            </div>
            <div
              style={{
                width:
                  Math.floor(100 - props.mostDownvoted[i][0] * 100 - 5) + "%",
                backgroundColor: "royalblue",
                height: "20px",
                fontSize: "13px",
                textAlign: "left",
                padding: "0px 0px 0px 10px",
                float: "left",
                borderTopRightRadius: "10px",
                borderBottomRightRadius: "10px",
              }}
            >
              {Math.floor(100 - props.mostDownvoted[i][0] * 100)}%
            </div>
          </div>
          <div
            className="searchLink"
            style={{
              fontSize: "16px",
              marginTop: "10px",
            }}
          >
            {props.mostDownvoted[i][1].title}
          </div>
          <div
            style={{
              width: "100%",
              fontSize: "13px",
              marginBottom: "10px",
              color: "silver",
              marginTop: "10px",
            }}
          >
            {numToString(props.mostDownvoted[i][1].comments)} comments
            {props.mostDownvoted[i][1].coins > 0 && (
              <span>
                , {numToString(props.mostDownvoted[i][1].coins)} reddit coins
              </span>
            )}
          </div>
        </a>
      </div>
    );
  }

  return (
    <div>
      {data.length > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      )}
      <div className="header">
        <div className="title">GENERAL STATS</div>
        <div className="upsHeader">{numToString(props.stats.upvotes)}</div>
        <div className="itemContext">UPVOTES</div>
        <div className="downsHeader">{numToString(props.stats.downvotes)}</div>
        <div className="itemContext">DOWNVOTES</div>
      </div>
      <div className="centering">
        <div className="header twoColumn">
          <div className="title">POSTS</div>
          <div className="size30 upsHeader">
            {numToString(props.stats.posts.upvotes)}
          </div>
          <div className="itemContext">UPVOTES</div>
          <div className="size30 downsHeader">
            {numToString(props.stats.posts.downvotes)}
          </div>
          <div className="itemContext">DOWNVOTES</div>
        </div>
        <div className="header twoColumn">
          <div className="title">COMMENTS</div>
          <div className="size30 upsHeader">
            {numToString(props.stats.comments.upvotes)}
          </div>
          <div className="itemContext">UPVOTES</div>
          <div className="size30 commentAwardsHeader">
            {numToString(props.stats.comments.awards)}
          </div>
          <div className="itemContext">AWARDS</div>
        </div>
      </div>
      <div className="header">
        <div className="title">COIN VALUE</div>
        <div className="profitHeader">
          $ {numToString(props.stats.earnings)}
        </div>
        <div className="itemContext">ESTIMATED EARNINGS</div>
      </div>
      <div className="header">
        <div className="title">MONETARY STATS</div>
        <div className="coinsHeader">{numToString(props.stats.coins)}</div>
        <div className="itemContext">COINS</div>
        <div className="awardsHeader">{numToString(props.stats.awards)}</div>
        <div className="itemContext">AWARDS</div>
      </div>
      <div className="header">
        <div className="title">LOWEST UPVOTE RATIO</div>
        <div style={{ textAlign: "left" }}>{newsListDOM}</div>
      </div>
    </div>
  );
}

/**
 * Converts number to string with abbreviation
 * @param {*} num - Number to convert
 * @returns Number with abbreviation
 */
export function numToString(num) {
  return Math.abs(num) >= 1.0e9
    ? (Math.abs(num) / 1.0e9).toFixed(3) + "B"
    : Math.abs(num) >= 1.0e6
    ? (Math.abs(num) / 1.0e6).toFixed(3) + "M"
    : Math.abs(num) >= 1.0e3
    ? (Math.abs(num) / 1.0e3).toFixed(3) + "K"
    : Math.abs(num).toFixed(2);
}
