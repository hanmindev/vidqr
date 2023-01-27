import axios from "axios";
import {API_URL} from "./url";

const aFetch = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

export default aFetch;