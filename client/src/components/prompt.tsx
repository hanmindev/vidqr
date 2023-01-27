import {Button, Stack, TextInput } from '@mantine/core';

function PromptTextBox(params: any){
    return (
        <Stack >
            <b style={{color: 'black'}}>Pick an identifiable name</b>
            <TextInput
                placeholder="Username"
                onChange={(e) => {params.setUsername(e.target.value)}}
            />
            {params.isLocked ? (
                <><b style={{color: 'black'}}>This room is password-locked</b><TextInput
                    placeholder="Room Secret"/></>): null}
            <Button variant="gradient" gradient={{ from: 'teal', to: 'cyan' }} onClick={params.submitPrompt}>Enter</Button>
        </Stack>
    )
}

function RemotePrompt(params: any){
    return (
        <div className="promptForm">
            <div className="promptBox">
                <PromptTextBox isLocked={params.isLocked} setUsername={params.setUsername} submitPrompt={params.submitPrompt}/>
            </div>
        </div>
    )
}

function HostPrompt(params: any){
    return (
        <div className="promptForm">
            <div className="promptBox">
                <PromptTextBox setUsername={params.setUsername} submitPrompt={params.submitPrompt}/>
            </div>
        </div>
    )
}

function MainPrompt(params: any){
    return (
        <div className="promptForm">
            <div className="promptBox">
                <PromptTextBox setUsername={params.setUsername} submitPrompt={params.submitPrompt}/>
            </div>
        </div>
    )
}

export {RemotePrompt, PromptTextBox};