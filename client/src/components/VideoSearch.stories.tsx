import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';
import VideoSearcher from "./VideoSearch";
export default {
    title: 'Video Searcher',
    component: VideoSearcher,
} as ComponentMeta<typeof VideoSearcher>;

export const Primary: ComponentStory<typeof VideoSearcher> = () => <VideoSearcher roomId={"0"}/>;

