import {API_URL} from "./url";
const io = require("socket.io-client");
const socket = io(API_URL, {
    withCredentials: true,
    // extraHeaders: {
    //     "vidqr-header": "1.0"
    // }

});

export { socket };