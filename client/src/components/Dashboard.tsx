import React from "react";
import VideoSearcher from "./VideoSearch";
import {VideoQueue} from "./VideoQueue";
import VideoPlayer from "./VideoPlayer";
import {ShareLink} from "../pages/Host";

function RemoteMenu(props: {roomId: string, username: string}) {
    return (
        <div className="mainViewer">
            <div className="remoteHeader">
                <b>{props.username}</b>

                <b>{props.roomId}</b>
            </div>
            <div className="hViewer">
                <div className="vViewer">
                    <div className="primary">
                        <VideoSearcher roomId={props.roomId}/>
                    </div>
                </div>
                <div className="secondary">
                    <VideoQueue roomId={props.roomId} username={props.username}/>
                </div>
            </div>
        </div>
    )
}

function HostMenu(props: {roomId: string, username: string}) {
    return (
        <div className="mainViewer">
            <div className="remoteHeader">
                <b>{props.username}</b>

                <b>{props.roomId}</b>
            </div>
            <div className="hViewer">
                <div className="vViewer">
                    <div className="primary">
                        <VideoPlayer link={props.roomId}/>
                    </div>
                    <div className="hostSettings">
                        <ShareLink link={props.roomId}/>
                    </div>
                </div>
                <div className="secondary">
                    <VideoQueue roomId={props.roomId}/>
                </div>
            </div>
        </div>
    )
}

function Dashboard(props: {roomId: string, username: string, isHost: boolean}) {
        if (props.isHost){
            return <HostMenu roomId={props.roomId} username={props.username}/>
        }
        else{
            return <RemoteMenu roomId={props.roomId} username={props.username}/>
        }
}

export default Dashboard;