export default function About() {
  window.document.title = "About - Upvote Stats";

  return (
    <div className="centering">
      <div className="about">
        <div className="centering">
          <div style={{ width: "90%" }}>
            <h3>General Information</h3>
            Upvote Stats is a free and open-source website that grants users the
            ability to determine the amount of upvotes, downvotes, awards, and
            estimated earnings each subreddit accumulated in the past 30 days.
            Coin value is based under the assumption that 500 coins equals two
            dollards USD. There is no downvote metric for comments since there
            is no downvote ratio like there is for upvotes.
            <h3>Trending Page</h3>
            The Trends Page features posts on r/All along with the phrases that
            are trending in their comment sections. The posts are sorted by
            relevance by default, however, there are other sorting options
            available such as by coins, awards or downvote ratio. The trends are
            curated through algorithmic use of natural language processing
            techniques on the comments. The data for this page will update every
            hour. More stats about this data can be found at the bottom of the
            trends page.
            <h3>Searching subreddits</h3>
            By default, only the most recent one hundred top posts from this
            past month are analyzed for the convenience of processing time.
            However, you can click the 'Load more data' button at the top of
            each page to continue processing even more data in order to achieve
            the best results.
            <br />
            <br />
            The values calculated are minimum values and will be a bit higher in
            actuality than what is shown here. This is due to the fact that
            processing all of the sub-level comments could take over an hour if
            fetching the JSON for each specific comment to get the exact amount
            of upvotes. However, a ton of time can be saved by just relying on
            the comment data within the JSON of a post. This is the option I
            chose since it's way faster, but this also means that the stats
            should be treated as an underestimation rather than exact values.
            This is especially true since post and comment data are always
            changing in real time.
            <br />
            <br />
            This website was built with the Reddit API.
          </div>
        </div>
      </div>
    </div>
  );
}
