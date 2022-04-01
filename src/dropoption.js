import OptionUnstyled, {
  optionUnstyledClasses,
} from "@mui/base/OptionUnstyled";
import { styled } from "@mui/system";

export default function DropOption(props) {
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
    400: "orangered",
    500: "#A0AAB4",
    600: "#6F7E8C",
    700: "orangered",
    800: "#222222",
    900: "#191919",
  };

  const StyledOption = styled(OptionUnstyled)(
    ({ theme }) => `
    list-style: none;
    padding: 5px;
    border-radius: 0.45em;
    cursor: default;

    &:last-of-type {
      border-bottom: none;
    }

    &.${optionUnstyledClasses.selected} {
      background-color: ${props.theme === "dark" ? blue[900] : blue[100]};
      color: ${props.theme === "dark" ? blue[100] : blue[900]};
    }

    &.${optionUnstyledClasses.highlighted} {
      background-color: ${props.theme === "dark" ? grey[800] : grey[100]};
      color: ${props.theme === "dark" ? "silver" : grey[900]};
    }

    &.${optionUnstyledClasses.highlighted}.${optionUnstyledClasses.selected} {
      background-color: ${props.theme === "dark" ? blue[900] : blue[100]};
      color: ${props.theme === "dark" ? blue[100] : blue[900]};
    }

    &.${optionUnstyledClasses.disabled} {
      color: ${props.theme === "dark" ? grey[700] : grey[400]};
    }

    &:hover:not(.${optionUnstyledClasses.disabled}) {
      background-color: ${props.theme === "dark" ? grey[800] : grey[100]};
      color: ${props.theme === "dark" ? "silver" : grey[900]};
    }
    `
  );

  return <StyledOption {...props} />;
}
