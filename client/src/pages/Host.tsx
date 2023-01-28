import React, { useState, useEffect } from "react";
import {VideoQueue} from "../components/video_queue";
import ReactPlayer from 'react-player'
import { AspectRatio, Switch, TransferList, TransferListData, CopyButton, Button, Tooltip, ActionIcon } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import {useParams, Navigate, Route, Routes, useNavigate} from "react-router-dom";
import {socket} from "../config/socket";
import {API_URL, CURRENT_URL} from "../config/url";
import aFetch from "../config/axios";

function HostVideoPlayer(params: any) {
    const [videoRef, setVideoRef] = useState('');

    const nextVideo = () => {
        socket.emit("video:nextVideo", {"roomId": params.link})
    }

    aFetch.post('/api/host/get_current_video/'+params.link).then(response => {
        setVideoRef(response.data.video.videoLink)
    })

    socket.on("video:nextVideo", (params: any) => {
        const videoLink = params.videoLink;


        if (videoLink !== videoRef) {
            setVideoRef(videoLink);
        }else{
            setVideoRef(videoLink + '?');
        }
    });



    return (
        <AspectRatio ratio={16 / 9}>
            <ReactPlayer url={videoRef}
                         playing={true}
                         controls={true}
                         width="100%"
                         height="100%"
                         onEnded={() => nextVideo()}
            />
        </AspectRatio>
    );
}
class UserList extends React.Component<{}, {data: TransferListData}>  {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [[{value: 'test', label: 'test'}],[]]
    }
  }


  render() {
    return (
      <div className="userList">
        <b>List of connected users:</b>

        <TransferList
            value={this.state.data}
            onChange={(st) => this.setState({ data: st })}
            searchPlaceholder="Search..."
            nothingFound="Nothing here"
            titles={['Standard users', 'Admins']}
            breakpoint="sm"
        />
      </div>
    )
  }
}

class PasswordEntry extends React.Component<{}, {}>  {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <div className="passwordEntry"><b>Optional Password: </b><input type="password"></input></div>
    )
  }
}

class AdminPanel extends React.Component<{}, {}>  {
    constructor(props: any) {
        super(props);

    }
    render() {
      return (
          <div>
            <Switch.Group
                defaultValue={['media', 'kick']}
                orientation="vertical"
                label="Administrator Permissions"
                spacing="sm"
                offset="sm"
            >
              <Switch value="media" label="Media Controls" />
              <Switch value="kick" label="Kick Users" />
            </Switch.Group>
          </div>

      );
    }
}

class ShareLink extends React.Component<{link: string | undefined}, {link: string}>  {
  constructor(props: { link: string; }) {
    super(props);
    let full_link = CURRENT_URL + "/" + (props.link === undefined ? "" : props.link);

    this.state = {
        link: full_link
    }

  }

  render() {
    return (
        <>
            <b>{this.state.link}</b>
            <CopyButton value={this.state.link} timeout={2000}>
                {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                    </Tooltip>
                )}
            </CopyButton>
        </>

    )
  }
}

function HostMenu(props: { roomId: string; }) {
    return (
        <div className="mainViewer">
            <div className="hViewer">
                <div className="vViewer">
                    <div className="primary">
                        <HostVideoPlayer link={props.roomId}/>
                    </div>
                    <div className="hostSettings">
                        {/*<UserList/>*/}
                        {/*<AdminPanel/>*/}
                        <ShareLink link={props.roomId}/>
                    </div>
                </div>
                <div className="secondary">
                    <VideoQueue roomId={props.roomId}/>
                </div>
            </div>
        </div>
    )
}

const Host = () => {
    let params = useParams();
    const navigate = useNavigate();
    const redirect = params.roomId === undefined || params.roomId === "" || isNaN(Number(params.roomId))

    useEffect(() => {
        if (redirect) {
            navigate('/', {replace: true});
        }

    }, [navigate, params.roomId, redirect]);

    if (redirect || params.roomId === undefined) {
        return (
            <p>Redirecting...</p>
        )
    }else{
        return (
            <HostMenu roomId={params.roomId}/>
        );
    }
};

export default Host
