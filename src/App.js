import "./css/App.css";
import "./css/home.css";
import "./css/about.css";
import "./css/search.css";
import "./css/results.css";
import "./css/trends.css";
import "./css/footer.css";
import "./css/mobile.css";
import Fab from "@material-ui/core/Fab";
import React, { Suspense, lazy } from "react";
import AppBar from "@material-ui/core/AppBar";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import WhatshotIcon from "@mui/icons-material/Whatshot";
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
    "& .MuiToolbar-regular": {
      height: "48px",
      minHeight: "48px",
    },
  },
  menuButton: {
    marginRight: theme.spacing(1),
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
  if (theme == null) {
    // Initially set to dark if prefers
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      localStorage.setItem("theme", "dark");
      window.location.reload();
    } else {
      // otherwise set to light
      localStorage.setItem("theme", "light");
    }
  }
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
    return theme === "light" ? n + " " + n + "Light" : n;
  }

  // Window path name
  const pathname = window.location.pathname;

  // Main menu button colors
  const menuBtnOn = theme === "light" ? "black" : "white";
  const menuBtnOff = theme === "light" ? "slategray" : "gray";

  return (
    <Router>
      <div>
        <AppBar
          position="static"
          id={theme === "light" ? "mainmenuLight" : "mainmenu"}
          className={classes.root}
        >
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <div className="mainmenuButtons">
                <a
                  href="/"
                  className={getClass("menuButton")}
                  title="Home Page"
                  style={{
                    color:
                      !pathname.startsWith("/trends") &&
                      !pathname.startsWith("/about")
                        ? menuBtnOn
                        : menuBtnOff,
                  }}
                >
                  <HomeIcon fontSize="medium" />
                </a>
                <a
                  href="/trends"
                  className={getClass("menuButton")}
                  title="Trends Page"
                  style={{
                    color: pathname.startsWith("/trends")
                      ? menuBtnOn
                      : menuBtnOff,
                  }}
                >
                  <WhatshotIcon fontSize="medium" />
                </a>
                <a
                  href="/about"
                  className={getClass("menuButton")}
                  title="About Page"
                  style={{
                    color: pathname.startsWith("/about")
                      ? menuBtnOn
                      : menuBtnOff,
                  }}
                >
                  <InfoIcon fontSize="medium" />
                </a>
              </div>
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
                  <Footer theme={theme} getClass={getClass} />
                </Route>
                <Route path="/about">
                  <About theme={theme} getClass={getClass} />
                  <Footer theme={theme} getClass={getClass} />
                </Route>
                <Route path="/trends">
                  <Trends theme={theme} getClass={getClass} />
                  <Footer theme={theme} getClass={getClass} />
                </Route>
                <Route path="/">
                  <Search theme={theme} getClass={getClass} />
                  <Footer theme={theme} getClass={getClass} />
                  <Home theme={theme} getClass={getClass} />
                </Route>
              </Switch>
              <Scroll theme={theme} />
            </Suspense>
          </div>
        </div>
        <div id="backToTop" className="backToTopButton">
          <Fab
            color="default"
            size="small"
            aria-label="scroll back to top"
            onClick={() => window.scrollTo({ top: 0 })}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </div>
      </div>
    </Router>
  );
}
