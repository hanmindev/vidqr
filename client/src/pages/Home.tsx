import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {TextInput} from "@mantine/core";
import aFetch from "../config/axios";
import {PromptBox} from "../components/PromptBox";
import Button from "../components/Button";



const Home = () => {
    const navigate = useNavigate();

    const [joinCode, setJoinCode] = useState('');
    const [invalidCode, setInvalidCode] = useState(false);

    function hostRoom(){
        navigate(`/create_room`);
    }

    function joinRoom(){
        if (joinCode.length === 0){
            return;
        }
        aFetch.post(`/api/room/check_room/${joinCode}`, {'redirect': true}).then(response => {
            if (response.data.validRoom){
                navigate(`/${joinCode}`);
            }else{
                setInvalidCode(true);
            }
        });
    }
    document.title = "vidqr";

  return (
      <div className="flex flex-col min-h-full overflow-x-hidden overflow-y-hidden">
          <PromptBox promptSubmit={joinRoom}>
              <b>Enter a Room Code</b>
              <TextInput
                  placeholder="Room Code"
                  onChange={(e) => {setInvalidCode(false);setJoinCode(e.target.value)}}
                  onKeyDown={(e) => e.key === "Enter" ? joinRoom(): null}
                  error={invalidCode ? "Invalid Room Code" : null}
              />
              <Button className="bg-gradient-to-r from-green-400 to-blue-500" onClick={joinRoom}>Enter</Button>

              <p className="text-white">Alternatively, make your own room</p>
              {/*<Button compact onClick={hostRoom}>Host Room</Button>*/}
              <Button className="bg-gradient-to-r from-green-300 to-blue-400" onClick={hostRoom}>Host Room</Button>

          </PromptBox>
      </div>
  )
}

export default Home;
