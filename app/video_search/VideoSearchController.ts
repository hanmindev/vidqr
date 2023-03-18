import {YouTubeSearch} from "./YouTube";
import {SoundCloudSearch} from "./SoundCloud";

export interface VideoPlatformSearch {
    search: (search: string) => Promise<VideoPlatformSearchResult[]>;

}

export interface VideoPlatformSearchResult {
    title: string;
    url: string;
    thumbnail: string;
    channelName: string;
}

class VideoSearchController {
    private static _instance: VideoSearchController;
    private _platforms: Map<string, VideoPlatformSearch>;

    private constructor() {
        this._platforms = new Map<string, VideoPlatformSearch>();
        this._platforms.set("youtube", new YouTubeSearch());
        this._platforms.set("soundcloud", new SoundCloudSearch());
    }

    public static getInstance(): VideoSearchController {
        if (VideoSearchController._instance == null) {
            VideoSearchController._instance = new VideoSearchController();
        }

        return VideoSearchController._instance;
    }

    public search(platform: string, search: string): Promise<VideoPlatformSearchResult[]> {
        const platformSearch = this._platforms.get(platform);
        if (platformSearch == undefined) {
            throw new Error("Platform not found");
        } else {
            return platformSearch.search(search);
        }

    }
}

export default VideoSearchController;