import React from "react";
import VideoSearcher from "./VideoSearch";
import {VideoQueue} from "./video_queue";


function RemoteMenu(props: {roomId: string, username: string}) {
    return (
        <div className="hViewer">
            <div className="primary">
                <VideoSearcher roomId={props.roomId}/>
            </div>
            <div className="secondary">
                <VideoQueue roomId={props.roomId} username={props.username}/>
            </div>
        </div>
    )
}

function Dashboard(props: {roomId: string, username: string, isHost: boolean}) {
    return (
        <div className="mainViewer">
            <div className="remoteHeader">
                <b>{props.username}</b>

                <b>{props.roomId}</b>

                <b>{props.isHost? "yes": "no"}</b>
            </div>
            <RemoteMenu roomId={props.roomId} username={props.username}/>
        </div>
    )
}

export default Dashboard;