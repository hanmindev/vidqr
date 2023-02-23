import React from "react";
import VideoSearcher from "./VideoSearch";
import {VideoQueue} from "./VideoQueue";
import VideoPlayer from "./VideoPlayer";
import {ShareLink} from "../pages/Host";

function Header(props: {username: string}) {
    return (
        <div className="w-full flex flex-row justify-between h-10">
            <b>{props.username}</b>
        </div>
    )
}

function RemoteMenu(props: {roomId: string, username: string}) {
    return (
        <div className="flex flex-col min-h-full overflow-x-hidden overflow-y-hidden">
            <Header username={props.username}/>
            <div className="table-row-group flex-column md:flex md:flex-row">
                <div className="flex-col overflow-hidden w-full">
                    <div className="bg-gray-900 w-full">
                        <VideoSearcher roomId={props.roomId}/>
                        <ShareLink link={props.roomId}/>
                    </div>
                </div>
                <VideoQueue roomId={props.roomId}/>
            </div>
        </div>
    )
}

function HostMenu(props: {roomId: string, username: string}) {
    return (
        <div className="flex flex-col min-h-full overflow-x-hidden overflow-y-hidden">
            <Header username={props.username}/>
            <div className="table-row-group flex-column md:flex md:flex-row min-w-full w-full">

                <div className="flex-col w-full overflow-hidden mr-2">
                    <div className="bg-gray-900 w-full">
                        <VideoPlayer link={props.roomId}/>
                    </div>
                    <div className="bg-gray-900 overflow-hidden mt-1">
                        <ShareLink link={props.roomId}/>
                        {/*<UserList/>*/}
                    </div>
                </div>

                <VideoQueue roomId={props.roomId}/>
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