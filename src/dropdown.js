import React from "react";
import SelectUnstyled, {
  selectUnstyledClasses,
} from "@mui/base/SelectUnstyled";
import { styled } from "@mui/system";
import PopperUnstyled from "@mui/base/PopperUnstyled";

export default function Dropdown(props) {
  // Dropdown menu styling
  const blue = {
    100: "#DAECFF",
    200: "#99CCF3",
    400: "#3399FF",
    500: "#007FFF",
    600: "#0072E5",
    900: "#003A75",
  };

  const grey = {
    100: "#E7EBF0",
    200: "#E0E3E7",
    300: "rgb(0, 0, 0, 0.1)",
    400: "dodgerblue",
    500: "#A0AAB4",
    600: "#6F7E8C",
    700: "dodgerblue",
    800: "#222222",
    900: "#191919",
  };

  const StyledButton = styled("button")(
    ({ theme }) => `
    font-size: 13px;
    box-sizing: border-box;
    background: transparent;
    border: none;
    border-radius: 0px;
    padding: 0px;
    width: 100%;
    height: 24px;
    text-align: left;
    font-weight: bold;
    color: ${
      props.theme === "dark"
        ? props.type === "report"
          ? "gray"
          : "silver"
        : grey[900]
    };

    &:hover {
      background: none;
      color: dodgerblue;
    }

    &.${selectUnstyledClasses.focusVisible} {
      outline: 3px solid ${props.theme === "dark" ? blue[600] : blue[100]};
    }

    &.${selectUnstyledClasses.expanded} {
      &::after {
        content: '${props.type === "report" ? "\\2022\\2022\\2022" : "▴"}';
        margin-left: 5px;
      }
    }

    &::after {
      content: '${props.type === "report" ? "\\2022\\2022\\2022" : "▾"}';
      float: right;
      margin-left: 5px;
    }
    `
  );

  const StyledListbox = styled("ul")(
    ({ theme }) => `
    font-size: 13px;
    box-sizing: border-box;
    padding: 5px;
    margin: 10px 0px 10px 0px;
    width: 150px;
    background: ${props.theme === "dark" ? grey[900] : "#fff"};
    border: 1px solid ${props.theme === "dark" ? grey[800] : grey[300]};
    border-radius: 10px;
    color: ${props.theme === "dark" ? "silver" : grey[900]};
    overflow: auto;
    outline: 0px;
    `
  );

  const StyledPopper = styled(PopperUnstyled)`
    z-index: 1;
  `;

  const CustomSelect = React.forwardRef(function CustomSelect(props, ref) {
    const components = {
      Root: StyledButton,
      Listbox: StyledListbox,
      Popper: StyledPopper,
      ...props.components,
    };

    return <SelectUnstyled {...props} ref={ref} components={components} />;
  });

  return <CustomSelect {...props} title="Dropdown menu button" />;
}
