import "./css/App.css";
import "./css/home.css";
import "./css/about.css";
import "./css/search.css";
import "./css/results.css";
import "./css/trends.css";
import "./css/mobile.css";
import Fab from "@material-ui/core/Fab";
import React, { Suspense, lazy } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

// Route based code splitting
const Home = lazy(() => import("./home"));
const About = lazy(() => import("./about"));
const Footer = lazy(() => import("./footer"));
const Trends = lazy(() => import("./trends"));
const Scroll = lazy(() => import("./scroll"));
const Search = lazy(() => import("./search"));

// Material UI Styling
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: "white",
  },
  title: {
    flexGrow: 1,
  },
}));

export default function App() {
  const classes = useStyles();

  // Getting theme
  let theme = localStorage.getItem("theme");
  if (theme == null) localStorage.setItem("theme", "light");
  if (theme !== "light" && theme !== "dark") theme = "light";

  // Setting light theme background
  if (theme === "light") {
    document.body.style.background = "white";
    document.body.style.color = "black";
  }

  /**
   * Gets class names for specific theme
   * @param {*} n - class name
   * @returns class names for theme
   */
  function getClass(n) {
    if (theme === "light") {
      return n + " " + n + "Light";
    } else {
      return n;
    }
  }

  return (
    <Router>
      <div>
        <AppBar
          position="static"
          style={{
            borderBottom: "1px solid #222222",
            background: theme === "dark" ? "#0a0a0a" : "#191919",
            boxShadow: "0px 0px 0px 0px",
          }}
        >
          <Toolbar>
            <a href="/">
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
              >
                <img src="favicon.ico" alt="logo" height="30px" width="30px" />
              </IconButton>
            </a>
            <Typography variant="h6" className={classes.title}>
              <a href="/" className={getClass("menuButton")}>
                Home
              </a>
              <a href="/trends" className={getClass("menuButton")}>
                Trends
              </a>
              <a href="/about" className={getClass("menuButton")}>
                About
              </a>
            </Typography>
          </Toolbar>
        </AppBar>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <div className="centering">
          <div className="content">
            <Suspense fallback={<span></span>}>
              <Switch>
                <Route path="/search">
                  <Search theme={theme} getClass={getClass} />
                </Route>
                <Route path="/about">
                  <About theme={theme} getClass={getClass} />
                </Route>
                <Route path="/trends">
                  <Trends theme={theme} getClass={getClass} />
                </Route>
                <Route path="/">
                  <Search theme={theme} getClass={getClass} />
                  <Home theme={theme} getClass={getClass} />
                </Route>
              </Switch>
              <Scroll />
              <Footer theme={theme} getClass={getClass} />
            </Suspense>
          </div>
        </div>
        <div id="backToTop" className="backToTopButton">
          <Fab
            color="default"
            size="small"
            aria-label="scroll back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </div>
      </div>
    </Router>
  );
}
