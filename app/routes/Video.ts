import express from 'express';
import {RoomManager} from "../modules/rooms/room";
import VideoController from "../controllers/VideoController";
import {default as axios} from "axios";
import VideoSearchController, {VideoPlatformSearchResult} from "../video_search/VideoSearchController";
import {UserManager} from "../modules/users/user";

const router = express.Router();

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
    });
});

module.exports = router;