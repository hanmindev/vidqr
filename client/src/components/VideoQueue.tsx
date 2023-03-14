import React, {useEffect, useState} from "react";
import {socket} from "../config/socket";
import {ActionIcon, Button, Image} from "@mantine/core";
import {
    IconPlayerPause,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconTrash
} from "@tabler/icons-react";
import "./VideoQueue.css";
import aFetch from "../config/axios";
import {useHover} from "../hooks/hooks";
// @ts-ignore
import {DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided} from 'react-beautiful-dnd';


function QueueVideo(props: { index: number; videoLink: string; title: string; user: string; videoThumbnail: string; isCurrent: boolean; roomId: string; isMine?: boolean }) {
    let videoTitle = props.title;
    const [hoverRef, isHovered] = useHover<HTMLDivElement>();

    const queueControls = (action: any) => {
        aFetch.post(`/api/room/mediaControl/${props.roomId}`, {action: action, index: props.index}).then(_ => {
            // console.log(response.data);
        })
    }

    // const raiseVideo = () => {
    //     queueControls("raise");
    // }
    // const lowerVideo = () => {
    //     queueControls("lower");
    // }
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
                {/*<ActionIcon onClick={raiseVideo}>*/}
                {/*    <IconArrowBarUp size={18} />*/}
                {/*</ActionIcon>*/}
                {/*<ActionIcon onClick={lowerVideo}>*/}
                {/*    <IconArrowBarDown size={18} />*/}
                {/*</ActionIcon>*/}
                <ActionIcon onClick={deleteVideo}>
                    <IconTrash size={18}/>
                </ActionIcon>
            </div> : undefined}
        </div>
    );
}


function MediaControls(params: { roomId: string; }) {
    const mediaControls = (action: any) => {
        aFetch.post(`/api/room/mediaControl/${params.roomId}`, {action: action}).then(_ => {
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
        <div className="absolute bottom-0">
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

function VideoQueue(props: { roomId: string; username?: string; }) {

    const [videoList, setVideoList] = useState<any>([]);
    // params.roomId

    useEffect(() => {
        getVideoList();
    }, []);

    useEffect(() => {
        if (props.roomId) {
            socket.emit("video:subscribe", {'roomId': props.roomId});
        }
    }, [props.roomId]);

    const getVideoList = () => {
        socket.on("video:videoList", (data: any) => {
            if (data.videoList !== undefined) {
                setVideoList(data.videoList);
            }
        });
    };

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
        <div className="bg-gray-900 right-0 h-full w-96 min-w-[24rem] max-w-[24rem] float-right">
            <div className="bg-gray-900 rounded flex flex-col min-h-0 max-h-full overflow-x-hidden min-w-[24rem] max-w-[24rem]
            md:absolute md:overflow-y-auto
            relative overflow-y-hidden">

                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <div className="relative border-solid bg-gray-900 border-gray-700 border-2 rounded mb-2 h-28">
                        <Droppable droppableId="videos">
                            {(provided: DroppableProvided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {videoList.length !== 0 && videoList[0] ?

                                        <Draggable key={videoList[0].videoId.toString()}
                                                   draggableId={videoList[0].videoId.toString()} index={0}>
                                            {(provided: DraggableProvided) => (
                                                <div
                                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <QueueVideo index={0} roomId={props.roomId} isCurrent={true}
                                                                videoLink={videoList[0].videoLink}
                                                                videoThumbnail={videoList[0].videoThumbnail}
                                                                title={videoList[0].videoTitle}
                                                                user={videoList[0].videoUsername}/>
                                                </div>
                                            )}
                                        </Draggable> :
                                        <QueueVideo index={0} roomId={props.roomId} isCurrent={true}
                                                    videoLink={""}
                                                    videoThumbnail={""}
                                                    title={""}
                                                    user={""}/>
                                    }
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                        <MediaControls roomId={props.roomId}/>
                    </div>
                    <p>Current Queue:</p>


                    <Droppable droppableId="videos">
                        {(provided: DroppableProvided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {videoList.map((video: { videoLink: string, videoTitle: string, videoThumbnail: string, videoUsername: string, videoId: number }, index: number) =>
                                    (
                                        index === 0 ? null :
                                            <Draggable key={video.videoId.toString()}
                                                       draggableId={video.videoId.toString()} index={index}>

                                                {(provided: DraggableProvided) => (
                                                    <div
                                                        ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <div
                                                            className="border-solid bg-gray-900 border-gray-700 border-2 rounded mb-2"
                                                            key={index}>
                                                            <QueueVideo index={index} roomId={props.roomId} key={index}
                                                                        isCurrent={false}
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
        </div>
    );
}

export {VideoQueue};