import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import {TextInput} from "@mantine/core";
import aFetch from "../config/axios";
import {PromptBox} from "../components/PromptBox";
import Button from "../components/Button";
import {socket} from "../config/socket";

function Room(props: {roomId: string, roomName: string, users: number}) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-row items-center bg-gray-500 rounded-lg p-3 mt-2">
            <div className="flex flex-col">
                <h3>{props.roomName}: {props.roomId}</h3>
                <p>{props.users} {props.users === 1? "user": "users"}</p>
            </div>
            <Button className="ml-auto w-12 h-12 relative bg-gray-700 right-0 float-right" onClick={() => navigate(`/${props.roomId}`)}>Rejoin</Button>
        </div>
    )

}
function RejoinRoom() {
    const [rooms, setRooms] = useState<{roomId: string; roomName: string; users: number}[]>([]);

    useEffect(() => {
        aFetch.post('/api/user/get_rooms/').then(response => {
            setRooms(response.data.rooms);
        });
    }, []);


    return (
        rooms.length > 0 ? <div className="mt-10 w-72 flex flex-col">
            <h3>Rejoin Room</h3>
            {rooms.map(room => {
                return <Room roomId={room.roomId} roomName={room.roomName} users={room.users}/>
            })}
        </div>: null
    )
}

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
      <div className="flex flex-col overflow-x-hidden overflow-y-auto items-center min-h-screen max-h-screen">
          <div className="my-auto">
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
                  <Button className="bg-gradient-to-r from-green-300 to-blue-400" onClick={hostRoom}>Host Room</Button>
              </PromptBox>

              <RejoinRoom/>
          </div>
      </div>
  )
}

export default Home;
