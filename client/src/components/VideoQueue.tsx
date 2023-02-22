import React, {useEffect, useState} from "react";
import {socket} from "../config/socket";
import {ActionIcon, Button, Image} from "@mantine/core";
import {
    IconArrowBarDown, IconArrowBarUp,
    IconPlayerPause,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconTrash
} from "@tabler/icons-react";
import "./VideoQueue.css";
import aFetch from "../config/axios";
import {useHover} from "../hooks/hooks";


function QueueVideo(props: { index: number; videoLink: string; title: string; user: string; videoThumbnail: string; isCurrent: boolean; isMine?: boolean}) {
    let videoTitle = props.title;
    const [hoverRef, isHovered] = useHover<HTMLDivElement>();

    const queueControls = (action: any) => {
        aFetch.post('/api/room/mediaControl/', {action: action, index: props.index}).then(response => {
            // console.log(response.data);
        })
    }

    const raiseVideo = () => {
        queueControls("raise");
    }
    const lowerVideo = () => {
        queueControls("lower");
    }
    const deleteVideo = () => {
        queueControls("delete");
    }

    let style = undefined;
    if (props.isCurrent) {
        style = {background: 'rgb(48,197,38)'};
    }else if (props.isMine) {
        style = {background: 'rgb(206,108,108)'};
    }

    return (
        <div className="flex flex-row overflow-hidden flex-wrap h-20" ref={hoverRef} style={style}>
            <div className="w-20 h-20 relative">
                <Image src={props.videoThumbnail}
                       style={{objectFit: "cover"}}
                       width={75}
                       height={75}
                       withPlaceholder
                       placeholder={<p/>}
                />
            </div>
            <div className="w-9/12 h-full ml-0.5">
                <div className="w-full h-12 overflow-hidden">
                    <b>{videoTitle}</b>
                </div>
                <p className="w-full">{"queued by: " + props.user}</p>
            </div>
            {isHovered ? <div className="float-right">
                <ActionIcon onClick={raiseVideo}>
                    <IconArrowBarUp size={18} />
                </ActionIcon>
                <ActionIcon onClick={lowerVideo}>
                    <IconArrowBarDown size={18} />
                </ActionIcon>
                <ActionIcon onClick={deleteVideo}>
                    <IconTrash size={18} />
                </ActionIcon>
            </div>: undefined}
        </div>
    );
}


function MediaControls(){
    const mediaControls = (action: any) => {
        aFetch.post('/api/room/mediaControl/', {action: action}).then(response => {
            // console.log(response.data);
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
function VideoQueue(params: { roomId: string; username?: string;})  {

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

    let firstVideo = videoList.length === 0 ? {videoLink: "", videoThumbnail: "", videoTitle: "No videos queued!", videoUsername: "none"} : videoList[0];
    return (
        <div className="bg-gray-900 right-0 flex h-full w-96 min-w-[24rem]">
            <div className="bg-gray-900 rounded flex flex-col min-h-0 max-h-full overflow-x-hidden
            md:absolute md:overflow-y-auto
            relative overflow-y-hidden">

                <div className="border-solid bg-gray-900 border-gray-700 border-2 rounded mb-2 max-w-sm min-w-sm">
                    <QueueVideo index={0} isCurrent={true} videoLink={firstVideo.videoLink} videoThumbnail={firstVideo.videoThumbnail} title={firstVideo.videoTitle} user={firstVideo.videoUsername} />
                    <MediaControls/>
                </div>
                <p>Current Queue:</p>

                {videoList.map((video: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}, index: number) =>
                    (
                        index===0 ? null :
                            <div className="border-solid bg-gray-900 border-gray-700 border-2 rounded mb-2 max-w-sm min-w-sm" key={index}>
                                <QueueVideo index={index} key={index} isCurrent={false} isMine={params.username===video.videoUsername} videoLink={video.videoLink} videoThumbnail={video.videoThumbnail} title={video.videoTitle} user={video.videoUsername} />
                            </div>
                    )
                )}
            </div>
        </div>
    );
}

export {VideoQueue};