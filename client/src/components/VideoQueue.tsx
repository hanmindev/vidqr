import React, {useEffect, useState} from "react";
import {socket} from "../config/socket";
import {ActionIcon, Image} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";
import "./VideoQueue.css";
import aFetch from "../config/axios";
import {useHover} from "../hooks/hooks";
// @ts-ignore
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DraggableStateSnapshot,
    Droppable,
    DroppableProvided
} from 'react-beautiful-dnd';


function QueueVideo(props: { index: number; videoLink: string; title: string; user: string; videoThumbnail: string; isCurrent: boolean; roomId: string; isMine?: boolean }) {
    let videoTitle = props.title;
    const [hoverRef, isHovered] = useHover<HTMLDivElement>();

    const queueControls = (action: any) => {
        aFetch.post(`/api/room/mediaControl/${props.roomId}`, {action: action, index: props.index}).then(_ => {
            // console.log(response.data);
        })
    }
    const deleteVideo = () => {
        queueControls("delete");
    }

    let style = undefined;
    if (props.isCurrent) {
        style = {background: 'rgb(48,197,38)'};
    } else if (props.isMine) {
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
            {isHovered ? <div className="absolute ml-[354px] float-right">
                <ActionIcon onClick={deleteVideo}>
                    <IconTrash size={18}/>
                </ActionIcon>
            </div> : undefined}
        </div>
    );
}


function VideoQueue(props: { roomId: string; username?: string; }) {

    const [videoList, setVideoList] = useState<any>([]);
    // params.roomId

    useEffect(() => {
        socket.on("video:videoList", (data: any) => {
            if (data.videoList !== undefined) {
                setVideoList(data.videoList);
            }
        });
    }, []);

    useEffect(() => {
        if (props.roomId) {
            socket.emit("video:subscribe", {'roomId': props.roomId});
        }
    }, [props.roomId]);
    function handleOnDragEnd(result: any) {
        if (!result.destination) return;
        const items = Array.from(videoList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setVideoList(items);


        aFetch.post(`/api/room/mediaControl/${props.roomId}`, {
            action: "moveTo",
            index: result.source.index,
            to: result.destination.index
        }).then(_ => {
            // console.log(response.data);
        })

    }

    return (
        <div
            className="bg-gray-900 rounded flex flex-col overflow-x-hidden min-w-[24rem] max-w-[24rem] overflow-y-auto relative">
            <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="videos">
                    {(provided: DroppableProvided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {videoList.map((video: { videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number }, index: number) =>
                                (
                                    <Draggable key={video.videoId.toString()}
                                               draggableId={video.videoId.toString()} index={index}>

                                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                            <div
                                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                <div
                                                    className="border-solid bg-gray-900 border-gray-700 border-2 rounded mb-2"
                                                    key={index}>
                                                    <QueueVideo index={index} roomId={props.roomId} key={index}
                                                                isCurrent={index === 0 && !snapshot.isDragging}
                                                                isMine={props.username === video.videoUsername}
                                                                videoLink={video.videoLink}
                                                                videoThumbnail={video.videoThumbnail}
                                                                title={video.videoTitle}
                                                                user={video.videoUsername}/>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>


            </DragDropContext>
        </div>
    );
}

export {VideoQueue};