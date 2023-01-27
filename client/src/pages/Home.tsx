import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import {Button, TextInput} from "@mantine/core";
import {socket} from "../config/socket";
import {API_URL} from "../config/url";
import aFetch from "../config/axios";



const Home = () => {
    const navigate = useNavigate();
    const move = (path: string) => {
        navigate(path);
    }

    const [joinCode, setJoinCode] = useState('');

    function hostRoom(){
        aFetch.post('/api/host/create_room').then(response => {
            move(`/host/${response.data.roomId}`);
            console.log(response.data);
        })
    }

    function joinRoom(){
        if (joinCode.length === 0){
            return;
        }
        aFetch.post(`/api/remote/join_room/${joinCode}`, {'redirect': true}).then(response => {
            if (response.data.validRoom){
                move(`/${response.data.roomId}`);
                socket.emit("video:subscribe", {'roomId': response.data['roomId']});
            }
        });
    }

    const handleJoinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setJoinCode(event.target.value);
    }

  return (
      <div>

        <Button onClick={hostRoom}>
            Host Room
        </Button>

        <TextInput
            value={joinCode}
            onChange={handleJoinChange}
            label="Room Link"
            placeholder="123456"
        />

        <Button onClick={joinRoom}>
            Join Room
        </Button>

      </div>
  )
}

export default Home;
