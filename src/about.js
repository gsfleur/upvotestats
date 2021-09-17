export default function About() {
  window.document.title = "Upvote Stats - About";

  return (
    <div className="centering">
      <div className="about">
        <div>
          <h3>General Information</h3>
          Upvote Stats is a free and open-source website that grants users the
          ability to determine the amount of upvotes, downvotes, awards, and
          estimated earnings each subreddit accumulated in the past 30 days.
          <br />
          <br />
          Please note that the data, for such active sites, is constantly
          changing so please don't depend on receiving complete accuracy if
          using the report for something significant.
          <br />
          <br />
          If you encounter any issues or bugs, please refer to the Twitter link
          in the footer as a means for contact.
          <br />
          <br />
          Coin value is based under the assumption that 500 coins equals $1.99
          <br />
          <br />
          There is no downvote metric for comments since there is no downvote
          ratio like there is for upvotes.
          <br />
          <br />
          <h3>The Today Page</h3>
          The Today Page features posts on r/All and are sorted by highest
          downvote ratio. The data for this page will update at most once per
          hour. More stats about r/All can be found at the bottom of this page.
          <br />
          <br />
          <h3>Searching subreddits</h3>
          By default, only the most recent one hundred top posts from this past
          month are analyzed for the convenience of processing time. However,
          you can click the 'Load more data' button at the top of each page to
          continue processing even more data in order to achieve the best
          results.
          <br />
          <br />
          The values calculated are minimum values and will be a bit higher in
          actuality than what is shown here. This is due to the fact that
          processing all of the sub-level comments could take over an hour if
          fetching the JSON for each specific comment to get the exact amount of
          upvotes. However, a ton of time can be saved by just relying on the
          comment data within the JSON of a post. This is the option I chose
          since it's way faster, but this also means that the stats should be
          treated as an underestimation rather than exact values. This is
          especially true since post and comment data are always changing in
          real time.
          <br />
          <br />
          This website was built with the Reddit API.
        </div>
      </div>
    </div>
  );
}
