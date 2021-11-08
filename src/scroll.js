import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

export default function Scroll() {
  // React Router History
  let history = useHistory();

  // Component state
  const [state, setState] = useState({ loaded: false });

  // Load data from chess api
  useEffect(() => {
    let componentMounted = true;

    if (state.loaded === false) {
      // Forward and Back button
      history.listen((location) => {
        document
          .getElementById("content")
          .scrollTo({ top: 0, behavior: "smooth" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Hide and Display back to top button
      window.onscroll = function (ev) {
        let scrolledPercent =
          (window.innerHeight + window.pageYOffset) /
          window.document.body.scrollHeight;
        if (
          scrolledPercent >= 0.6 &&
          window.document.body.scrollHeight > 2000 &&
          window.innerWidth >= 800
        ) {
          document.getElementById("backToTop").style.display = "inline";
        } else {
          document.getElementById("backToTop").style.display = "none";
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
  }, [state, history]);

  return <span></span>;
}
