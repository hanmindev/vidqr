import React from 'react';

import {ComponentStory, ComponentMeta} from '@storybook/react';
import VideoSearcher from "./VideoSearch";

export default {
    title: 'Video Searcher',
    component: VideoSearcher,
    parameters: {
        mockData: [
            {
                url: 'https://localhost:5000/api/search/',
                method: 'POST',
                status: 200,
                response: {
                    data: {


                    }
                },
            },
        ]
    }

} as ComponentMeta<typeof VideoSearcher>;

export const Primary: ComponentStory<typeof VideoSearcher> = () => <VideoSearcher roomId={"0"}/>;

