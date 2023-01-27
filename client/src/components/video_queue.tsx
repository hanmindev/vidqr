import React, {useEffect, useState} from "react";
import ReactPlayer from 'react-player'
import {socket} from "../config/socket";
import {API_URL} from "../config/url";
import aFetch from "../config/axios";


function QueueVideo(props: { videoLink: string; title: string; user: string; videoThumbnail: string; isCurrent: boolean; }) {
    let videoTitle = props.title;
    if (videoTitle.length > 24) {
        videoTitle = videoTitle.substring(0, 24) + "...";
    }

    const body = <>
        <div style={{position: "relative"}}>
            <img src={props.videoThumbnail}
                 width="150px"
                 height="100px" alt={videoTitle}/>
        </div>
        <div className="videoInformation">
            <b className="videoTitle">{videoTitle}</b>
            <p className="videoUser">{"queued by: " + props.user}</p>
        </div>
    </>

    return (
        props.isCurrent ? <div className="queueVideo" style={{background: 'rgb(48,197,38)'}}>
            {body}
        </div>:
            <div className="queueVideo">
            {body}
        </div>
);
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
            if (data.videoList !== undefined)
                setVideoList(data.videoList);
        });
    };
    return (
        <div>
            <p>Current Queue:</p>
            {videoList.map((video: {videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number}, index: number) =>
                (
                    <QueueVideo key={video.videoId} isCurrent={index===0} videoLink={video.videoLink} videoThumbnail={video.videoThumbnail} title={video.videoTitle} user={video.videoUsername} />
                )
            )
            }
        </div>
    );
}

export {VideoQueue};