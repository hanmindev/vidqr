import {RoomManager} from "../rooms/room";
import {UserManager} from "../users/user";

const TIMEOUT = 1000 * 10 * 60 * 60 * 24;

const roomManager = RoomManager.getInstance();
const userManager = UserManager.getInstance();
function clearMemoryLoop() {
    console.log("Clear memory loop");
    roomManager.clearUnusedRooms();
    userManager.clearUnusedUsers();

    setTimeout(() => clearMemoryLoop(), TIMEOUT
    );
}


export default clearMemoryLoop;
export {TIMEOUT};