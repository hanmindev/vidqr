import {VideoPlatformSearch, VideoPlatformSearchResult} from "./VideoSearchController";
import {default as axios} from "axios";

export class SoundCloudSearch implements VideoPlatformSearch {
    search(search: string): Promise<VideoPlatformSearchResult[]> {
        return new Promise<VideoPlatformSearchResult[]>((resolve, reject) => {
            axios.get(`https://api-v2.soundcloud.com/search/tracks?q=${search.replace(' ', '%20')}&client_id=${process.env.SOUNDCLOUD_ID}&limit=20`).then(
                (response: any) => {
                    const videos: VideoPlatformSearchResult[] = [];

                    const video_raw = response.data.collection;

                    for (let i = 0; i < video_raw.length; i++) {
                        try {
                            let title = video_raw[i].title;
                            let videoLink = video_raw[i].permalink_url;

                            let thumbnailLink = video_raw[i].artwork_url
                            try {
                                thumbnailLink = thumbnailLink.replace('large.jpg', 't500x500.jpg')
                            } catch (e) {
                            }
                            let channelName = "";

                            videos.push({
                                title: title,
                                url: videoLink,
                                thumbnail: thumbnailLink,
                                channelName: channelName
                            });
                        } catch (e) {
                        }
                    }
                    resolve(videos);
                }
            ).catch((error: any) => {
                reject(error);
            });
        });
    }
}