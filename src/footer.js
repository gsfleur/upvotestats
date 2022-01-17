export default function Footer(props) {
  return (
    <div className={props.getClass("footer")}>
      <a
        href="https://ko-fi.com/Q5Q0733FX"
        target="_blank"
        rel="noreferrer"
        className={props.getClass("footerLink")}
        style={{ color: "dodgerblue" }}
      >
        DONATE
      </a>
      <a
        href={window.location.pathname}
        onClick={() => {
          localStorage.setItem(
            "theme",
            props.theme === "light" ? "dark" : "light"
          );
          window.location.reload();
        }}
        className={props.getClass("footerLink")}
        style={{ color: "mediumslateblue" }}
      >
        {props.theme === "light" && <span>DARK THEME</span>}
        {props.theme === "dark" && <span>LIGHT THEME</span>}
      </a>
      <a
        href="https://www.reddit.com/message/compose/?to=upvotestats"
        target="_blank"
        rel="noreferrer"
        className={props.getClass("footerLink")}
        style={{ color: "green" }}
      >
        FEEDBACK
      </a>
      <a
        href="https://github.com/gsfleur/upvotestats"
        target="_blank"
        rel="noreferrer"
        className={props.getClass("footerLink")}
        style={{ color: "goldenrod" }}
      >
        SOURCE
      </a>
      <a
        href="https://www.reddit.com/"
        target="_blank"
        rel="noreferrer"
        className={props.getClass("footerLink")}
        style={{ color: "indianred" }}
      >
        REDDIT
      </a>
      <div style={{ textAlign: "center", fontWeight: "bold" }}>
        &copy; {new Date().getFullYear()} Upvote Stats
      </div>
    </div>
  );
}
