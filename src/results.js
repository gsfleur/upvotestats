export default function Results(props) {
  /**
   * Converts number to string with abbreviation
   * @param {*} num - Number to convert
   * @returns Number with abbreviation
   */
  function numToString(num) {
    // Nine Zeroes for Billions
    return Math.abs(num) >= 1.0e9
      ? (Math.abs(num) / 1.0e9).toFixed(3) + " B"
      : // Six Zeroes for Millions
      Math.abs(num) >= 1.0e6
      ? (Math.abs(num) / 1.0e6).toFixed(3) + " M"
      : // Three Zeroes for Thousands
      Math.abs(num) >= 1.0e3
      ? (Math.abs(num) / 1.0e3).toFixed(3) + " K"
      : Math.abs(num).toFixed(2);
  }

  return (
    <div>
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
