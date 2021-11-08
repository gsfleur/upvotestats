import "./css/App.css";
import "./css/home.css";
import "./css/about.css";
import "./css/search.css";
import "./css/results.css";
import "./css/trends.css";
import "./css/mobile.css";
import React from "react";
import Home from "./home";
import About from "./about";
import Trends from "./trends";
import Scroll from "./scroll";
import Search from "./search";
import Fab from "@material-ui/core/Fab";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

// Material UI Styling
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function App() {
  const classes = useStyles();
  return (
    <Router>
      <div>
        <AppBar
          position="static"
          style={{
            background: "#000000",
            borderBottom: "1px solid #222222",
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
              <a href="/" className="menuButton">
                Home
              </a>
              <a href="/trends" className="menuButton">
                Trends
              </a>
              <a href="/about" className="menuButton">
                About
              </a>
            </Typography>
          </Toolbar>
        </AppBar>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <div className="centering">
          <div className="content">
            <Switch>
              <Route path="/search">
                <Search />
              </Route>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/trends">
                <Trends />
              </Route>
              <Route path="/">
                <Search />
                <Home />
              </Route>
            </Switch>
          </div>
        </div>
        <Scroll />
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
        <div className="centering">
          <div className="footer">
            <span>
              <a
                className="searchLink"
                href="https://twitter.com/upvotestats"
                target="_blank"
                rel="noreferrer"
              >
                <b>Twitter</b>
              </a>
            </span>
            <span style={{ color: "gray" }}>&nbsp;&nbsp;</span>
            <span>
              <a
                className="searchLink"
                href="https://www.patreon.com/upvotestats"
                target="_blank"
                rel="noreferrer"
              >
                <b>Donate</b>
              </a>
            </span>
            <span style={{ color: "gray" }}>&nbsp;&nbsp;</span>
            <span>
              <a
                className="searchLink"
                href="https://github.com/gsfleur/upvotestats"
                target="_blank"
                rel="noreferrer"
              >
                <b>Source</b>
              </a>
            </span>
            <br />
            <br />
            <div
              style={{ color: "gray", textAlign: "center", fontWeight: "bold" }}
            >
              &copy; {new Date().getFullYear()} Upvote Stats
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}
