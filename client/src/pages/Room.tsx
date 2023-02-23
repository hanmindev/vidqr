import React, { useState, useEffect } from "react";
import {useNavigate, useParams} from 'react-router-dom';
import {socket} from "../config/socket";
import aFetch from "../config/axios";
import Dashboard from "../components/Dashboard";
import {PromptBox, RoomUserNamePrompt, SubmitButton} from "../components/PromptBox";
import {Skeleton} from "@mui/material";

const Room = () => {
    let params: any = useParams();
    let navigate = useNavigate();

    const [username, setUsername]: any = useState(undefined)
    const [usernameBox, setUsernameBox] = useState('')
    const [usernameError, setUsernameError] = useState('');

    const [roomInfo, setRoomInfo] = useState({'roomName': undefined});

    const [isHost, setIsHost] = useState(false);


    useEffect(() => {
        aFetch.post(`/api/room/get_room_info/`, {'roomId': params.roomId}).then(response => {
            if (response.data.roomName){
                document.title = response.data.roomName;
                setRoomInfo(response.data);
                setIsHost(response.data.host);
            }else{
                navigate('/');
            }
        });

        aFetch.post(`/api/user/get_username/${params.roomId}`).then(response => {
            if (response.data.username){
                setUsername(response.data.username);
            }else {
                setUsername('');
            }
        });

    }, [navigate, params.roomId]);

    const promptSubmit = () => {
        if (usernameBox.length > 16 || usernameBox.length === 0){
            if (usernameBox.length === 0){
                setUsernameError('Username cannot be empty');
            }
            return;
        }

        aFetch.post(`/api/user/join_room/${params.roomId}`, {'redirect': false, 'username': usernameBox}).then(response => {
            if (response.data.username){
                socket.emit("video:subscribe", {'roomId': response.data.roomId});
                setUsername(response.data.username);
            }else if(response.data.validRoom){
                setUsernameError('That username already exists.');
            }
        });

    }


    if (username === undefined || roomInfo.roomName === undefined){
        return (
            <Skeleton variant="rectangular" width={"100%"} height={"100%"} />
        )
    }else if (username === ''){
        return (
            <div className="flex flex-col min-h-full overflow-x-hidden overflow-y-hidden flex flex-col justify-center items-center min-h-full h-screen">
                <PromptBox promptSubmit={promptSubmit}>
                    <b>You are trying to join room: <br/><mark>{roomInfo.roomName}</mark></b>

                    <RoomUserNamePrompt roomId={params.roomId} usernameState={[usernameBox, setUsernameBox]} errorState={[usernameError, setUsernameError]}/>

                    {/*{props.isLocked ? (*/}
                    {/*    <><b>This room is password-locked</b><TextInput*/}
                    {/*        placeholder="Room Secret"/></>): null}*/}
                    <SubmitButton text="Join Room"/>
                </PromptBox>
            </div>
        )
    }else {
        return (
            <Dashboard roomId={params.roomId} username={username} isHost={isHost}/>
        )
    }
};

export default Room;
