import React, { useState } from "react";
import {
    CopyButton,
    Tooltip,
    ActionIcon,
} from '@mantine/core';
import {IconCopy, IconCheck, } from '@tabler/icons-react';
import {useNavigate} from "react-router-dom";
import {CURRENT_URL} from "../config/url";
import aFetch from "../config/axios";
import {PromptBox, RoomNamePrompt, SubmitButton} from "../components/PromptBox";

function ShareLink(props: { link: string; }) {
    let full_link = CURRENT_URL + "/" + (props.link === undefined ? "" : props.link);
    return (
        <div className="flex flex-row border-solid bg-gray-900 border-gray-700 border-2 rounded float-right
        w-96
        md:w-fit

        ">
            <b>{full_link}</b>
            <div className="shareLinkButton">
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
        </div>
    )
}
const Host = () => {
    const navigate = useNavigate();

    const [roomNameBox, setRoomNameBox] = useState('');
    const [roomNameError, setRoomNameError] = useState('');

    const promptSubmit = () => {
        if (roomNameBox.length > 16 || roomNameBox.length === 0){
            if (roomNameBox.length === 0){
                setRoomNameError('Room name cannot be empty');
            }
            return;
        }

        aFetch.post(`/api/room/create_room/`, {'roomName': roomNameBox }).then(response => {
            if (response.data.roomId){
                navigate(`/${response.data.roomId}`)
            }
        });
    }

    return (
        <div className="flex flex-col min-h-full overflow-x-hidden overflow-y-hidden flex flex-col justify-center items-center min-h-full h-screen">
            <PromptBox promptSubmit={promptSubmit}>
                <RoomNamePrompt roomNameState={[roomNameBox, setRoomNameBox]} errorState={[roomNameError, setRoomNameError]}/>
                {/*<b>Optional Password</b>*/}
                {/*<TextInput*/}
                {/*    placeholder="Password"*/}
                {/*    onChange={(e) => {}}*/}
                {/*/>*/}
                <SubmitButton text="Create Room"/>
            </PromptBox>
        </div>
    )
};

export default Host;
export {ShareLink};