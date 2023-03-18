import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {MantineProvider} from '@mantine/core';
import {Auth0Provider} from "@auth0/auth0-react";
import {ThemeProvider} from "@mui/material";
import {MuiTheme} from "./themes";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <Auth0Provider
        domain="dev-2ah1ozn8qz2cjqsv.us.auth0.com"
        clientId="ZoQ0ZNfyRJgqPTRSq1gzBEXcnQA9u7DZ"
        authorizationParams={{
            redirect_uri: window.location.origin
        }}
    >
        <ThemeProvider theme={MuiTheme}>
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    colorScheme: 'dark'
                }}
            >
                <App/>
            </MantineProvider>
        </ThemeProvider>
    </Auth0Provider>
);