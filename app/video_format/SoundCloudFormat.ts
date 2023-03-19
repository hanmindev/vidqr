import {VideoFormatResult, VideoFormatSearch} from "./VideoFormatter";
import axios from "axios";

export class SoundCloudFormat implements VideoFormatSearch {
    format(url: string): Promise<VideoFormatResult> {
        return new Promise<VideoFormatResult>((resolve, reject) => {
                const videoRegex = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/);
                if (videoRegex == null) {
                    reject("video URL error");
                } else {
                    const videoLink = "https://soundcloud.com/" + videoRegex[3];

                    axios.get("https://noembed.com/embed?url=" + videoLink).then(response => {
                        if (response.data.error) {
                            reject("axios error");
                        }

                        let videoTitle: string = response.data.title;
                        let videoThumbnail: string = response.data.thumbnail_url;
                        resolve({title: videoTitle, url: videoLink, thumbnail: videoThumbnail});
                    })
                }
            }
        )
    }
}