import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import {Button, TextInput} from "@mantine/core";
import {socket} from "../config/socket";
import {API_URL} from "../config/url";
import aFetch from "../config/axios";
import {MainPrompt} from "../components/prompt";



const Home = () => {
    const navigate = useNavigate();
    const move = (path: string) => {
        navigate(path);
    }

    const [joinCode, setJoinCode] = useState('');

    function hostRoom(){
        move(`/host/create_room`);
    }

    function joinRoom(){
        if (joinCode.length === 0){
            return;
        }
        aFetch.post(`/api/remote/check_room/${joinCode}`, {'redirect': true}).then(response => {
            if (response.data.validRoom){
                move(`/${joinCode}`);
            }
        });
    }
    document.title = "vidqr";

  return (
      <div className="mainViewer">
          <MainPrompt setValue={setJoinCode} submitPrompt={joinRoom} hostRoom={hostRoom}/>

      </div>
  )
}

export default Home;
