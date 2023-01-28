import session from "express-session";

const axios = require('axios').default;

import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

module.exports = (io) => {
    const subscribe = function (params) {
        let roomId = params.roomId;

        const socket = this;
        socket.join(roomId);
        const room = roomManager.getRoom(roomId);
        io.to(roomId).emit("video:videoList", {'videoList': room !== undefined ? room.videoList: []});

    };

    const addVideo = function (params: { videoLink: string, roomId: string }) {
        const req = this.request;
        this.request.session.reload((err) => {
            if (err) {
                return this.disconnect();
            }


            let videoLink = params.videoLink;
            let userId = req.session.userId;
            let userId2 = this.request.session.userId;
            let roomId = params.roomId;

            if (videoLink.includes("list")) {
                videoLink = videoLink.split("&list")[0];
            }

            axios.get("https://noembed.com/embed?url=" + videoLink).then(response => {
                let videoTitle: string = response.data.title;
                let videoThumbnail: string = response.data.thumbnail_url;
                let videoUser = userManager.getUser(userId);

                const room = roomManager.getRoom(roomId);
                let video = {
                    'videoLink': videoLink,
                    'videoTitle': videoTitle,
                    'videoThumbnail': videoThumbnail,
                    'videoUsername': videoUser.username,
                    'videoId': room.getCurrentVideoCount()
                };

                room.addVideo(video);

                if (room.videoList.length == 1) {
                    io.to(roomId).emit("video:nextVideo", {'videoLink': videoLink});
                }

                io.to(roomId).emit("video:videoList", {'videoList': room.videoList});
            });
        });
    };

    const nextVideo = function (params) {
        let roomId = params.roomId;
        const room = roomManager.getRoom(roomId);

        if (room.videoList.length > 1) {
            const nextVideoObject = room.videoList[1];
            io.to(roomId).emit("video:nextVideo", {'video': nextVideoObject});
        }else{
            io.to(roomId).emit("video:nextVideo", {'video': ''});
        }

        if (room.videoList.length > 0) {
            room.videoList.shift();
        }

        io.to(roomId).emit("video:videoList", {'videoList': room.videoList});

    }

    return {
        subscribe,
        addVideo,
        nextVideo
    }
}