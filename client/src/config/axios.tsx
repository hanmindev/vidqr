import axios from "axios";
import {API_URL} from "./url";

const aFetch = axios.create({
    withCredentials: true,
    // headers: {
    //     "vidqr-header": "1.0"
    // },
    baseURL: API_URL
})

export default aFetch;