export default function Results(props) {
  function numToString(num) {
    // Nine Zeroes for Billions
    return Math.abs(num) >= 1.0e9
      ? Math.abs(num) / 1.0e9 + " B"
      : // Six Zeroes for Millions
      Math.abs(num) >= 1.0e6
      ? Math.abs(num) / 1.0e6 + " M"
      : // Three Zeroes for Thousands
      Math.abs(num) >= 1.0e3
      ? Math.abs(num) / 1.0e3 + " K"
      : Math.abs(num);
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
          <div className="size30 downsHeader">
            {numToString(props.stats.comments.downvotes)}
          </div>
          <div className="itemContext">DOWNVOTES</div>
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