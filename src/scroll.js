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

        // Fix trend menu to top of screen
        if (document.getElementById("trendMenu") != null) {
          if (window.pageYOffset > 154) {
            document.getElementById("trendMenu").style.position = "fixed";
            document.getElementById("trendLoc").style.marginBottom = "84px";
            document.getElementById("trendMenu").style.borderBottom =
              props.theme === "light"
                ? "1px solid rgb(0, 0, 0, 0.1)"
                : "1px solid #222222";
          } else {
            document.getElementById("trendMenu").style.position = "static";
            document.getElementById("trendLoc").style.marginBottom = "0px";
            document.getElementById("trendMenu").style.borderBottom = "none";
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
