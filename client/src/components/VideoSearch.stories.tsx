import React from 'react';

import {ComponentStory, ComponentMeta} from '@storybook/react';
import VideoSearcher, {VideoIcon} from "./VideoSearch";

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
                    data: {}
                },
            },
        ]
    }

} as ComponentMeta<typeof VideoSearcher>;

export const Primary: ComponentStory<typeof VideoSearcher> = (args) => <VideoSearcher roomId={"0"}/>;

export const VideoCard: ComponentStory<typeof VideoIcon> = (args) => <div className="w-80 h-60">
    <VideoIcon {...args} queueVideo={() => {
    }}/>
</div>

VideoCard.args = {
    thumbnailLink: "https://i1.sndcdn.com/artworks-oUpMNoCS8eIfPvi9-ns9yqg-large.jpg",
    title: "test",
    channelName: "test",
    videoLink: "test"
}