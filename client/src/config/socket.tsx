import {API_URL} from "./url";

const io = require("socket.io-client");
const socket = io(API_URL, {
    withCredentials: true,
});

export {socket};