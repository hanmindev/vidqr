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

const broadcastVolume = (roomId: string, volume: number, mute: boolean) => {
    socket.emit("video:videoProgress", {
        roomId: roomId,
        type: "volume",
        info: {
            mute: mute,
            volume: volume
        }
    })
}

export function RemoteMediaController(props: { roomId: string, videoController?: (action: string, seconds?: number) => void, videoSeconds?: number, videoDuration?: number, play?: boolean, lastVideoTime?: number, update?: number }) {
    const [lastExternalUpdateNo, setLastExternalUpdateNo] = useState(-1);

    const [videoSeconds, setVideoSeconds] = useState(0);
    const [videoDuration, setVideoDuration] = useState(-1);
    const [lastVideoTime, setLastVideoTime] = useState(0);

    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(25);
    const [mute, setMute] = useState(false);

    const [videoProgress, setVideoProgress] = useState(0); // 0-100
    const [draggingVideoBar, setDraggingVideoBar] = useState(false);

    const pVideoController = props.videoController;
    const videoController = useCallback((action: string, seconds?: number) => {
        if (pVideoController) {
            pVideoController(action, seconds);
        }
    }, [pVideoController]);

    const secondsFromProgress = (progress: number, duration: number) => {
        return progress / 100 * duration
    }

    const progressFromSeconds = (seconds: number, duration: number) => {
        return seconds / duration * 100
    }

    useEffect(() => {
        const timer = setInterval(() => {
            if (!draggingVideoBar && playing) {
                if (videoDuration === -1) {
                    return;
                } else {
                    setVideoProgress(progressFromSeconds((videoSeconds + (new Date().getTime() - lastVideoTime) / 1000), videoDuration));
                }
            }
        }, 100);
        return () => clearInterval(timer);
    }, [draggingVideoBar, lastVideoTime, playing, videoDuration, videoSeconds]);

    useEffect(() => {
        socket.on("video:videoProgress", (params: any) => {
            if (params.type === "progress") {
                const {videoSeconds, videoDuration, currentTime, playing} = params.info;

                setVideoSeconds(videoSeconds);
                setVideoDuration(videoDuration);
                setLastVideoTime(currentTime);
                setPlaying(playing);

                setVideoProgress(progressFromSeconds((videoSeconds + (new Date().getTime() - currentTime) / 1000), videoDuration));

            } else if (params.type === "volume") {
                const {mute, volume} = params.info;
                setMute(mute);
                setVolume(volume);
            }
        });

    }, []);


    const broadcastProgress = (progress: number, duration: number, playing: boolean) => {
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
                playing: playing
            }
        })
    }


    const mediaPrevVideo = () => {
    }

    const mediaPlay = () => {
        broadcastProgress(videoProgress, videoDuration, !playing);
        if (playing) {
            videoController("pause");
        } else {
            setVideoSeconds(secondsFromProgress(videoProgress, videoDuration));
            setLastVideoTime(new Date().getTime());
            videoController("play");
        }

        setPlaying(!playing);

    }
    const mediaNextVideo = () => {
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
        broadcastProgress(videoProgress, videoDuration, playing);

        videoController("seek", videoSeconds);
    }

    const changeVolume = (volume: number) => {
        setVolume(volume);
    }

    const finalizeVolume = (volume: number) => {
    }

    const finalizeMute = (mute: boolean) => {
        setMute(mute);
    }

    useEffect(() => {
        const updateValue = props.update || 0;
        if (updateValue <= lastExternalUpdateNo) {
            return;
        }

        if (props.videoSeconds !== undefined && props.videoDuration !== undefined && props.lastVideoTime !== undefined && props.play !== undefined) {
            setVideoSeconds(props.videoSeconds);
            setVideoDuration(props.videoDuration);
            setLastVideoTime(props.lastVideoTime);
            setPlaying(props.play);
        } else {
            aFetch.post(`/api/room/get_player_info/${props.roomId}`).then(res => {
                const {videoSeconds, videoDuration, currentTime, playing, volume, muted} = res.data.playerState;
                setVideoSeconds(videoSeconds);
                setVideoDuration(videoDuration);
                setLastVideoTime(currentTime);

                videoController("seek", videoSeconds);


                setPlaying(playing);
                setVolume(volume);
                setMute(muted);
            });
        }

        setLastExternalUpdateNo(updateValue);
    }, [props.roomId, props.videoSeconds, props.videoDuration, props.lastVideoTime, props.update, lastExternalUpdateNo, videoController, props.play]);


    return <MediaController mediaControls={[mediaPrevVideo, mediaPlay, mediaNextVideo]}
                            videoPlayback={[!playing, videoProgress, changeVideoProgress, finalizeVideoProgress]}
                            volumeSet={[mute ? 0 : volume, changeVolume, finalizeVolume]}
                            muteFunction={[mute, finalizeMute]}/>

}

function VideoPlayer(props: { roomId: string }) {
    const [videoURL, setVideoURL] = useState('');
    const [videoIsPlaying, setVideoIsPlaying] = useState(false);
    const [videoShouldPlay, setVideoShouldPlay] = useState(true);
    const [volume, setVolume] = useState(25);
    const [mute, setMute] = useState(false);

    const [timeoutVideoSkip, setTimeoutVideoSkip] = useState(setTimeout(() => {
    }, 0));

    const ref = useRef<ReactPlayer>(null);


    const nextVideo = (discard?: boolean) => {
        CancelInvalidVideoSkip();
        socket.emit("video:nextVideo", {roomId: props.roomId, discard: discard});
    }

    const mediaControls = (action: any) => {
        aFetch.post(`/api/room/mediaControl/${props.roomId}`, {action: action}).then(_ => {
        })
    }

    const mediaPrevVideo = () => {
        mediaControls("prev");
    }
    const mediaPlay = () => {
        setVideoShouldPlay(!videoShouldPlay);
    }
    const mediaNextVideo = () => {
        mediaControls("next");
    }

    const setVideoTime = (frac: number) => {
        ref.current?.seekTo(frac, 'fraction');
    }

    const setVideoTimeSeconds = (seconds: number) => {
        ref.current?.seekTo(seconds, 'seconds');
    }

    useEffect(() => {
        aFetch.post('/api/room/get_current_video/' + props.roomId).then(response => {
            if (response.data.video) {
                setVideoURL(response.data.video.videoLink)
            } else {
                setVideoURL('')
            }
        })

        socket.on("video:nextVideo", (params: any) => {
            CancelInvalidVideoSkip();
            const video = params.video;
            if (video) {
                const videoLink = params.video.videoLink;

                if (videoLink !== videoURL) {
                    setVideoURL(videoLink);
                } else {
                    setVideoURL(videoLink + "?");
                    setVideoTime(0);
                }
                setVideoIsPlaying(false);

                setTimeout(() => {
                    setVideoIsPlaying(true);
                }, 1000);
            }
        });
    }, []);

    const InvalidVideo = () => {
        setTimeoutVideoSkip(setTimeout(() => nextVideo(true), 2000));
    }

    const CancelInvalidVideoSkip = () => {
        clearTimeout(timeoutVideoSkip);
    }

    const [videoSeconds, setVideoSeconds] = useState(0);
    const [videoDuration, setVideoDuration] = useState(-1);
    const [lastVideoTime, setLastVideoTime] = useState(0);

    const [update, setUpdate] = useState(-1);

    const getVideoSeconds = () => {
        return ref.current?.getCurrentTime() || 0
    }

    const updateVideoTime = (seconds?: number) => {
        setVideoSeconds(seconds || getVideoSeconds());
        setLastVideoTime(new Date().getTime());
    }

    const sendUpdate = () => {
        setUpdate(update + 1);
    }

    const play = () => {
        setVideoIsPlaying(true);
        setVideoShouldPlay(true);
        updateVideoTime();
        sendUpdate();
    }

    const pause = () => {
        setVideoIsPlaying(false);
        setVideoShouldPlay(false);
        updateVideoTime();
        sendUpdate();
    }

    const videoController = (action: string, seconds?: number) => {
        console.log(action)
        switch (action) {
            case "play":
                play();
                break;
            case "pause":
                pause();
                break;
            case "seek":
                if (seconds !== undefined) {
                    setVideoTimeSeconds(seconds);
                    updateVideoTime(seconds);
                }
                break;
        }
    }

    const updateVideoPlayState = (playing: boolean) => {
        setVideoIsPlaying(playing);
    }




    return (
        <div className="bg-gray-700">
            <AspectRatio ratio={16 / 9}
                // className="pointer-events-none"
            >
                <ReactPlayer url={videoURL}
                             ref={ref}
                             playing={videoIsPlaying}
                             onStart={() => {
                                 setVideoIsPlaying(true);
                                 updateVideoTime();
                                 sendUpdate();
                             }}
                             onPlay={() => {
                                 setVideoIsPlaying(true);
                                 updateVideoTime();
                                 sendUpdate();
                             }}
                             onPause={() => {
                                 setVideoIsPlaying(false);
                                 updateVideoTime();
                                 sendUpdate();
                             }}
                             onDuration={(duration) => setVideoDuration(duration)}

                             onProgress={(progress) => {
                                 if (Math.abs((videoSeconds + (new Date().getTime() - lastVideoTime) / 1000) - progress.playedSeconds) > 0.1) {
                                     updateVideoTime(progress.playedSeconds);
                                     sendUpdate();
                                 }
                             }}

                             onError={InvalidVideo}
                             controls={false}
                             volume={mute ? 0 : volume / 100}
                             embedoptions={{cc_load_policy: 1, cc_lang_pref: "en"}}
                             width="100%"
                             height="100%"
                             onEnded={() => nextVideo()}
                />
            </AspectRatio>
            <RemoteMediaController roomId={props.roomId} videoController={videoController} videoSeconds={videoSeconds}
                                   videoDuration={videoDuration} lastVideoTime={lastVideoTime} play={videoShouldPlay}
                                   update={update}/>
        </div>
    );
}

export default VideoPlayer;