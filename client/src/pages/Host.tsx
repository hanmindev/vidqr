import React, { useState } from "react";
import {
    Switch,
    TransferList,
    TransferListData,
    CopyButton,
    Tooltip,
    ActionIcon,
} from '@mantine/core';
import {IconCopy, IconCheck, } from '@tabler/icons-react';
import {useNavigate} from "react-router-dom";
import {CURRENT_URL} from "../config/url";
import aFetch from "../config/axios";
import "./Host.css";
import {PromptBox, RoomNamePrompt} from "../components/PromptBox";


class UserList extends React.Component<{}, {data: TransferListData}>  {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [[{value: 'test', label: 'test'}],[]]
    }
  }


  render() {
    return (
      <div className="userList">
        <b>List of connected users:</b>

        <TransferList
            value={this.state.data}
            onChange={(st) => this.setState({ data: st })}
            searchPlaceholder="Search..."
            nothingFound="Nothing here"
            titles={['Standard users', 'Admins']}
            breakpoint="sm"
        />
      </div>
    )
  }
}

class PasswordEntry extends React.Component<{}, {}>  {
  constructor(props: any) {
    super(props);
  }
  render() {
    return (
      <div className="passwordEntry"><b>Optional Password: </b><input type="password"></input></div>
    )
  }
}

class AdminPanel extends React.Component<{}, {}>  {
    constructor(props: any) {
        super(props);

    }
    render() {
      return (
          <div>
            <Switch.Group
                defaultValue={['media', 'kick']}
                orientation="vertical"
                label="Administrator Permissions"
                spacing="sm"
                offset="sm"
            >
              <Switch value="media" label="Media Controls" />
              <Switch value="kick" label="Kick Users" />
            </Switch.Group>
          </div>

      );
    }
}



function ShareLink(props: { link: string; }) {
    let full_link = CURRENT_URL + "/" + (props.link === undefined ? "" : props.link);
    return (
        <div className="shareLink">
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
        <PromptBox promptSubmit={promptSubmit}>
            <RoomNamePrompt roomNameState={[roomNameBox, setRoomNameBox]} errorState={[roomNameError, setRoomNameError]}/>
            {/*<b>Optional Password</b>*/}
            {/*<TextInput*/}
            {/*    placeholder="Password"*/}
            {/*    onChange={(e) => {}}*/}
            {/*/>*/}
        </PromptBox>
    )
};

export default Host;
export {ShareLink};