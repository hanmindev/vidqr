import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {Button, Stack, TextInput} from "@mantine/core";
import aFetch from "../config/axios";



const Home = () => {
    const navigate = useNavigate();

    const [joinCode, setJoinCode] = useState('');
    const [invalidCode, setInvalidCode] = useState(false);

    function hostRoom(){
        navigate(`/host/create_room`);
    }

    function joinRoom(){
        if (joinCode.length === 0){
            return;
        }
        aFetch.post(`/api/remote/check_room/${joinCode}`, {'redirect': true}).then(response => {
            if (response.data.validRoom){
                navigate(`/${joinCode}`);
            }else{
                setInvalidCode(true);
            }
        });
    }
    document.title = "vidqr";

  return (
      <div className="mainViewer">
          <div className="promptForm">
              <div className="promptBox">
                  <Stack >
                      <b>Enter a Room Code</b>
                      <TextInput
                          placeholder="Room Code"
                          onChange={(e) => {setInvalidCode(false);setJoinCode(e.target.value)}}
                          onKeyDown={(e) => e.key === "Enter" ? joinRoom(): null}
                            error={invalidCode ? "Invalid Room Code" : null}
                      />
                      <Button variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} onClick={joinRoom}>Enter</Button>

                      <p>Alternatively, make your own room</p>
                      <Button compact onClick={hostRoom}>Host Room</Button>
                  </Stack>
              </div>
          </div>
      </div>
  )
}

export default Home;
