export default function Footer(props) {
  return (
    <div className="centering">
      <div className={props.getClass("footer")}>
        <a href="https://ko-fi.com/Q5Q0733FX" target="_blank" rel="noreferrer">
          <button
            className={props.getClass("footerButton")}
            style={{ color: "dodgerblue" }}
          >
            DONATE
          </button>
        </a>
        <button
          onClick={() => {
            localStorage.setItem(
              "theme",
              props.theme === "light" ? "dark" : "light"
            );
            window.location.reload();
          }}
          className={props.getClass("footerButton")}
          style={{ color: "mediumslateblue" }}
        >
          {props.theme === "light" && <span>DARK THEME</span>}
          {props.theme === "dark" && <span>LIGHT THEME</span>}
        </button>
        <a
          className={props.getClass("searchLink")}
          href="https://www.reddit.com/message/compose/?to=upvotestats"
          target="_blank"
          rel="noreferrer"
        >
          <button
            className={props.getClass("footerButton")}
            style={{ color: "green" }}
          >
            FEEDBACK
          </button>
        </a>
        <a
          className={props.getClass("searchLink")}
          href="https://github.com/gsfleur/upvotestats"
          target="_blank"
          rel="noreferrer"
        >
          <button
            className={props.getClass("footerButton")}
            style={{ color: "goldenrod" }}
          >
            SOURCE
          </button>
        </a>
        <a
          className={props.getClass("searchLink")}
          href="https://www.reddit.com/"
          target="_blank"
          rel="noreferrer"
        >
          <button
            className={props.getClass("footerButton")}
            style={{ color: "indianred" }}
          >
            REDDIT
          </button>
        </a>
        <br />
        <div style={{ textAlign: "center", fontWeight: "bold" }}>
          &copy; {new Date().getFullYear()} Upvote Stats
        </div>
      </div>
    </div>
  );
}
