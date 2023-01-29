import React, {useEffect, useState} from "react";
import {socket} from "../config/socket";
import {ActionIcon, Button, Stack} from "@mantine/core";
import {
    IconArrowBarDown, IconArrowBarUp,
    IconPlayerPause,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconTrash
} from "@tabler/icons-react";
import "./video_queue.css";
import aFetch from "../config/axios";
import {useHover} from "../hooks/hooks";


function QueueVideo(props: { videoLink: string; title: string; user: string; videoThumbnail: string; isCurrent: boolean; }) {
    let videoTitle = props.title;
    if (videoTitle.length > 24) {
        videoTitle = videoTitle.substring(0, 24) + "...";
    }
    const [hoverRef, isHovered] = useHover<HTMLDivElement>();

    const body = <>
        <div className="videoThumbnail" style={{position: "relative"}}>
            <img src={props.videoThumbnail}
                 style={{objectFit: "cover"}}
                 width="75px"
                 height="75px" alt={videoTitle}/>
        </div>
        <div className="videoInformation">
            <b className="videoTitle">{videoTitle}</b>
            <p className="videoUser">{"queued by: " + props.user}</p>
        </div>
        {isHovered ? <div className="queueOption">
            <ActionIcon>
                <IconArrowBarUp size={18} />
            </ActionIcon>
            <ActionIcon>
                <IconArrowBarDown size={18} />
            </ActionIcon>
            <ActionIcon>
                <IconTrash size={18} />
            </ActionIcon>
        </div>: undefined}
    </>

    return (
        <div className="queueVideo" ref={hoverRef} style={props.isCurrent ? {background: 'rgb(48,197,38)'} : undefined}>
            {body}
        </div>
    );
}


function MediaControls(){
    const mediaControls = (action: any) => {
        aFetch.post('/api/host/mediaControl/', {action: action}).then(response => {
            console.log(response.data);
        })

    }

    const prevVideo = () => {
        mediaControls("prev");
    }
    const play = () => {
        mediaControls("play");
    }
    const nextVideo = () => {
        mediaControls("next");

    }


    return (
        <div>
            <Button.Group>
                <ActionIcon onClick={prevVideo}>
                    {<IconPlayerSkipBack/>}
                </ActionIcon>
                <ActionIcon onClick={play}>
                    {<IconPlayerPause/>}
                </ActionIcon>
                <ActionIcon onClick={nextVideo}>
                    {<IconPlayerSkipForward/>}
                </ActionIcon>
            </Button.Group>
        </div>
    )

}
function VideoQueue(params: { roomId: string; })  {

    const [videoList, setVideoList] = useState([]);
    // params.roomId

    useEffect(() => {
        getVideoList();
    }, [videoList.length]);

    useEffect(() => {
        socket.emit("video:subscribe", {'roomId': params.roomId});
    }, []);

    const getVideoList = () => {
        socket.on("video:videoList", (data: any) => {
            if (data.videoList !== undefined) {
                setVideoList(data.videoList);
            }
        });
    };

    let firstVideo = videoList.length === 0 ? {videoLink: "none", videoThumbnail: "none", videoTitle: "none", videoUsername: "none"} : videoList[0];
    return (
        <div>
            <div className="queueVideoWrapper">
                <QueueVideo isCurrent={true} videoLink={firstVideo.videoLink} videoThumbnail={firstVideo.videoThumbnail} title={firstVideo.videoTitle} user={firstVideo.videoUsername} />
                <MediaControls/>
            </div>
            <p>Current Queue:</p>
            <div className="queueVideoStack">
                {videoList.map((video: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}, index: number) =>
                    (
                        index===0 ? null :
                            <div className="queueVideoWrapper">
                                <QueueVideo key={video.videoId} isCurrent={false} videoLink={video.videoLink} videoThumbnail={video.videoThumbnail} title={video.videoTitle} user={video.videoUsername} />
                            </div>
                    )
                )}
            </div>
        </div>
    );
}

export {VideoQueue};