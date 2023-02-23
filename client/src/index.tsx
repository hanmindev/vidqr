import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { MantineProvider } from '@mantine/core';
import {Auth0Provider} from "@auth0/auth0-react";
import {createTheme, ThemeProvider} from "@mui/material";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

const MuiTheme = createTheme({
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

root.render(
    <Auth0Provider
        domain="dev-2ah1ozn8qz2cjqsv.us.auth0.com"
        clientId="ZoQ0ZNfyRJgqPTRSq1gzBEXcnQA9u7DZ"
        authorizationParams={{
            redirect_uri: window.location.origin
        }}
    >
        <React.StrictMode>
            <ThemeProvider theme={MuiTheme}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme: 'dark'
                }}
            >
                <App />
            </MantineProvider>
        </ThemeProvider>
        </React.StrictMode>
    </Auth0Provider>
);