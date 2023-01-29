import {UserManager} from "../modules/users/user";
import {RoomManager} from "../modules/rooms/room";
import {default as axios} from "axios";
import VideoController from "../controllers/VideoController";
import VideoSearchController from "../controllers/VideoSearchController";




var express = require('express');
var router = express.Router();

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

router.post('/get_username/:roomId', function (req: any, res: any) {
    if (req.session.userId) {
        let username = userManager.getUser(req.session.userId).username;
        res.send({'username': username});
    } else {
        res.send({'username': undefined});
    }
    req.session.userId = userManager.getUnusedId();
});

router.post('/join_room/:roomId', function (req: any, res: any) {
    let roomId = req.params.roomId;
    let username = req.body.username;
    if (username !== undefined) {
        username = username.trim();
        if (username.length > 16) {
            username = username.substring(0, 16);
        }
        if (username.length === 0) {
            username = userManager.getRandomName();
        }

        if (!roomManager.roomExists(roomId)) {
            res.send({'username': username, 'validRoom': false});
            return;
        }

        if (roomManager.getRoom(roomId).usernameExists(username)) {
            res.send({'username': undefined, 'validRoom': true});
            return;
        }

        if (!req.session.userId) {
            req.session.userId = userManager.getUnusedId();
            userManager.createUser(req.session.userId, username);
        }
        req.session.roomId = roomId;


        roomManager.addUserToRoom(roomId, userManager.getUser(req.session.userId));

        console.log(username + " has joined a room with id: " + roomId);
        res.send({'roomId': roomId, 'username': username, 'validRoom': true});
    } else {
        res.send({'validRoom': false});
    }
});

router.post('/check_room/:roomId', function (req: any, res: any) {
    let roomId = req.params.roomId;
    if (roomManager.roomExists(roomId)) {
        res.send({'validRoom': true});
    }else{
        res.send({'validRoom': false});
    }
});

router.post('/add_video/', function (req: any, res: any) {

    let videoLink = req.body.videoLink;
    let userId = req.session.userId;
    let roomId = req.body.roomId;

    try {

        videoLink = videoLink.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?(youtube(-nocookie)?\.com|youtu.be)(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)[6];
        videoLink = "https://www.youtube.com/watch?v=" + videoLink;



        axios.get("https://noembed.com/embed?url=" + videoLink).then(response => {
            if (response.data.error) {
                res.send({'validVideo': false});
                return;
            }

            try {
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

                VideoController.getInstance().updateVideoList(roomId, room.videoList.length == 1);
                res.send({'validVideo': true});
            } catch (e) {

                res.send({'validVideo': false});
                return;
            }
        });
    } catch (e) {
        res.send({'validVideo': false});
        return;
    }
});


interface Video {
    title: string;
    thumbnailLink: string;
    channelName: string;
    videoLink: string;
}
router.post('/search/', function (req: any, res: any) {
    let roomId = req.session.roomId;
    if (roomManager.roomExists(roomId)) {
        const videoPlatform = req.body.videoPlatform;
        const query = req.body.query;
        VideoSearchController.getInstance().search(videoPlatform, query).then((response: any) => {
            const videos: Video[] = [];
            for (let i = 0; i < response.length; i++) {
                let title = response[i].title;
                let videoLink = response[i].url;

                let thumbnailLink = "";
                let channelName = "";

                try {
                    thumbnailLink = response[i].snippet.thumbnails.high.url;
                }
                catch (e) {
                    thumbnailLink = "";
                }

                const video = {title: title, thumbnailLink: thumbnailLink, channelName: channelName, videoLink: videoLink};
                videos.push(video);
            }
            res.send(videos);
            // res.send(response);
        });


        // res.send({'validRoom': true});
    }else{
        res.send({'validRoom': false});
    }
});

module.exports = router;