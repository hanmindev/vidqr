import {createTheme} from "@mui/material";

export const MuiTheme = createTheme({
    palette: {
        mode: 'dark',
        text: {
            primary: "#dadada",
            secondary: "#dadada",
            disabled: "#dadada"
        }
    },
    components: {
        MuiLink: {
            defaultProps: {
                color: "#3ea0fd",
            }
        }
    }
});

