import {CURRENT_URL} from "../config/url";
import {ActionIcon, CopyButton, Tooltip} from "@mantine/core";
import {IconCheck, IconCopy} from "@tabler/icons-react";
import React from "react";

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

export default ShareLink;