import {useWindowDimensions} from "../hooks/hooks";
import React, {useState} from "react";
import aFetch from "../config/axios";
import {Button, Loader, Pagination, SimpleGrid, TextInput} from "@mantine/core";
import {ShareLink} from "../pages/Host";

function VideoIcon(params: {thumbnailLink: string, title: string, channelName: string, videoLink: string, queueVideo: any}) {

    return (
        <div className="videoIcon" onClick={() => params.queueVideo(params.videoLink)}>
            <img
                src={params.thumbnailLink}
                style={{objectFit: "cover", width: "100%", height: "60%"}}
                alt={params.videoLink}
            />
            <div className="videoIconOverlayText">
                <div className="videoIconOverlayTitle">
                    <b className="videoSearchText">{params.title}</b>
                </div>
                <div className="videoIconOverlaySubtext">
                    <p className="videoSearchText">{params.channelName}</p>
                </div>
            </div>
        </div>
    )
}


function RemoteVideoSearcher(params: {queueVideo: any}) {
    const { width } = useWindowDimensions();

    const [searchQuery, setsearchQuery] = useState('');

    const [lastQuery, setLastQuery] = useState('');

    const textSubmit = () => {
        if (searchQuery === '' || lastQuery === searchQuery) {
            return;
        }
        setSubmitted(true);
        setLastQuery(searchQuery);

        aFetch.post('/api/room/search/', {videoPlatform: 'youtube', query: searchQuery}).then(response => {
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

    const [videoResults, setVideoResults] = useState([]);
    const [activePage, setPage] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    const vidPerColumn = width>=770? (width >= 1280 ? 5: 3) : 2;
    const vidPerPage = width>=1280 ? 10 : 6;
    const totPage = Math.max(Math.ceil(videoResults.length / vidPerPage), 1)

    if (activePage > totPage || activePage < 1) {
        setPage(totPage)
    }


    return (
        <div className="videoSearch">
            <div className="videoSearchHeader">
                <b>Search for a video</b>
                <div className="videoSearchHeaderSearch">
                    <TextInput
                        className="videoSearchInput"
                        placeholder="Query"
                        value={searchQuery}
                        onChange={(e) => setsearchQuery(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === "Enter" ? textSubmit(): null}
                        rightSection={submitted ? <Loader size={"xs"}/>: null}
                    />
                    <Button variant="gradient" gradient={{ from: '#ed6ea0', to: '#ec8c69', deg: 35 }} onClick={() => textSubmit()}>Search</Button>
                </div>
            </div>

            <div className="videoSearchBody">
                <SimpleGrid
                    className="videoSearchGrid"
                    cols={vidPerColumn}>
                    {videoResults.map((video: Video, index) => {
                        if ((activePage-1) * vidPerPage <= index && index < activePage * vidPerPage){
                            return (
                                <VideoIcon
                                    title={video.title}
                                    thumbnailLink={video.thumbnailLink}
                                    channelName={video.channelName}
                                    videoLink={video.videoLink}
                                    queueVideo={params.queueVideo}/>
                            )
                        }else{
                            return null;
                        }
                    })
                    }
                </SimpleGrid>
            </div>

            <div className="videoSearchFooter">
                <Pagination page={activePage} onChange={setPage} total={totPage} color="violet" />
            </div>
        </div>
    )
}

function VideoSearcher(params: {roomId: string}) {
    const [videoLink, setVideoLink] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [invalid, setInvalid] = useState(false);

    const textSubmit = () => {
        if (videoLink !== "") {
            setSubmitted(true);
            aFetch.post(`/api/room/add_video`, {'roomId': params.roomId, 'videoLink': videoLink}).then(
                response => {
                    setSubmitted(false);
                    if (response.data.validVideo) {
                        setVideoLink("");
                        setInvalid(false);
                    }else{
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
    return (
        <>
            <RemoteVideoSearcher queueVideo={setVideoLinkAndFocus}/><TextInput
            id="videoLinkInput"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            value={videoLink}
            onChange={e => {
                setInvalid(false);
                setVideoLink(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" ? textSubmit() : null}
            rightSection={submitted ? <Loader size={"xs"}/> : null}
            error={invalid ? "Invalid Video Link" : null}/><Button variant="gradient"
                                                                   gradient={{from: 'indigo', to: 'cyan'}}
                                                                   onClick={() => {
                                                                       textSubmit();
                                                                   }}>Queue Video</Button><ShareLink
            link={params.roomId}/>
        </>
    )
}

export default VideoSearcher;