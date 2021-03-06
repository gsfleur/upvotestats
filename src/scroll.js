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
          (window.innerHeight + window.scrollY) /
          window.document.body.scrollHeight;

        // backToTop button DOM
        const backToTop = document.getElementById("backToTop");

        if (backToTop) {
          if (
            scrolledPercent >= 0.2 &&
            window.document.body.scrollHeight > 4000 &&
            window.innerWidth > 600
          ) {
            backToTop.style.display = "inline";
          } else {
            backToTop.style.display = "none";
          }
        }

        // trend menu DOM
        const trendMenu = document.getElementById("trendMenu");

        // Setting trend menu bottom border
        if (trendMenu != null) {
          if (window.pageYOffset > 69) {
            trendMenu.style.borderBottom =
              props.theme === "light"
                ? "1px solid rgb(0, 0, 0, 0.1)"
                : "1px solid #222222";
          } else {
            trendMenu.style.borderBottom = "1px solid transparent";
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
