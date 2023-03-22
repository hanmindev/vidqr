import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {MantineProvider} from '@mantine/core';
import {ThemeProvider} from "@mui/material";
import {MuiTheme} from "./themes";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
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
);