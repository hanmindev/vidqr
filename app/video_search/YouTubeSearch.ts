import * as yt from "youtube-search-without-api-key";
import {VideoPlatformSearch, VideoPlatformSearchResult} from "./VideoSearchController";

export class YouTubeSearch implements VideoPlatformSearch {
    search(search: string): Promise<VideoPlatformSearchResult[]> {

        return new Promise<VideoPlatformSearchResult[]>((resolve, reject) => {
                yt.search(search).then((response: any) => {
                    const videos: VideoPlatformSearchResult[] = [];
                    for (let i = 0; i < response.length; i++) {
                        let title = response[i].title;
                        let videoLink = response[i].url;

                        let thumbnailLink = "";
                        let channelName = "";

                        try {
                            thumbnailLink = response[i].snippet.thumbnails.high.url;
                        } catch (e) {
                        }

                        try {
                            channelName = response[i].snippet.channelTitle;
                        } catch (e) {
                        }

                        videos.push({
                            title: title,
                            url: videoLink,
                            thumbnail: thumbnailLink,
                            channelName: channelName
                        });
                    }
                    resolve(videos);
                }).catch((error: any) => {
                    reject(error);
                });
            }
        );
    }
}