// .storybook/preview.js

import '../src/index.css'; // replace with the name of your tailwind css file
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

import { MantineProvider } from '@mantine/core';
import {MuiTheme} from "../src/themes";
import {ThemeProvider} from "@mui/material";
function ThemeWrapper(props) {
  return (
      <ThemeProvider theme={MuiTheme}>
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme: 'dark'
            }}
        >
          {props.children}
        </MantineProvider>
      </ThemeProvider>
  );
}

export const decorators = [(renderStory) => <ThemeWrapper>{renderStory()}</ThemeWrapper>];