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

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
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
    ? (Math.abs(num) / 1.0e9).toFixed(3) + " B"
    : Math.abs(num) >= 1.0e6
    ? (Math.abs(num) / 1.0e6).toFixed(3) + " M"
    : Math.abs(num) >= 1.0e3
    ? (Math.abs(num) / 1.0e3).toFixed(3) + " K"
    : Math.abs(num).toFixed(2);
}
