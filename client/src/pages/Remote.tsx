import React, { useState, useEffect } from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {VideoQueue} from "../components/video_queue";
import { Button, TextInput } from '@mantine/core';
import {socket} from "../config/socket";
import {API_URL} from "../config/url";
import aFetch from "../config/axios";
import {useSetState} from "@mantine/hooks";
import {RemotePrompt} from "../components/prompt";

function RemoteWrapper(params: any) {
    const [videoLink, setVideoLink] = useState('');

    const textSubmit = () => {
        if (videoLink !== "") {
            aFetch.post(`/api/remote/add_video`, {'roomId': params.roomId, 'videoLink': videoLink}).then(r => {});
            setVideoLink("");
        } else {
            alert("Please Add A Valid Link");
        }
    }

    return (
        <div className="hViewer">
          <div className="primary">
              <TextInput
                  label="YouTube Link"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={videoLink}
                  onChange={e => setVideoLink(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" ? textSubmit(): null}
              />
              <Button
                  onClick={() => {textSubmit()}}
              >
                  Submit
              </Button>
          </div>
          <div className="secondary">
            <VideoQueue roomId={params.roomId}/>
          </div>
        </div>
    );
}
const Remote = () => {
    let params = useParams();
    let navigate = useNavigate();

    const [username, setUsername] = useState('')
    const [usernameBox, setUsernameBox] = useState('')
    const [roomInfo, setRoomInfo] = useSetState({'roomName': undefined});

    useEffect(() => {
        aFetch.post(`/api/host/get_room_info/`, {'roomId': params.roomId}).then(response => {
            if (response.data.roomName){
                document.title = response.data.roomName;
                setRoomInfo(response.data);
            }else{
                navigate('/');
            }
        });

        aFetch.post(`/api/remote/get_username/${params.roomId}`).then(response => {
            if (response.data.username){
                setUsername(response.data.username);
            }
        }
    )}, []);

    const promptSubmit = () => {
        aFetch.post(`/api/remote/join_room/${params.roomId}`, {'redirect': false, 'username': usernameBox}).then(response => {
            if (response.data.validRoom){
                socket.emit("video:subscribe", {'roomId': response.data.roomId});
                setUsername(usernameBox);
            }
        });

    }

    if (username === '' || username === undefined){
        return (
            <div className="mainViewer">
                <RemotePrompt roomName={roomInfo.roomName} setValue={setUsernameBox} submitPrompt={promptSubmit}/>
            </div>
        )
    }else{
        return (
            <div className="mainViewer">
                <div className="remoteHeader">
                    <b>{username}</b>

                    <b>{params.roomId}</b>
                </div>


                <RemoteWrapper roomId={params.roomId}/>
            </div>
        );
    }
};

export default Remote;
