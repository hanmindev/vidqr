import React, {useCallback, useEffect, useRef, useState} from "react";
import {socket} from "../config/socket";
import aFetch from "../config/axios";
import {ActionIcon, AspectRatio, Button} from "@mantine/core";
import ReactPlayer from "react-player";
import {
    IconPlayerPause, IconPlayerPlay,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconVolume,
    IconVolumeOff
} from "@tabler/icons-react";
import {Slider} from "@mui/material";


export function MediaController({
                                    mediaControls,
                                    videoPlayback,
                                    volumeSet,
                                    muteFunction
                                }: { mediaControls: any, videoPlayback: any, volumeSet: any, muteFunction: any }) {
    const [prevVideo, play, nextVideo] = mediaControls;

    const [paused, videoProgress, holdVideoProgress, endVideoProgress] = videoPlayback;
    const [volume, holdVolume, endVolume] = volumeSet;
    const [mute, setMute] = muteFunction;


    return <div className="flex gap-2 items-center">
        <Button.Group>
            <ActionIcon onClick={prevVideo}>
                {<IconPlayerSkipBack/>}
            </ActionIcon>
            <ActionIcon onClick={play}>
                {paused ? <IconPlayerPlay/> : <IconPlayerPause/>}
            </ActionIcon>
            <ActionIcon onClick={nextVideo}>
                {<IconPlayerSkipForward/>}
            </ActionIcon>
        </Button.Group>
        <div className="mx-2 w-full flex">
            <Slider
                size="small"
                value={videoProgress}
                aria-label="Small"
                onChange={(event: Event, value: number | Array<number>) => holdVideoProgress(value as number)}
                onChangeCommitted={(event: any, value: number | Array<number>) => endVideoProgress(value as number)}
            />
        </div>
        <div className="mr-2 w-1/3 gap-4 flex items-center">
            <div>
                <ActionIcon onClick={() => setMute(!mute)}>
                    {mute ? <IconVolumeOff/> : <IconVolume/>}
                </ActionIcon>
            </div>

            <Slider
                size="small"
                value={mute ? 0 : volume}
                aria-label="Small"

                onChange={(event: Event, value: number | Array<number>) => holdVolume(value as number)}
                onChangeCommitted={(event: any, value: number | Array<number>) => endVolume(value as number)}
            />
        </div>
    </div>
}

interface videoInfo {
    videoSeconds: number
    videoDuration: number
    currentTime: number
    shouldPlay: boolean
    isPlaying: boolean
}

interface volumeInfo {
    volume: number
    muted: boolean

}

export function RemoteMediaController(props: { roomId: string, onSetPlay?: (play: boolean) => void, onSeek?: (seconds: number) => void, onVolume?: (volume: number) => void, onSetMute?: (mute: boolean) => void, videoSeconds?: number, videoDuration?: number, shouldPlay?: boolean, isPlaying?: boolean, lastVideoTime?: number, update?: number }) {
    const [lastExternalUpdateNo, setLastExternalUpdateNo] = useState(-1);

    const [videoSeconds, setVideoSeconds] = useState(0);
    const [videoDuration, setVideoDuration] = useState(-1);
    const [lastVideoTime, setLastVideoTime] = useState(0);

    const [isPlaying, setIsPlaying] = useState(true);
    const [shouldPlay, setShouldPlay] = useState(true);
    const [volume, setVolume] = useState(25);
    const [mute, setMute] = useState(false);

    const [videoProgress, setVideoProgress] = useState(0); // 0-100
    const [draggingVideoBar, setDraggingVideoBar] = useState(false);


    const secondsFromProgress = (progress: number, duration: number) => {
        return progress / 100 * duration
    }

    const progressFromSeconds = (seconds: number, duration: number) => {
        return seconds / duration * 100
    }

    useEffect(() => {
        const timer = setInterval(() => {
            if (!draggingVideoBar && isPlaying) {
                if (videoDuration === -1) {
                    return;
                } else {
                    setVideoProgress(progressFromSeconds((videoSeconds + (new Date().getTime() - lastVideoTime) / 1000), videoDuration));
                }
            }
        }, 100);
        return () => clearInterval(timer);
    }, [draggingVideoBar, isPlaying, lastVideoTime, shouldPlay, videoDuration, videoSeconds]);

    useEffect(() => {
        socket.on("video:videoProgress", (params: any) => {
            if (params.type === "progress") {
                const {videoSeconds, videoDuration, currentTime, shouldPlay, isPlaying} = params.info;

                setVideoSeconds(videoSeconds);
                setVideoDuration(videoDuration);
                setLastVideoTime(currentTime);

                props.onSetPlay?.(shouldPlay);
                setShouldPlay(shouldPlay);
                setIsPlaying(isPlaying);

                const newVideoSeconds = (videoSeconds + (new Date().getTime() - currentTime) / 1000)
                setVideoProgress(progressFromSeconds(newVideoSeconds, videoDuration));
                props.onSeek?.(newVideoSeconds);

            } else if (params.type === "volume") {
                const {muted, volume} = params.info;
                props.onSetMute?.(muted);
                props.onVolume?.(volume);

                setMute(muted);
                setVolume(volume);
            }
        });

    }, [props]);


    const broadcastProgress = useCallback((progress: number, duration: number, shouldPlay: boolean, isPlaying?: boolean) => {
        if (isPlaying === undefined) {
            isPlaying = shouldPlay;
        }

        if (duration === 0 || videoDuration === -1) {
            return;
        }

        socket.emit("video:videoProgress", {
            roomId: props.roomId,
            type: "progress",
            info: {
                videoSeconds: secondsFromProgress(progress, duration),
                videoDuration: duration,
                currentTime: new Date().getTime(),
                auto: false,
                host: false,
                shouldPlay: shouldPlay,
                isPlaying: isPlaying
            } as videoInfo
        })
    }, [props.roomId, videoDuration]);

    const broadcastVolume = (volume: number, muted: boolean) => {
        socket.emit("video:videoProgress", {
            roomId: props.roomId,
            type: "volume",
            info: {
                volume: volume,
                muted: muted
            } as volumeInfo
        })
    }


    const mediaControls = (action: any) => {
        aFetch.post(`/api/room/mediaControl/${props.roomId}`, {action: action}).then(_ => {
        })
    }

    const mediaPrevVideo = () => {
        mediaControls("prev");
    }
    const mediaNextVideo = () => {
        mediaControls("next");
        broadcastProgress(videoProgress, videoDuration, !shouldPlay, false);

    }

    const mediaPlay = () => {
        broadcastProgress(videoProgress, videoDuration, !shouldPlay);
        props.onSetPlay?.(!shouldPlay);

        if (shouldPlay) {
            setShouldPlay(false);
            setIsPlaying(false);

        } else {
            setVideoSeconds(secondsFromProgress(videoProgress, videoDuration));
            setLastVideoTime(new Date().getTime());
            setShouldPlay(true);
            setIsPlaying(true);
        }
    }

    const changeVideoProgress = (value: number) => {
        if (!draggingVideoBar) {
            setDraggingVideoBar(true);
        }
        setVideoProgress(value);

    }

    const finalizeVideoProgress = (value: number) => {
        setDraggingVideoBar(false);
        const videoSeconds = value / 100 * videoDuration
        setVideoSeconds(videoSeconds);
        setLastVideoTime(new Date().getTime());
        broadcastProgress(videoProgress, videoDuration, shouldPlay);

        props.onSeek?.(videoSeconds);
    }

    const changeVolume = (volume: number) => {
        setVolume(volume);
        props.onVolume?.(volume);
    }

    const finalizeVolume = (volume: number) => {
        broadcastVolume(volume, mute);
    }

    const finalizeMute = (mute: boolean) => {
        setMute(mute);
        props.onSetMute?.(mute);
        broadcastVolume(volume, mute);
    }

    useEffect(() => {
        const updateValue = props.update || 0;
        if (updateValue <= lastExternalUpdateNo) {
            return;
        }

        if (props.videoSeconds !== undefined && props.videoDuration !== undefined && props.lastVideoTime !== undefined && props.shouldPlay !== undefined && props.isPlaying !== undefined) {
            setVideoSeconds(props.videoSeconds);
            setVideoDuration(props.videoDuration);
            setLastVideoTime(props.lastVideoTime);
            setShouldPlay(props.shouldPlay);
            setIsPlaying(props.isPlaying);

            broadcastProgress(progressFromSeconds(props.videoSeconds, props.videoDuration), props.videoDuration, props.shouldPlay);
        } else {
            aFetch.post(`/api/room/get_player_info/${props.roomId}`).then(res => {
                const {
                    videoSeconds,
                    videoDuration,
                    currentTime,
                    shouldPlay,
                    isPlaying,
                    volume,
                    muted
                } = res.data.playerState;
                setVideoSeconds(videoSeconds);
                setVideoDuration(videoDuration);
                setLastVideoTime(currentTime);

                props.onSeek?.(videoSeconds);

                setShouldPlay(shouldPlay);
                setIsPlaying(isPlaying);
                setVolume(volume);
                setMute(muted);
            });
        }

        setLastExternalUpdateNo(updateValue);
    }, [props.roomId, props.videoSeconds, props.videoDuration, props.lastVideoTime, props.update, lastExternalUpdateNo, props.shouldPlay, props.isPlaying, broadcastProgress, props]);


    return <MediaController mediaControls={[mediaPrevVideo, mediaPlay, mediaNextVideo]}
                            videoPlayback={[!shouldPlay, videoProgress, changeVideoProgress, finalizeVideoProgress]}
                            volumeSet={[volume, changeVolume, finalizeVolume]}
                            muteFunction={[mute, finalizeMute]}/>

}

function VideoPlayer(props: { roomId: string }) {
    const [videoURL, setVideoURL] = useState('');
    const [videoIsPlaying, setVideoIsPlaying] = useState(true);
    const [videoShouldPlay, setVideoShouldPlay] = useState(true);
    const [volume, setVolume] = useState(25);
    const [mute, setMute] = useState(false);

    const [timeoutVideoSkip, setTimeoutVideoSkip] = useState(setTimeout(() => {
    }, 0));

    const [videoSeconds, setVideoSeconds] = useState(0);
    const [videoDuration, setVideoDuration] = useState(-1);
    const [lastVideoTime, setLastVideoTime] = useState(0);

    const [update, setUpdate] = useState(-1);

    const ref = useRef<ReactPlayer>(null);

    const setVideoTimeSeconds = (seconds: number) => {
        ref.current?.seekTo(seconds, 'seconds');
    }

    const updateVideoTime = useCallback((seconds?: number) => {
        if (seconds === undefined) {
            seconds = getVideoSeconds();
        }

        setVideoSeconds(seconds);
        setLastVideoTime(new Date().getTime());
    }, [])

    const sendUpdate = useCallback(() => {
        setUpdate(update + 1);
    }, [update])

    useEffect(() => {
        aFetch.post('/api/room/get_current_video/' + props.roomId).then(response => {
            if (response.data.video) {
                setVideoURL(response.data.video.videoLink)
            } else {
                setVideoURL('')
            }
        })
    }, [props.roomId])

    useEffect(() => {
        socket.on("video:changeVideo", (params: any) => {
            clearTimeout(timeoutVideoSkip);
            const video = params.video;
            if (video) {
                const videoLink = params.video.videoLink;

                if (videoLink !== videoURL) {
                    setVideoURL(videoLink);
                } else {
                    setVideoURL(videoLink + "?");
                }
                setVideoTimeSeconds(0);
                updateVideoTime(0);
                sendUpdate();

                setVideoIsPlaying(false);

                setTimeout(() => {
                    setVideoIsPlaying(true);
                }, 1000);
            }
        });
    }, [props.roomId, sendUpdate, timeoutVideoSkip, updateVideoTime, videoURL]);

    const InvalidVideo = () => {
        setTimeoutVideoSkip(setTimeout(() => mediaControls("discard"), 2000));
    }

    const getVideoSeconds = () => {
        return ref.current?.getCurrentTime() || 0
    }

    const [updateTimeout, setUpdateTimeout] = useState(setTimeout(() => {}, 0));
    const sendUpdateBuffered = () => {
        clearTimeout(updateTimeout);
        setUpdateTimeout(setTimeout(() => {
            sendUpdate();
        }, 1000));
    }

    const onSetPlay = (play: boolean) => {
        setVideoIsPlaying(play);
        setVideoShouldPlay(play);
        updateVideoTime();
    }

    const onSeek = (seconds: number) => {
        setVideoTimeSeconds(seconds);
        updateVideoTime(seconds);
    }

    const onVolume = (volume: number) => {
        setVolume(volume);
    }

    const onSetMute = (mute: boolean) => {
        setMute(mute);
    }

    const mediaControls = (action: any) => {
        aFetch.post(`/api/room/mediaControl/${props.roomId}`, {action: action}).then(_ => {
        })
    }


    return (
        <div className="bg-gray-700">
            <AspectRatio ratio={16 / 9}>
                <ReactPlayer url={videoURL}
                             ref={ref}
                             playing={videoShouldPlay}
                             onStart={() => {
                                 setVideoIsPlaying(true);
                                 setVideoShouldPlay(true);
                                 updateVideoTime();
                                 sendUpdateBuffered();
                             }}
                             onPlay={() => {
                                 setVideoIsPlaying(true);
                                 setVideoShouldPlay(true);
                                 updateVideoTime();
                                 sendUpdateBuffered();
                             }}
                             onPause={() => {
                                 setVideoIsPlaying(false);
                                 setVideoShouldPlay(false);
                                 updateVideoTime();
                                 sendUpdateBuffered();
                             }}
                             onBuffer={() => {
                                 setVideoIsPlaying(false);
                                 updateVideoTime();
                                 sendUpdateBuffered();
                             }}


                             onDuration={(duration) => setVideoDuration(duration)}

                             onProgress={(progress) => {
                                 if (Math.abs((videoSeconds + (new Date().getTime() - lastVideoTime) / 1000) - progress.playedSeconds) > 0.1) {
                                     updateVideoTime(progress.playedSeconds);
                                     sendUpdate();
                                 }
                             }}

                             onError={InvalidVideo}
                             controls={true}
                             volume={mute ? 0 : volume / 100}
                             embedoptions={{cc_load_policy: 1, cc_lang_pref: "en"}}
                             width="100%"
                             height="100%"
                             onEnded={() => mediaControls("next")}
                />
            </AspectRatio>
            <RemoteMediaController roomId={props.roomId} onSetPlay={onSetPlay} onSeek={onSeek} onVolume={onVolume}
                                   onSetMute={onSetMute} videoSeconds={videoSeconds}
                                   videoDuration={videoDuration} lastVideoTime={lastVideoTime}
                                   shouldPlay={videoShouldPlay} isPlaying={videoIsPlaying}
                                   update={update}/>
        </div>
    );
}

export default VideoPlayer;