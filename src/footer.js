export default function Footer(props) {
  return (
    <div className="centering">
      <div className={props.getClass("footer")}>
        <div className="centering">
          <button
            onClick={() => {
              localStorage.setItem(
                "theme",
                props.theme === "light" ? "dark" : "light"
              );
              window.location.reload();
            }}
            className={props.getClass("themeButton")}
          >
            {props.theme === "light" && <span>DARK THEME</span>}
            {props.theme === "dark" && <span>LIGHT THEME</span>}
          </button>
        </div>
        <a href="https://ko-fi.com/Q5Q0733FX" target="_blank" rel="noreferrer">
          <img
            height="36"
            style={{ border: "0px", height: "36px" }}
            src="https://cdn.ko-fi.com/cdn/kofi5.png?v=3"
            border="0"
            alt="Buy Me a Coffee at ko-fi.com"
          />
        </a>
        <br />
        <br />
        <div style={{ textAlign: "center", fontWeight: "bold" }}>
          <a
            className={props.getClass("searchLink")}
            href="https://github.com/gsfleur/upvotestats"
            target="_blank"
            rel="noreferrer"
          >
            <b>Open Source</b>
          </a>
        </div>
        <br />
        <div style={{ textAlign: "center", fontWeight: "bold" }}>
          &copy; {new Date().getFullYear()} Upvote Stats
        </div>
      </div>
    </div>
  );
}
