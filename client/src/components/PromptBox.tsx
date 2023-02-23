import {Stack, TextInput} from "@mantine/core";
import React, {createContext, ReactNode, useContext} from "react";
import Button from "./Button";

const SubmitContext = createContext(() => {});

function RoomNamePrompt({roomNameState, errorState}: {roomNameState: [string, (roomName: string) => void]; errorState: [string, (roomName: string) => void]}) {
    const promptSubmit = useContext(SubmitContext);

    const [roomName, setRoomName] = roomNameState;
    const [error, setError] = errorState;

    const roomNameEdit = (roomName: string) => {
        setRoomName(roomName);
        if (roomName.length > 16){
            setError('Room names must be at most 16 characters');
        }else{
            setError('');
        }
    }

    return (
        <>
            <b>Pick a room name</b>
            <TextInput
                placeholder="Room Name"
                onChange={(e) => {roomNameEdit(e.target.value)}}
                onKeyDown={(e) => e.key === "Enter" ? promptSubmit(): null}
                error={error}
            />
        </>
    )
}
function RoomUserNamePrompt({roomId, usernameState, errorState}: {roomId: string; usernameState: [string, (username: string) => void]; errorState: [string, (error: string) => void]}) {

    const [username, setUsername] = usernameState;
    const [error, setError] = errorState;

    const promptSubmit = useContext(SubmitContext);

    const usernameEdit = (username: string) => {
        setUsername(username);
        if (username.length > 16){
            setError('Usernames must be at most 16 characters');
        }else{
            setError('');
        }
    }

    return (
        <>
            <b>Pick a username</b>
            <TextInput
                placeholder="Username"
                onChange={(e) => {usernameEdit(e.target.value)}}
                onKeyDown={(e) => e.key === "Enter" ? promptSubmit(): null}
                error={error==='' ? null: error}
            />
        </>
    )
}

function SubmitButton(props: {text: string}) {
    const promptSubmit = useContext(SubmitContext);
    return <Button className="bg-gradient-to-r from-green-400 to-blue-500" onClick={promptSubmit}>{props.text}</Button>
}

function PromptBox(props: {children: ReactNode; promptSubmit: () => void}) {

    return (
        <SubmitContext.Provider value={props.promptSubmit}>
            <div className="flex flex-col items-center p-4 rounded bg-gradient-to-tl from-teal-300 to-teal-900 w-72 h-64">
                <Stack className="w-4/5">
                    {props.children}
                </Stack>
            </div>
        </SubmitContext.Provider>
    )
}

export {PromptBox, RoomNamePrompt, RoomUserNamePrompt, SubmitButton};