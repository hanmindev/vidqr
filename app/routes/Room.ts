import express from 'express';
import {RoomManager} from "../modules/rooms/room";
import VideoController from "../controllers/VideoController";
import {default as axios} from "axios";
import VideoSearchController, {VideoPlatformSearchResult} from "../video_search/VideoSearchController";
import {UserManager} from "../modules/users/user";

const router = express.Router();



const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();

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

        roomManager.createRoom(roomId, roomName, req.session.id);


        console.log("A host has made a room with id: " + roomId);
        res.send({'roomId': roomId});
    } else {
        res.send({'roomId': null});
    }
});

router.post('/get_room_info', function (req: any, res: any) {
    let roomId = req.body.roomId;


    const room = roomManager.getRoom(roomId);
    res.send({'roomName': room.roomName, 'host': req.session.id === room.hostId});

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

router.post('/mediaControl/:roomId', function (req: any, res: any) {
    try {
        const roomId = req.params.roomId;
        const action = req.body.action;
        if (action === "play") {
            res.send({'success': VideoController.getInstance().toggleVideo(roomId)});
        } else if (action === "next") {
            res.send({'success': VideoController.getInstance().nextVideo(roomId)});
        } else if (action === "prev") {
            res.send({'success': VideoController.getInstance().prevVideo(roomId)});
        } else if (action === "raise") {
            res.send({'success': VideoController.getInstance().raiseVideo(roomId, req.body.index)});
        } else if (action === "lower") {
            res.send({'success': VideoController.getInstance().raiseVideo(roomId, req.body.index + 1)});
        } else if (action === "delete") {
            res.send({'success': VideoController.getInstance().deleteVideo(roomId, req.body.index)});
        } else if (action === "moveTo") {
            res.send({'success': VideoController.getInstance().moveTo(roomId, req.body.index, req.body.to)});
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

    let videoLink = req.body.videoLink;
    let userId = req.session.id;
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
                    'videoUsername': videoUser.getUsername(roomId) || "Unknown User"
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
    const videoPlatform = req.body.videoPlatform;
    const query = req.body.query;
    VideoSearchController.getInstance().search(videoPlatform, query).then((response: VideoPlatformSearchResult[]) => {
        const videos: Video[] = [];
        for (let i = 0; i < response.length; i++) {
            const title = response[i].title;
            const videoLink = response[i].url;
            const thumbnailLink = response[i].thumbnail;
            const channelName = response[i].channelName;

            const video = {title: title, thumbnailLink: thumbnailLink, channelName: channelName, videoLink: videoLink};
            videos.push(video);
        }
        res.send(videos);
        // res.send(response);
    });
});

module.exports = router;