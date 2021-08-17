import "./App.css";
import "./results.css";
import "./search.css";
import React from "react";
import Home from "./home";
import Search from "./search";
import Results from "./results";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

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
            background: "#292929",
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
            </Typography>
          </Toolbar>
        </AppBar>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <div className="centering">
          <div className="content">
            <Search />
            <Switch>
              <Route path="/search">
                <Results />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}
