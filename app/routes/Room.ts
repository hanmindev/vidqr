import express from 'express';
import {RoomManager} from "../modules/rooms/room";
import VideoController from "../controllers/VideoController";
import {default as axios} from "axios";
import VideoSearchController from "../controllers/VideoSearchController";

const router = express.Router();



const roomManager = RoomManager.getInstance();


router.post('/rejoin_room', function (req: any, res: any) {
    let roomId;
    if (req.session.roomId) {
        roomId = req.session.roomId;
        console.log("A host has joined a room with id: " + roomId);
    } else {
        roomId = undefined;
    }

    res.send({'roomId': roomId, 'host': roomId !== undefined && roomId===req.session.owner});
});

router.post('/create_room', function (req: any, res: any) {
    let roomId = roomManager.getUnusedId()
    let roomName = req.body.roomName

    if (roomName !== undefined) {
        roomName = roomName.trim();
        if (roomName.length > 16) {
            roomName = roomName.substring(0, 16);
        } else if (roomName.length === 0) {
            roomName = roomManager.getRandomName();
        }

        roomManager.createRoom(roomId, roomName);


        req.session.roomId = roomId;
        req.session.owner = roomId;


        console.log("A host has made a room with id: " + roomId);
        res.send({'roomId': roomId});
    } else {
        res.send({'roomId': null});
    }
});

router.post('/get_room_info', function (req: any, res: any) {
    let roomId = req.body.roomId;
    let roomName;

    try {
        roomName = roomManager.getRoom(roomId).roomName;
    }
    catch (e) {
        roomName = undefined;
    }

    res.send({'roomName': roomName, 'host': roomId===req.session.owner});
});

router.post('/get_current_video/:roomId', function (req: any, res: any) {
    try {
        const roomId = req.params.roomId;
        const room = roomManager.getRoom(roomId);

        if (room === undefined) {
            res.send({'video': []});
            return;
        }

        res.send({'video': room.getCurrentVideo()});
    }catch (e) {
        res.send({'video': []});
    }
});

router.post('/mediaControl/', function (req: any, res: any) {
    try {
        const action = req.body.action;
        if (action === "play") {
            res.send({'success': VideoController.getInstance().toggleVideo(req.session.roomId)});
        } else if (action === "next") {
            res.send({'success': VideoController.getInstance().nextVideo(req.session.roomId)});
        } else if (action === "prev") {
            res.send({'success': VideoController.getInstance().prevVideo(req.session.roomId)});
        } else if (action === "raise") {
            res.send({'success': VideoController.getInstance().raiseVideo(req.session.roomId, req.body.index)});
        } else if (action === "lower") {
            res.send({'success': VideoController.getInstance().raiseVideo(req.session.roomId, req.body.index + 1)});
        } else if (action === "delete") {
            res.send({'success': VideoController.getInstance().deleteVideo(req.session.roomId, req.body.index)});
        } else {
            res.send({'success': false});
        }
    }catch (e) {
        res.send({'success': false});
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
    const userManager = roomManager.getRoom(req.params.roomId).getUserManager();

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