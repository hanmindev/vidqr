import {YouTubeFormat} from "./YouTubeFormat";
import {SoundCloudFormat} from "./SoundCloudFormat";

export interface VideoFormatSearch {
    format: (url: string) => Promise<VideoFormatResult>;

}

export interface VideoFormatResult {
    title: string;
    url: string;
    thumbnail: string;
}

class VideoFormatter {
    private static _instance: VideoFormatter;
    private _platforms: Map<string, VideoFormatSearch>;

    private constructor() {
        this._platforms = new Map<string, VideoFormatSearch>();
        this._platforms.set("youtube", new YouTubeFormat());
        this._platforms.set("soundcloud", new SoundCloudFormat());
    }

    public static getInstance(): VideoFormatter {
        if (VideoFormatter._instance == null) {
            VideoFormatter._instance = new VideoFormatter();
        }

        return VideoFormatter._instance;
    }

    public format(platform: string, search: string): Promise<VideoFormatResult> {
        const platformSearch = this._platforms.get(platform);
        if (platformSearch == undefined) {
            throw new Error("Platform not found");
        } else {
            return platformSearch.format(search);
        }

    }
}

export default VideoFormatter;