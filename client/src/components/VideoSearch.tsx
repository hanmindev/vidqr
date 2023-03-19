import React, {ForwardedRef, forwardRef, useEffect, useRef, useState} from "react";
import aFetch from "../config/axios";
import {AspectRatio, Loader, Pagination, SimpleGrid, TextInput} from "@mantine/core";
import Button from "./Button";
import YouTubeIcon from '@mui/icons-material/YouTube';
import {SvgIcon} from "@mui/material";
import {twMerge} from "tailwind-merge";

export function VideoIcon(params: { thumbnailLink: string, title: string, channelName: string, videoLink: string, queueVideo: any }) {

    return (
        <div className="w-full bg-gray-800 m-0 rounded-xl min-h-[80%]"
             onClick={() => params.queueVideo(params.videoLink)}>
            <AspectRatio ratio={10 / 6}>
                <img className="object-cover w-full h-3/5"
                     src={params.thumbnailLink}
                     alt={params.videoLink}
                />
            </AspectRatio>
            <div className="m-0.5">
                <div className="h-12 overflow-hidden">
                    <b className="text-xs xl:text-base">{params.title}</b>
                </div>
                <div className="h-6 overflow-hidden">
                    <p className="text-xs xl:text-base">{params.channelName}</p>
                </div>
            </div>
        </div>
    )
}

function SoundCloudIcon() {
    return <SvgIcon>
        <path
            d="M 1.160156 16.710938 C 1.207031 16.710938 1.25 16.671875 1.257812 16.613281 L 1.527344 14.480469 L 1.257812 12.296875 C 1.25 12.242188 1.207031 12.199219 1.160156 12.199219 C 1.109375 12.199219 1.066406 12.242188 1.058594 12.296875 L 0.824219 14.480469 L 1.058594 16.613281 C 1.066406 16.671875 1.109375 16.710938 1.160156 16.710938 Z M 1.160156 16.710938 "/>
        <path
            d="M 0.273438 15.898438 C 0.320312 15.898438 0.359375 15.863281 0.367188 15.804688 L 0.574219 14.480469 L 0.367188 13.128906 C 0.359375 13.074219 0.320312 13.035156 0.273438 13.035156 C 0.222656 13.035156 0.179688 13.074219 0.175781 13.128906 L 0 14.480469 L 0.175781 15.804688 C 0.179688 15.863281 0.222656 15.898438 0.273438 15.898438 Z M 0.273438 15.898438 "/>
        <path
            d="M 2.222656 11.890625 C 2.214844 11.820312 2.164062 11.773438 2.101562 11.773438 C 2.039062 11.773438 1.988281 11.820312 1.980469 11.890625 L 1.757812 14.480469 L 1.980469 16.972656 C 1.988281 17.042969 2.039062 17.09375 2.101562 17.09375 C 2.164062 17.09375 2.214844 17.042969 2.222656 16.972656 L 2.476562 14.480469 Z M 2.222656 11.890625 "/>
        <path
            d="M 3.050781 17.191406 C 3.125 17.191406 3.1875 17.132812 3.191406 17.054688 L 3.433594 14.480469 L 3.191406 11.820312 C 3.1875 11.738281 3.125 11.679688 3.050781 11.679688 C 2.976562 11.679688 2.917969 11.742188 2.910156 11.820312 L 2.699219 14.480469 L 2.910156 17.054688 C 2.917969 17.132812 2.976562 17.191406 3.050781 17.191406 Z M 3.050781 17.191406 "/>
        <path
            d="M 4.011719 17.234375 C 4.097656 17.234375 4.164062 17.167969 4.171875 17.074219 L 4.398438 14.480469 L 4.171875 12.011719 C 4.164062 11.921875 4.097656 11.851562 4.011719 11.851562 C 3.921875 11.851562 3.855469 11.921875 3.847656 12.011719 L 3.648438 14.480469 L 3.847656 17.074219 C 3.855469 17.167969 3.921875 17.234375 4.011719 17.234375 Z M 4.011719 17.234375 "/>
        <path
            d="M 5.371094 14.480469 L 5.15625 10.46875 C 5.152344 10.367188 5.074219 10.285156 4.976562 10.285156 C 4.878906 10.285156 4.800781 10.367188 4.792969 10.46875 L 4.605469 14.480469 L 4.792969 17.074219 C 4.800781 17.175781 4.878906 17.257812 4.976562 17.257812 C 5.074219 17.257812 5.152344 17.175781 5.15625 17.074219 Z M 5.371094 14.480469 "/>
        <path
            d="M 5.949219 17.261719 C 6.058594 17.261719 6.148438 17.171875 6.152344 17.058594 L 6.152344 17.0625 L 6.351562 14.480469 L 6.152344 9.550781 C 6.148438 9.4375 6.058594 9.347656 5.949219 9.347656 C 5.839844 9.347656 5.753906 9.4375 5.746094 9.550781 L 5.574219 14.480469 L 5.75 17.058594 C 5.753906 17.171875 5.839844 17.261719 5.949219 17.261719 Z M 5.949219 17.261719 "/>
        <path
            d="M 6.929688 8.914062 C 6.8125 8.914062 6.714844 9.015625 6.707031 9.140625 L 6.546875 14.484375 L 6.707031 17.035156 C 6.714844 17.15625 6.8125 17.257812 6.929688 17.257812 C 7.050781 17.257812 7.148438 17.160156 7.152344 17.03125 L 7.152344 17.035156 L 7.339844 14.484375 L 7.152344 9.140625 C 7.148438 9.011719 7.050781 8.914062 6.929688 8.914062 Z M 6.929688 8.914062 "/>
        <path
            d="M 7.921875 17.261719 C 8.054688 17.261719 8.160156 17.15625 8.164062 17.015625 L 8.164062 17.019531 L 8.335938 14.484375 L 8.164062 8.960938 C 8.160156 8.820312 8.054688 8.714844 7.921875 8.714844 C 7.789062 8.714844 7.679688 8.820312 7.679688 8.960938 L 7.523438 14.484375 L 7.679688 17.019531 C 7.679688 17.15625 7.789062 17.261719 7.921875 17.261719 Z M 7.921875 17.261719 "/>
        <path
            d="M 8.917969 17.257812 C 9.0625 17.257812 9.175781 17.140625 9.179688 16.992188 L 9.179688 16.996094 L 9.339844 14.484375 L 9.179688 9.101562 C 9.175781 8.953125 9.0625 8.835938 8.917969 8.835938 C 8.773438 8.835938 8.65625 8.953125 8.652344 9.101562 L 8.515625 14.484375 L 8.65625 16.996094 C 8.65625 17.140625 8.773438 17.257812 8.917969 17.257812 Z M 8.917969 17.257812 "/>
        <path
            d="M 10.347656 14.484375 L 10.207031 9.296875 C 10.203125 9.136719 10.078125 9.011719 9.921875 9.011719 C 9.765625 9.011719 9.640625 9.136719 9.636719 9.296875 L 9.511719 14.484375 L 9.636719 16.980469 C 9.640625 17.136719 9.765625 17.261719 9.921875 17.261719 C 10.078125 17.261719 10.203125 17.136719 10.207031 16.976562 L 10.207031 16.980469 Z M 10.347656 14.484375 "/>
        <path
            d="M 10.933594 17.269531 C 11.101562 17.269531 11.238281 17.132812 11.238281 16.960938 L 11.238281 16.964844 L 11.367188 14.484375 L 11.238281 8.3125 C 11.238281 8.144531 11.101562 8.003906 10.933594 8.003906 C 10.769531 8.003906 10.632812 8.144531 10.628906 8.3125 L 10.515625 14.480469 L 10.628906 16.964844 C 10.632812 17.132812 10.769531 17.269531 10.933594 17.269531 Z M 10.933594 17.269531 "/>
        <path
            d="M 11.941406 7.425781 C 11.765625 7.425781 11.621094 7.574219 11.617188 7.753906 L 11.484375 14.484375 L 11.617188 16.925781 C 11.621094 17.105469 11.765625 17.253906 11.941406 17.253906 C 12.117188 17.253906 12.265625 17.105469 12.265625 16.925781 L 12.414062 14.484375 L 12.265625 7.753906 C 12.265625 7.574219 12.117188 7.425781 11.941406 7.425781 Z M 11.941406 7.425781 "/>
        <path
            d="M 12.867188 17.269531 C 12.871094 17.269531 20.996094 17.273438 21.046875 17.273438 C 22.679688 17.273438 24 15.9375 24 14.285156 C 24 12.636719 22.679688 11.296875 21.046875 11.296875 C 20.644531 11.296875 20.257812 11.382812 19.90625 11.53125 C 19.671875 8.835938 17.441406 6.726562 14.71875 6.726562 C 14.054688 6.726562 13.402344 6.859375 12.832031 7.082031 C 12.609375 7.167969 12.546875 7.257812 12.546875 7.433594 L 12.546875 16.917969 C 12.550781 17.101562 12.6875 17.253906 12.867188 17.269531 Z M 12.867188 17.269531 "/>
    </SvgIcon>
}

function PlatformIcon({icon, currPlatform, onClick}: { icon: string; currPlatform: string; onClick: () => void; }) {
    const renderSwitch = (icon: string) => {
        switch (icon) {
            case 'youtube':
                return <YouTubeIcon/>
            case 'soundcloud':
                return <SoundCloudIcon/>
        }

    }

    return (
        <div
            className={twMerge("bg-purple-500 w-8 h-8 rounded-sm flex items-center justify-center", (currPlatform === icon) && 'bg-purple-700 border-b-gray-400 border-b border')}
            style={{color: "white"}} onClick={onClick}>
            {renderSwitch(icon)}
        </div>
    )
}

export function Platforms(props: { platformState: [string, (platform: string) => void] }) {
    const [platform, setPlatform] = props.platformState;

    return (
        <div className="flex flex-row justify-center items-center gap-2">
            <PlatformIcon icon="youtube" currPlatform={platform} onClick={() => setPlatform('youtube')}/>
            <PlatformIcon icon="soundcloud" currPlatform={platform} onClick={() => setPlatform('soundcloud')}/>
        </div>

    )
}

const RemoteVideoSearcher = forwardRef(function RemoteVideoSearcher(props: { queueVideo: any, platformState: [string, (platform: string) => void] }, ref: ForwardedRef<any>) {
        const heightRef = useRef<any>(null)
        const [width, setWidth] = useState(0);
        useEffect(() => {
            if (heightRef.current) setWidth(heightRef.current.offsetWidth);
        }, [heightRef]);

        window.addEventListener('resize', () => {
            if (heightRef.current) setWidth(heightRef.current.offsetWidth)
        });

        const [searchQuery, setSearchQuery] = useState('');

        const [lastQuery, setLastQuery] = useState('');

        const [lastPlatform, setLastPlatform] = useState<string>('');

        const [searchTimeout, setSearchTimeout] = useState(setTimeout(() => {
        }, 0));

        const [platform, setPlatform] = props.platformState;

        const changePlatform = (newPlatform: string) => {
            setPlatform(newPlatform);
        }

        const textSubmit = () => {
            if (searchQuery === '' || (lastPlatform === platform && lastQuery === searchQuery)) {
                return;
            }
            searchVideo();
        }

        useEffect(() => {
            if (searchQuery === '') {
                return;
            }
            searchVideo();
        }, [platform])

        const searchVideo = () => {
            setLastPlatform(platform);
            setSubmitted(true);
            setLastQuery(searchQuery);
            setSearchTimeout(setTimeout(() => {
                setSubmitted(false);
                setLastQuery('');
            }, 10000));

            aFetch.post('/api/video/search/', {videoPlatform: platform, query: searchQuery}).then(response => {
                setVideoResults(response.data);
                setPage(1);
                setSubmitted(false);
                clearTimeout(searchTimeout);
            })
        }

        interface Video {
            title: string;
            thumbnailLink: string;
            channelName: string;
            videoLink: string;
        }

        const [videoResults, setVideoResults] = useState<Video[]>([]);
        const [activePage, setPage] = useState(1);
        const [submitted, setSubmitted] = useState(false);

        const vidPerColumn = width >= 770 ? (width >= 1280 ? 5 : 3) : 2;
        const vidPerPage = width >= 1280 ? 10 : 6;
        const totPage = Math.max(Math.ceil(videoResults.length / vidPerPage), 1)

        if (activePage > totPage || activePage < 1) {
            setPage(totPage)
        }


        return (
            <div className="flex flex-col items-center justify-center w-full bg-black" ref={heightRef}>
                <div className="h-20 w-3/5 flex flex-col items-center">
                    <b>Search for a video</b>
                    <div className="flex flex-row items-center justify-center w-full bg-black m-0">
                        <Platforms platformState={[platform, changePlatform]}/>
                        <TextInput
                            ref={ref}
                            className="w-4/5"
                            placeholder="Query"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === "Enter" ? textSubmit() : null}
                            rightSection={submitted ? <Loader size={"xs"}/> : null}
                        />
                        <Button className="py-2 px-4" onClick={textSubmit}>Search</Button>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-center w-full h-4/5 min-h-[550px]">
                    <SimpleGrid
                        className="w-full h-full m-2"
                        cols={vidPerColumn}>
                        {videoResults.map((video: Video, index) => {
                            if ((activePage - 1) * vidPerPage <= index && index < activePage * vidPerPage) {
                                return (
                                    <VideoIcon
                                        title={video.title}
                                        thumbnailLink={video.thumbnailLink}
                                        channelName={video.channelName}
                                        videoLink={video.videoLink}
                                        queueVideo={props.queueVideo}/>
                                )
                            } else {
                                return null;
                            }
                        })
                        }
                    </SimpleGrid>
                </div>

                <div className="videoSearchFooter">
                    <Pagination value={activePage} onChange={setPage} total={totPage} color="violet"/>
                </div>
            </div>
        )
    }
)

function VideoSearcher(props: { roomId: string, hidden?: boolean }) {
    const [videoLink, setVideoLink] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [platform, setPlatform] = useState<string>('youtube');

    const textSubmit = () => {
        if (videoLink !== "") {
            setSubmitted(true);
            aFetch.post(`/api/room/add_video`, {roomId: props.roomId, videoLink: videoLink, videoPlatform: platform}).then(
                response => {
                    setSubmitted(false);
                    if (response.data.validVideo) {
                        setVideoLink("");
                        setInvalid(false);
                    } else {
                        setInvalid(true);
                    }
                });
        } else {
            setInvalid(false);
        }
    }


    const setVideoLinkAndFocus = (newVideoLink: string) => {
        setInvalid(false);
        if (newVideoLink === videoLink) {
            textSubmit();
            return;
        }

        setVideoLink(newVideoLink);

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (!isMobile) {
            const videoLinkInput = document.getElementById("videoLinkInput");
            if (videoLinkInput) {
                videoLinkInput.focus();
            }
        }
    }

    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!props.hidden) {
            ref.current && ref.current.focus();
        }
    }, [props.hidden])


    return (
        <div className="relative">
            <RemoteVideoSearcher queueVideo={setVideoLinkAndFocus} platformState={[platform, setPlatform]} ref={ref}/>
            <TextInput
                id="videoLinkInput"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={videoLink}
                onChange={e => {
                    setInvalid(false);
                    setVideoLink(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" ? textSubmit() : null}
                rightSection={submitted ? <Loader size={"xs"}/> : null}
                error={invalid ? "Invalid Video Link" : null}/>

            <Button className="py-2 px-4" onClick={textSubmit}>Queue Video</Button>
        </div>
    )
}

export default VideoSearcher;