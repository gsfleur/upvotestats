export default function Footer(props) {
  /**
   * Creates a link in the footer
   * @param {*} link - href to link to
   * @param {*} color - color of text
   * @param {*} text - text context
   * @param {*} title - text context
   * @param {*} click - on click function
   * @returns dom with a footer link
   */
  function footerLink(link, text, title, color, click) {
    return (
      <a
        href={link}
        target={link === window.location.pathname ? "_self" : "_blank"}
        rel="noreferrer"
        className={props.getClass("footerLink")}
        style={{ color: color }}
        onClick={click}
        title={title}
      >
        {text}
      </a>
    );
  }

  // Current and opposite theme
  const theme = props.theme === "light" ? "DARK MODE" : "LIGHT MODE";
  const nextTheme = props.theme === "light" ? "dark" : "light";

  // Links in the footer
  const donate = "https://ko-fi.com/Q5Q0733FX";
  const feedback = "https://www.reddit.com/message/compose/?to=upvotestats";
  const source = "https://github.com/gsfleur/upvotestats";
  const reddit = "https://www.reddit.com/";

  return (
    <div className={props.getClass("footer")}>
      {footerLink(donate, "DONATE", "Help fund the website", "dodgerblue")}
      {footerLink(
        window.location.pathname,
        theme,
        "Change the theme",
        "mediumslateblue",
        () => {
          localStorage.setItem("theme", nextTheme);
          window.location.reload();
        }
      )}
      {footerLink(feedback, "FEEDBACK", "Give your feedback", "green")}
      {footerLink(source, "SOURCE", "Source code", "goldenrod")}
      {footerLink(reddit, "REDDIT", "Visit Reddit", "indianred")}
      <div style={{ textAlign: "center", fontWeight: "bold" }}>
        &copy; 2021-{new Date().getFullYear()} Upvote Stats
      </div>
    </div>
  );
}
