import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

export default function Scroll(props) {
  // React Router History
  const history = useHistory();

  // Component state
  const [state, setState] = useState({ loaded: false });

  useEffect(() => {
    let componentMounted = true;

    if (state.loaded === false) {
      // Forward and Back button
      history.listen(() => {
        window.scrollTo({ top: 0 });
      });

      // Hide and Display back to top button
      window.onscroll = function (ev) {
        const scrolledPercent =
          (window.innerHeight + window.pageYOffset) /
          window.document.body.scrollHeight;
        if (
          scrolledPercent >= 0.2 &&
          window.document.body.scrollHeight > 4000 &&
          window.innerWidth > 600
        ) {
          document.getElementById("backToTop").style.display = "inline";
        } else {
          document.getElementById("backToTop").style.display = "none";
        }

        // trend menu DOM
        const trendMenu = document.getElementById("trendMenu");
        const trendLoc = document.getElementById("trendLoc");

        // Fix trend menu to top of screen
        if (trendMenu != null) {
          if (window.pageYOffset > 154) {
            if (trendMenu.style.position !== "fixed") {
              trendMenu.style.position = "fixed";
              trendLoc.style.marginBottom = "84px";
              trendMenu.style.borderBottom =
                props.theme === "light"
                  ? "1px solid rgb(0, 0, 0, 0.1)"
                  : "1px solid #222222";
            }
          } else {
            if (trendMenu.style.position !== "static") {
              trendMenu.style.position = "static";
              trendLoc.style.marginBottom = "0px";
              trendMenu.style.borderBottom = "none";
            }
          }
        }
      };

      if (componentMounted) {
        state.loaded = true;
        setState({ ...state });
      }
    }

    return () => {
      componentMounted = false;
    };
  }, [state, history, props.theme]);

  return null;
}
