import React, { useState, useEffect } from "react";
import {VideoQueue} from "../components/video_queue";
import ReactPlayer from 'react-player'
import {
    AspectRatio,
    Switch,
    TransferList,
    TransferListData,
    CopyButton,
    Button,
    Tooltip,
    ActionIcon,
    UnstyledButton, Grid
} from '@mantine/core';
import {IconCopy, IconCheck, } from '@tabler/icons-react';
import {useParams, useNavigate} from "react-router-dom";
import {socket} from "../config/socket";
import {CURRENT_URL} from "../config/url";
import aFetch from "../config/axios";
import {HostPrompt} from "../components/prompt";

function HostVideoPlayer(params: any) {
    const [videoRef, setVideoRef] = useState('');
    const [videoPlaying, setVideoPlaying] = useState(true);

    const nextVideo = () => {
        socket.emit("video:nextVideo", {"roomId": params.link})
    }


    aFetch.post('/api/host/get_current_video/'+params.link).then(response => {
        if (response.data.video){
            setVideoRef(response.data.video.videoLink)
        }else{
            setVideoRef('')
        }
    })

    socket.on("video:nextVideo", (params: any) => {
        const videoLink = params.videoLink;


        if (videoLink !== videoRef) {
            setVideoRef(videoLink);
        }else{
            setVideoRef(videoLink + '?');
        }
    });



    socket.on("video:toggleVideo", () => {
        console.log("toggle video");
        setVideoPlaying(!videoPlaying);
    });



    return (
        <AspectRatio ratio={16 / 9}>
            <ReactPlayer url={videoRef}
                         playing={videoPlaying}
                         controls={true}
                         embedoptions={{cc_load_policy: 1, cc_lang_pref: "en"}}
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



function ShareLink(props: { link: string; }) {
    let full_link = CURRENT_URL + "/" + (props.link === undefined ? "" : props.link);
    return (
        <div className="iconDisplay">
            <b>{full_link}</b>
            <CopyButton value={full_link} timeout={2000}>
                {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                    </Tooltip>
                )}
            </CopyButton>
        </div>
    )
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
                        <Grid grow>
                            {/*<Grid.Col span={4}>/!*<UserList/>*!/</Grid.Col>*/}
                            {/*<Grid.Col span={4}>/!*<AdminPanel/>*!/</Grid.Col>*/}
                            <Grid.Col span="content"></Grid.Col>
                            <Grid.Col span="content"><ShareLink link={props.roomId}/></Grid.Col>
                        </Grid>
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
    const invalidRoomId = params.roomId === undefined || params.roomId === "" || isNaN(Number(params.roomId))

    const [roomName, setRoomName] = useState('');
    const [roomNameBox, setRoomNameBox] = useState('');

    useEffect(() => {
        if (params.roomId === "create_room"){
            aFetch.post('/api/host/rejoin_room').then(response => {
                if (response.data.host){
                    navigate(`/host/${response.data.roomId}`);
                }
                console.log(response.data);
            })


        }else if (invalidRoomId) {
            navigate('/host/create_room', {replace: true});
        }else{
            aFetch.post(`/api/host/get_room_info`, {'roomId': params.roomId}).then(response => {
                if (response.data.host){
                    setRoomName(response.data.roomName);
                }else{
                    navigate('/host/create_room', {replace: true});
                }
            });
        }
    }, [navigate, params.roomId, invalidRoomId]);

    const promptSubmit = () => {
        aFetch.post(`/api/host/create_room/`, {'roomName': roomNameBox }).then(response => {
            if (response.data.roomId){
                setRoomName(roomNameBox);
                navigate(`/host/${response.data.roomId}`)
            }
        });

    }

    if (params.roomId === 'create_room'){
        return (
            <div className="mainViewer">
                <HostPrompt setValue={setRoomNameBox} submitPrompt={promptSubmit}/>
            </div>
        )
    }else if (invalidRoomId || params.roomId === undefined) {
        return (
            <p>Redirecting...</p>
        )
    }else{
        document.title = roomName;
        return (
            <>

                <div className="mainViewer">
                    <div className="remoteHeader">
                        <b>{roomName}</b>

                        <b>{params.roomId}</b>
                    </div>
                    <HostMenu roomId={params.roomId}/>
                </div>
            </>

        );
    }
};

export default Host
