import {Button, Stack, TextInput } from '@mantine/core';


function RemotePrompt(params: any){
    return (
        <div className="promptForm">
            <div className="promptBox">
                <Stack >
                    <b>You are trying to join room <mark>{params.roomName}</mark></b>

                    <b>Pick an identifiable name</b>
                    <TextInput
                        placeholder="Username"
                        onChange={(e) => {params.setValue(e.target.value)}}
                    />
                    {params.isLocked ? (
                        <><b>This room is password-locked</b><TextInput
                            placeholder="Room Secret"/></>): null}
                    <Button variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} onClick={params.submitPrompt}>Enter</Button>
                </Stack>
            </div>
        </div>
    )
}

function HostPrompt(params: any){
    return (
        <div className="promptForm">
            <div className="promptBox">
                <Stack >
                    <b>Pick a room name</b>
                    <TextInput
                        placeholder="Room Name"
                        onChange={(e) => {params.setValue(e.target.value)}}
                    />
                    {/*<b>Optional Password</b>*/}
                    {/*<TextInput*/}
                    {/*    placeholder="Password"*/}
                    {/*    onChange={(e) => {}}*/}
                    {/*/>*/}
                    <Button variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} onClick={params.submitPrompt}>Enter</Button>
                </Stack>
            </div>
        </div>
    )
}

function MainPrompt(params: any){
    return (
        <div className="promptForm">
            <div className="promptBox">
                <Stack >

                    <b>Enter a Room Code</b>
                    <TextInput
                        placeholder="Room Code"
                        onChange={(e) => {params.setValue(e.target.value)}}
                    />
                    <Button variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} onClick={params.submitPrompt}>Enter</Button>

                    <p>Alternatively, make your own room</p>
                    <Button compact onClick={params.hostRoom}>Host Room</Button>
                </Stack>
            </div>
        </div>
    )
}

export {MainPrompt, HostPrompt, RemotePrompt };