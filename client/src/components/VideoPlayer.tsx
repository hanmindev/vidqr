import React, {useRef, useState} from "react";
import {socket} from "../config/socket";
import aFetch from "../config/axios";
import {ActionIcon, AspectRatio, Button} from "@mantine/core";
import ReactPlayer from "react-player";
import {
    IconPlayerPause,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconVolume,
    IconVolume3,
    IconVolumeOff
} from "@tabler/icons-react";
import {Slider} from "@mui/material";

function MediaButtons(params: { roomId: string; }) {
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
        <div className="">
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

function VideoPlayer(props: { roomId: string }) {
    const [videoRef, setVideoRef] = useState('');
    const [videoPlaying, setVideoPlaying] = useState(true);
    const [wasPlaying, setWasPlaying] = useState(false);
    const [volume, setVolume] = useState(25);
    const [mute, setMute] = useState(false);

    const [timeoutVideoSkip, setTimeoutVideoSkip] = useState(setTimeout(() => {}, 0));

    const ref = useRef<ReactPlayer>(null);

    const nextVideo = (discard?: boolean) => {
        CancelInvalidVideoSkip();
        socket.emit("video:nextVideo", {"roomId": props.roomId, "discard": discard});
    }


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

    const InvalidVideo = () => {
        setTimeoutVideoSkip(setTimeout(() => nextVideo(true), 2000));
    }

    const CancelInvalidVideoSkip = () => {
        clearTimeout(timeoutVideoSkip);
    }

    const [holding, setHolding] = useState(false);
    const [progress, setProgress] = useState(0);

    const updateBar = (videoProgress: number) => {
        if (!holding) {
            setProgress(videoProgress);
        }
    }

    const handleSliderChange = (event: Event, value: number | Array<number>, activeThumb: number) => {
        if (!holding) {
            setWasPlaying(videoPlaying);
        }
        setProgress(value as number);
        setHolding(true);
        setVideoPlaying(false);
    }

    const handleSliderChangeCommitted = (event: any, value: number | Array<number>) => {
        setHolding(false);
        ref.current?.seekTo(value as number / 100, 'fraction');

        if (wasPlaying) {
            setVideoPlaying(true);
        }

    }

    const changeVolume = (event: Event, value: number | Array<number>, activeThumb: number) => {
        setMute(false);
        setVolume(value as number);
    }



    return (
        <div className="bg-gray-700">
            <AspectRatio ratio={16 / 9}>
                <ReactPlayer url={videoRef}
                             ref={ref}
                             playing={videoPlaying}
                             onStart={() => setVideoPlaying(true)}
                             onPause={() => setVideoPlaying(false)}

                             onProgress={(progress) => {updateBar(progress.played * 100)}}
                             onError={InvalidVideo}
                             controls={false}
                             volume={mute? 0: volume / 100}
                             embedoptions={{cc_load_policy: 1, cc_lang_pref: "en"}}
                             width="100%"
                             height="100%"
                             onEnded={() => nextVideo()}
                />
            </AspectRatio>
            <div className="flex gap-2 items-center">
                <MediaButtons roomId={props.roomId}/>
                <div className="mr-2 w-full flex">
                    <Slider
                        size="small"
                        value={progress}
                        aria-label="Small"
                        onChange={handleSliderChange}
                        onChangeCommitted={handleSliderChangeCommitted}
                    />
                </div>
                <div className="mr-2 w-1/3 gap-2 flex items-center">
                    <div>
                        <ActionIcon onClick={() => setMute(!mute)}>
                            {mute ? <IconVolumeOff/> : <IconVolume/>}
                        </ActionIcon>
                    </div>

                        <Slider
                        size="small"
                        value={mute? 0: volume}
                        aria-label="Small"
                        onChange={changeVolume}
                    />
                </div>
            </div>


        </div>
    );
}

export default VideoPlayer;