# Upvote Stats

## General Information

Upvote Stats is a free and open-source website that grants users the
ability to determine the amount of upvotes, downvotes, awards, and
estimated earnings each subreddit accumulated in the past 30 days.

Please note that the data, for such active sites, is constantly
changing so please don't depend on receiving complete accuracy if
using the report for something significant.

If you encounter any issues or bugs, please refer to the Twitter link
in the footer as a means for contact.

Coin value is based under the assumption that 500 coins equals $1.99

There is no downvote metric for comments since there is no downvote
ratio like there is for upvotes.

## Trending Page

The Trends Page features posts on r/All and is sorted by total reddit
coins in descending order by default. There are other sorting options
available such as by awards or by downvote ratio. You may select posts
from the past day, week or month to show up on your feed. The data is
selected from the top ~1000 posts within the selected time frame. The
data for this page will update every hour. More stats about this data
can be found at the bottom of the trends page.

## Searching subreddits

By default, only the most recent one hundred top posts from this past
month are analyzed for the convenience of processing time. However,
you can click the 'Load more data' button at the top of each page to
continue processing even more data in order to achieve the best
results.

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

This website was built with the Reddit API.

## Website

https://www.upvotestats.com/

## Reddit API

https://www.reddit.com/dev/api/
