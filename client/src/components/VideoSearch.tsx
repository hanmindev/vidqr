import React, {ForwardedRef, forwardRef, useEffect, useRef, useState} from "react";
import aFetch from "../config/axios";
import {Loader, Pagination, SimpleGrid, TextInput} from "@mantine/core";
import Button from "./Button";

function VideoIcon(params: { thumbnailLink: string, title: string, channelName: string, videoLink: string, queueVideo: any }) {

    return (
        <div className="w-full bg-gray-800 m-0 rounded-xl min-h-[80%]"
             onClick={() => params.queueVideo(params.videoLink)}>
            <img
                src={params.thumbnailLink}
                style={{objectFit: "cover", width: "100%", height: "60%"}}
                alt={params.videoLink}
            />
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

function PlatformIcon({icon, onClick}: { icon: string; onClick: () => void }) {
    return (
        <div className="w-10 h-10 rounded-full bg-gray-800 flex justify-center items-center" onClick={onClick}>
            <img src={icon} alt={icon} className="w-6 h-6"/>
        </div>
    )
}

function Platforms(props: { setPlatform: (platform: string) => void }) {

    return (
        <div className="flex flex-row justify-center items-center">
            <PlatformIcon icon="/youtube.png" onClick={() => props.setPlatform('youtube')}/>
            <PlatformIcon icon="/twitch.png" onClick={() => props.setPlatform('twitch')}/>
            <PlatformIcon icon="/bilibili.png" onClick={() => props.setPlatform('bilibili')}/>
        </div>

    )
}

const RemoteVideoSearcher = forwardRef(function RemoteVideoSearcher(props: { queueVideo: any }, ref: ForwardedRef<any>) {
        const heightRef = useRef<any>(null)
        const [width, setWidth] = useState(0);
        useEffect(() => {
            if (heightRef.current) setWidth(heightRef.current.offsetWidth);
        }, [heightRef]);

        window.addEventListener('resize', () => setWidth(heightRef.current.offsetWidth));

        const [searchQuery, setSearchQuery] = useState('');

        const [lastQuery, setLastQuery] = useState('');

        const [platform, setPlatform] = useState<string>();

        const changePlatform = (platform: string) => {
            setPlatform(platform);
            if (searchQuery !== '') {
                textSubmit();
            }

        }

        const textSubmit = () => {
            if (searchQuery === '' || lastQuery === searchQuery) {
                return;
            }
            setSubmitted(true);
            setLastQuery(searchQuery);

            aFetch.post('/api/video/search/', {videoPlatform: 'youtube', query: searchQuery}).then(response => {
                setVideoResults(response.data);
                setPage(1);
                setSubmitted(false);
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
                        <Platforms setPlatform={changePlatform}/>
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

    const textSubmit = () => {
        if (videoLink !== "") {
            setSubmitted(true);
            aFetch.post(`/api/room/add_video`, {'roomId': props.roomId, 'videoLink': videoLink}).then(
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
            console.log(ref.current)
        }
    }, [props.hidden])


    return (
        <div className="relative">
            <RemoteVideoSearcher queueVideo={setVideoLinkAndFocus} ref={ref}/>
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