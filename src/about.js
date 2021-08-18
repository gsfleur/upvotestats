export default function About() {
  window.document.title = "Upvote Stats - About";

  return (
    <div className="centering">
      <div className="about">
        <div>
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
          By default, only the most recent one hundred top posts from this past
          month are analyzed for the convenience of processing time. However,
          you can click the 'Load more data' button at the top of each page to
          continue processing even more data in order to achieve the best
          results.
          <br />
          <br />
          If you encounter any issues or bugs, please refer to the Twitter link
          in the footer as a means for contact.
          <br />
          <br />
          This website was built with the Reddit API.
        </div>
      </div>
    </div>
  );
}
