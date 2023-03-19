import React from "react";
import VideoSearcher from "./VideoSearch";
import {VideoQueue} from "./VideoQueue";
import VideoPlayer, {RemoteMediaController} from "./VideoPlayer";
import ShareLink from "./ShareLink";
import {ActionIcon} from "@mantine/core";
import {IconSearch, IconX} from "@tabler/icons-react";

function Header(props: {username: string, roomId?: string}) {
    return (
        <div className="w-full flex flex-row gap-10 min-h-[32px]">
            <b>{props.username}</b>
            <ShareLink link={props.roomId || "unknown room"}/>
        </div>
    )
}

function RemoteMenu(props: {roomId: string, username: string}) {
    return (
        <div className="flex flex-col max-h-[100lvh] overflow-x-hidden overflow-y-auto">
            <Header username={props.username} roomId={props.roomId}/>
            <div className="table-row-group flex-column md:flex md:flex-row">
                <div className="flex-col overflow-hidden w-full">
                    <div className="bg-gray-900 w-full">
                        <VideoSearcher roomId={props.roomId}/>
                        <RemoteMediaController roomId={props.roomId}/>
                    </div>
                </div>
                <div className="bg-gray-900 right-0 w-96 min-w-[24rem] max-w-[24rem] float-right overflow-y-hidden md:overflow-y-auto md:max-h-[calc(100svh-32px)]">
                    <VideoQueue roomId={props.roomId}/>
                </div>
            </div>
        </div>
    )
}

function HostMenu(props: {roomId: string, username: string}) {
    const [isSearching, setIsSearching] = React.useState(false);

    return (
        <div className="flex flex-col max-h-[100lvh] overflow-x-hidden overflow-y-auto relative">
            <Header username={props.username} roomId={props.roomId}/>
            <div className="absolute w-96 z-10 top-0 right-1 top-0">
                <div className="flex flex-col relative">
                    <ActionIcon className="relative left-80 mt-1 mb-2" color={'white'} onClick={() => {setIsSearching(!isSearching)}}>
                        {isSearching? <IconX size={16} />: <IconSearch size={16} />}
                    </ActionIcon>
                    <div className="relative border-2 border-slate-50" style={{display: isSearching? undefined : "none"}}>
                        <VideoSearcher roomId={props.roomId} hidden={!isSearching}/>
                    </div>
                </div>
            </div>
            <div className="table-row-group flex-column md:flex md:flex-row min-w-full w-full">

                <div className="flex-col w-full overflow-hidden mr-2">
                    <div className="bg-gray-900 w-full">
                        <VideoPlayer roomId={props.roomId}/>
                    </div>
                </div>

                <div className="bg-gray-900 right-0 w-96 min-w-[24rem] max-w-[24rem] float-right overflow-y-hidden md:overflow-y-auto md:max-h-[calc(100svh-32px)]">
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