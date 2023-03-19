import React, {useEffect, useRef, useState} from "react";
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
        <div className="mr-2 w-full flex">
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

export function RemoteMediaController(props: { roomId: string, videoRef?: React.RefObject<ReactPlayer> }) {
    const mediaControls = (action: any) => {
        aFetch.post(`/api/room/mediaControl/${props.roomId}`, {action: action}).then(_ => {
        })
    }

    const [videoProgress, setVideoProgress] = useState(0); // 0-100
    const [lastVideoProgress, setLastVideoProgress] = useState({videoSeconds: 0, videoDuration: 1, currentTime: 0});
    const [dragging, setDragging] = useState(false);
    const [playing, setPlaying] = useState(true);
    const [volume, setVolume] = useState(25);
    const [mute, setMute] = useState(false);

    const mediaPrevVideo = () => {
        mediaControls("prev");
    }
    const mediaPlay = () => {
        const date = new Date();
        const videoSeconds = calculateVideoProgress(date) / 100 * lastVideoProgress.videoDuration;
        setLastVideoProgress({
            videoSeconds: videoSeconds,
            videoDuration: lastVideoProgress.videoDuration,
            currentTime: date.getTime()
        });

        socket.emit("video:videoProgress", {
            roomId: props.roomId,
            type: "progress",
            info: {
                videoSeconds: videoSeconds,
                videoDuration: lastVideoProgress.videoDuration,
                currentTime: date.getTime(),
                auto: false,
                host: false,
                playing: !playing
            }
        })
        setPlaying(!playing);
    }
    const mediaNextVideo = () => {
        mediaControls("next");
    }
    const calculateVideoProgress = (date: Date) => {
        let currSeconds;
        if (!playing) {
            currSeconds = lastVideoProgress.videoSeconds;
        } else {
            const deltaTime = (date.getTime() - lastVideoProgress.currentTime) / 1000
            currSeconds = (lastVideoProgress.videoSeconds + deltaTime)
        }
        return (currSeconds / lastVideoProgress.videoDuration) * 100
    }

    useEffect(() => {
        const timer = setInterval(() => {
            if (!dragging) {
                setVideoProgress(calculateVideoProgress(new Date()));
            }
        }, 100);
        return () => clearInterval(timer);
    });


    const changeVideoProgress = (value: number) => {
        setVideoProgress(value);
        setDragging(true);
    }

    const finalizeVideoProgress = (value: number) => {
        const newDate = new Date();

        socket.emit("video:videoProgress", {
            roomId: props.roomId,
            type: "progress",
            info: {
                videoSeconds: value / 100 * lastVideoProgress.videoDuration,
                videoDuration: lastVideoProgress.videoDuration,
                currentTime: newDate.getTime(),
                auto: false,
                host: false,
                playing: playing
            }
        })


        setVideoProgress(value);
        setLastVideoProgress({
            videoSeconds: value / 100 * lastVideoProgress.videoDuration,
            videoDuration: lastVideoProgress.videoDuration,
            currentTime: new Date().getTime()
        });
        setDragging(false);


    }

    const changeVolume = (volume: number) => {
        setVolume(volume);
        setMute(false);
    }

    const finalizeVolume = (volume: number) => {
        setVolume(volume);
        broadcastVolume(props.roomId, volume, false);
    }

    const finalizeMute = (mute: boolean) => {
        setMute(mute);
        broadcastVolume(props.roomId, volume, mute);
    }

    useEffect(() => {
        aFetch.post(`/api/room/get_player_info/${props.roomId}`).then(res => {
            const {videoSeconds, videoDuration, currentTime, playing, volume, muted} = res.data.playerState;
            console.log(res.data.playerState);
            setLastVideoProgress({
                videoSeconds: videoSeconds,
                videoDuration: videoDuration,
                currentTime: currentTime
            });
            setVideoProgress(calculateVideoProgress(new Date()));
            setPlaying(playing);
            setVolume(volume);
            setMute(muted);
        });


        socket.on("video:videoProgress", (params: any) => {
            if (params.type === "progress") {
                const {videoSeconds, videoDuration, currentTime, playing} = params.info;
                setLastVideoProgress({videoSeconds, videoDuration, currentTime});
                setPlaying(playing);

            } else if (params.type === "volume") {
                const {mute, volume} = params.info;
                setMute(mute);
                setVolume(volume);
            }
        });
    }, []);

    return <MediaController mediaControls={[mediaPrevVideo, mediaPlay, mediaNextVideo]}
                            videoPlayback={[!playing, videoProgress, changeVideoProgress, finalizeVideoProgress]}
                            volumeSet={[mute ? 0 : volume, changeVolume, finalizeVolume]}
                            muteFunction={[mute, finalizeMute]}/>

}

function VideoPlayer(props: { roomId: string }) {
    const [videoRef, setVideoRef] = useState('');
    const [videoPlaying, setVideoPlaying] = useState(true);
    const [wasPlaying, setWasPlaying] = useState(false);
    const [volume, setVolume] = useState(25);
    const [mute, setMute] = useState(false);

    const [timeoutVideoSkip, setTimeoutVideoSkip] = useState(setTimeout(() => {
    }, 0));

    const ref = useRef<ReactPlayer>(null);


    const nextVideo = (discard?: boolean) => {
        CancelInvalidVideoSkip();
        broadcastTime(progress);
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
        broadcastTime(progress, !videoPlaying);
        setVideoPlaying(!videoPlaying);
    }
    const mediaNextVideo = () => {
        mediaControls("next");
    }

    useEffect(() => {
        aFetch.post(`/api/room/get_player_info/${props.roomId}`).then(res => {
            const {videoSeconds, videoDuration, playing, volume, muted} = res.data.playerState;
            console.log(res.data.playerState);
            ref.current?.seekTo(videoSeconds / videoDuration, 'fraction');

            setVideoPlaying(playing)
            setVolume(volume);
            setMute(muted);
        });

        aFetch.post('/api/room/get_current_video/' + props.roomId).then(response => {
            if (response.data.video) {
                setVideoRef(response.data.video.videoLink)
            } else {
                setVideoRef('')
            }
        })

        socket.on("video:nextVideo", (params: any) => {
            CancelInvalidVideoSkip();
            const videoLink = params.videoLink;

            if (videoLink !== videoRef) {
                setVideoRef(videoLink);
            } else {
                setVideoRef(videoLink + '?');
            }
            setVideoPlaying(true);
        });


        socket.on("video:toggleVideo", () => {
            setVideoPlaying(!videoPlaying);
        });

        socket.on("video:videoProgress", (params: any) => {
            if (params.type === "progress") {
                const {videoSeconds, videoDuration, playing} = params.info;
                ref.current?.seekTo(videoSeconds / videoDuration, 'fraction');
                setProgress(videoSeconds / videoDuration * 100);
                setLastUpdate(Date.now() + 2000);
                setVideoPlaying(playing);

            } else if (params.type === "volume") {
                const {mute, volume} = params.info;
                setMute(mute);
                setVolume(volume);
            }
        });
    }, [props.roomId, videoPlaying, videoRef]);

    const InvalidVideo = () => {
        setTimeoutVideoSkip(setTimeout(() => nextVideo(true), 2000));
    }

    const CancelInvalidVideoSkip = () => {
        clearTimeout(timeoutVideoSkip);
    }

    const [holding, setHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(0);
    const [duration, setDuration] = useState(0);

    const broadcastTime = (value: number, play?: boolean) => {
        setLastUpdate(Date.now());
        socket.emit("video:videoProgress", {
            roomId: props.roomId,
            type: "progress",
            info: {
                videoSeconds: value / 100 * duration,
                videoDuration: duration,
                currentTime: new Date().getTime(),
                auto: true,
                host: true,
                playing: play === undefined ? videoPlaying : play
            }
        })
    }

    const updateBar = (videoProgress: number) => {
        if (!holding) {
            const deltaUpdate = Date.now() - lastUpdate
            if ((deltaUpdate > 30000 || Math.abs(progress - videoProgress) > 1) && deltaUpdate > 0) {
                broadcastTime(videoProgress);
            }
            setProgress(videoProgress);
        }
    }

    const handleSliderChange = (value: number) => {
        if (!holding) {
            setWasPlaying(videoPlaying);
        }
        setProgress(value);
        setHolding(true);
        setVideoPlaying(false);
    }

    const handleSliderChangeCommitted = (value: number) => {
        setHolding(false);
        ref.current?.seekTo(value / 100, 'fraction');
        broadcastTime(value, wasPlaying);

        if (wasPlaying) {
            setVideoPlaying(true);
        }

    }

    const changeVolume = (volume: number) => {
        setMute(false);
        setVolume(volume);
    }

    const finalizeVolume = (volume: number) => {
        setMute(false);
        setVolume(volume);
        broadcastVolume(props.roomId, volume, false);
    }

    const finalizeMute = (mute: boolean) => {
        setMute(mute);
        broadcastVolume(props.roomId, volume, mute);
    }


    return (
        <div className="bg-gray-700">
            <AspectRatio ratio={16 / 9}>
                <ReactPlayer url={videoRef}
                             ref={ref}
                             playing={videoPlaying}
                             onStart={() => setVideoPlaying(true)}
                             onPlay={() => setVideoPlaying(true)}
                             onPause={() => setVideoPlaying(false)}
                             onDuration={(duration) => setDuration(duration)}

                             onProgress={(progress) => {
                                 updateBar(progress.played * 100)
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
            <MediaController mediaControls={[mediaPrevVideo, mediaPlay, mediaNextVideo]}
                             videoPlayback={[!videoPlaying, progress, handleSliderChange, handleSliderChangeCommitted]}
                             volumeSet={[volume, changeVolume, finalizeVolume]} muteFunction={[mute, finalizeMute]}/>
        </div>
    );
}

export default VideoPlayer;