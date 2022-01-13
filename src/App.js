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
    marginTop: "-14px",
  },
  title: {
    flexGrow: 1,
    marginTop: "-15px",
  },
}));

export default function App() {
  const classes = useStyles();
  return (
    <Router>
      <div>
        <AppBar
          className="titleHeader"
          position="static"
          style={{
            background: "#0a0a0a",
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
            <Typography variant="h7" className={classes.title}>
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
            <Suspense fallback={<span></span>}>
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
              <Scroll />
              <Footer />
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
