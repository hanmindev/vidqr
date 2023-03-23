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

    public format(search: string): Promise<VideoFormatResult> {
        let platform = undefined;

        if (search.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/) != null) {
            platform = this._platforms.get("soundcloud")?.format(search);
        } else if (search.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?(youtube(-nocookie)?\.com|youtu.be)(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/) != null) {
            platform = this._platforms.get("youtube")?.format(search);
        }

        if (platform == undefined) {
            throw new Error("Platform not found");
        } else {
            return platform
        }

    }
}

export default VideoFormatter;