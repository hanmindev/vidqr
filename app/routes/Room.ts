import express from 'express';
import {RoomManager} from "../modules/rooms/room";
import VideoController from "../controllers/VideoController";
import {UserManager} from "../modules/users/user";
import VideoFormatter, {VideoFormatResult} from "../video_format/VideoFormatter";

const router = express.Router();


const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();
const videoFormatter = VideoFormatter.getInstance();

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
    } catch (e) {
        res.send({'video': []});
    }
});

router.post('/get_player_info/:roomId', function (req: any, res: any) {
    try {
        const roomId = req.params.roomId;
        const room = roomManager.getRoom(roomId);

        if (room === undefined) {
            res.send({playerState: undefined});
            return;
        }

        res.send({playerState: room.videoPlayerState});
    } catch (e) {
        res.send({playerState: undefined});
    }
});

router.post('/mediaControl/:roomId', function (req: any, res: any) {
    try {
        const roomId = req.params.roomId;
        const action = req.body.action;
        if (action === "next") {
            res.send({'success': VideoController.getInstance().nextVideo(roomId)});
        } else if (action === "prev") {
            res.send({'success': VideoController.getInstance().prevVideo(roomId)});
        } else if (action === "discard") {
            res.send({'success': VideoController.getInstance().nextVideo(roomId)});
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
    } catch (e) {
        res.send({'success': false});
    }
});


router.post('/check_room/:roomId', function (req: any, res: any) {
    let roomId = req.params.roomId;
    if (roomManager.roomExists(roomId)) {
        res.send({'validRoom': true});
    } else {
        res.send({'validRoom': false});
    }
});

router.post('/add_video/', function (req: any, res: any) {

    let videoLink = req.body.videoLink;
    let platform = req.body.videoPlatform;
    let userId = req.session.id;
    let roomId = req.body.roomId;

    try {
        videoFormatter.format(platform, videoLink).then((videoFormatResult: VideoFormatResult) => {
                let videoUser = userManager.getUser(userId);
                const room = roomManager.getRoom(roomId);

                let video = {
                    videoLink: videoFormatResult.url,
                    videoTitle: videoFormatResult.title,
                    videoThumbnail: videoFormatResult.thumbnail,
                    videoUsername: videoUser.getUsername(roomId) || "Unknown User"
                };

                room.addVideo(video);

                VideoController.getInstance().updateVideoList(roomId, room.videoList.length == 1);
                res.send({'validVideo': true});
                return;
            }
        ).catch(() => {
                res.send({'validVideo': false});
                return;
            }
        )
    }
    catch (e) {
        res.send({'validVideo': false});
    }
});

module.exports = router;