import {VideoFormatResult, VideoFormatSearch} from "./VideoFormatter";
import axios from "axios";

export class YouTubeFormat implements VideoFormatSearch {
    format(url: string): Promise<VideoFormatResult> {
        return new Promise<VideoFormatResult>((resolve, reject) => {
                const videoRegex = url.match(/^((?:https?:)?\/\/)?((?:www|m)\.)?(youtube(-nocookie)?\.com|youtu.be)(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/);
                if (videoRegex == null) {
                    reject("video URL error");
                } else {
                    const videoLink = "https://www.youtube.com/watch?v=" + videoRegex[6];

                    axios.get("https://noembed.com/embed?url=" + videoLink).then(response => {
                        if (response.data.error) {
                            reject("axios error");
                        }

                        let videoTitle: string = response.data.title;
                        let videoThumbnail: string = response.data.thumbnail_url.replace("hqdefault", "mqdefault");
                        resolve({title: videoTitle, url: videoLink, thumbnail: videoThumbnail});
                    })
                }
            }
        )
    }
}