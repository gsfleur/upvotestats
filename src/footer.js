export default function Footer() {
  return (
    <div className="centering">
      <div className="footer">
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
        <div style={{ color: "gray", textAlign: "center", fontWeight: "bold" }}>
          <a
            className="searchLink"
            href="https://github.com/gsfleur/upvotestats"
            target="_blank"
            rel="noreferrer"
          >
            <b>Open Source</b>
          </a>
        </div>
        <br />
        <div style={{ color: "gray", textAlign: "center", fontWeight: "bold" }}>
          &copy; 2021-{new Date().getFullYear().toString().substring(2, 4)}{" "}
          Upvote Stats
        </div>
      </div>
    </div>
  );
}
