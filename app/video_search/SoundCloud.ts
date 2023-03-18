// @ts-ignore
import ScSearcher from 'sc-searcher';
import {VideoPlatformSearch, VideoPlatformSearchResult} from "./VideoSearchController";

const scSearch = new ScSearcher();
const client_id = process.env.SOUNDCLOUD_CLIENT_ID;
const result_limit = 10;
scSearch.init(client_id);

export class SoundCloudSearch implements VideoPlatformSearch {
    search(search: string): Promise<VideoPlatformSearchResult[]> {
        return new Promise<VideoPlatformSearchResult[]>((resolve, reject) => {
            scSearch.getTracks(search, result_limit).then((response: any) => {
                const videos: VideoPlatformSearchResult[] = [];
                console.log(response);
            });
        });
    }
}