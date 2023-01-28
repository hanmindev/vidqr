import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";
import {default as axios} from "axios";




var express = require('express');
var router = express.Router();

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

router.post('/get_username/:roomId', function (req, res, next) {
    if (req.session.userId) {
        let username = userManager.getUser(req.session.userId).username;
        res.send({'username': username});
    } else {
        res.send({'username': undefined});
    }
    req.session.userId = userManager.getUnusedId();
});

router.post('/join_room/:roomId', function (req, res, next) {
    let roomId = req.params.roomId;
    let username = req.body.username;
    if (username !== undefined) {

        if (!roomManager.roomExists(roomId)) {
            res.status(404).send("Room does not exist");


            res.send({'validRoom': false});
            return;
        }

        if (!req.session.userId) {
            req.session.userId = userManager.getUnusedId();
            userManager.createUser(req.session.userId, username);
        }
        req.session.roomId = roomId;


        roomManager.addUserToRoom(roomId, userManager.getUser(req.session.userId));

        console.log(username + " has joined a room with id: " + roomId);
        res.send({'roomId': roomId, 'validRoom': true});
    } else {
        res.send({'validRoom': false});
    }
});

router.post('/check_room/:roomId', function (req, res, next) {
    let roomId = req.params.roomId;
    if (roomManager.roomExists(roomId)) {
        res.send({'validRoom': true});
    }else{
        res.send({'validRoom': false});
    }
});

router.post('/add_video/', function (req, res, next) {

    let videoLink = req.body.videoLink;
    let userId = req.session.userId;
    let roomId = req.body.roomId;

    try {

        videoLink = videoLink.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)[6];
        videoLink = "https://www.youtube.com/watch?v=" + videoLink;


        res.send({'validVideo': true});

        axios.get("https://noembed.com/embed?url=" + videoLink).then(response => {
            let videoTitle: string = response.data.title;
            let videoThumbnail: string = response.data.thumbnail_url.replace("hqdefault", "mqdefault");
            let videoUser = userManager.getUser(userId);

            const room = roomManager.getRoom(roomId);
            let video = {
                'videoLink': videoLink,
                'videoTitle': videoTitle,
                'videoThumbnail': videoThumbnail,
                'videoUsername': videoUser.username
            };

            room.addVideo(video);


            const io = require('../../index');

            if (room.videoList.length == 1) {
                io.to(roomId).emit("video:nextVideo", {'videoLink': videoLink});
            }

            io.to(roomId).emit("video:videoList", {'videoList': room.videoList});
        });
    } catch (e) {
        res.send({'validVideo': false});
        return;
    }
});

module.exports = router;