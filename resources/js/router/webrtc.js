import Rooms from "../components/webrtc/Rooms";
import RoomJoin from "../components/webrtc/RoomJoin";

export default [
  {
    path: "/webrtc/rooms",
    name: "webrtcRooms",
    component: Rooms,
  },
  {
    path: "/webrtc/rooms/:roomId/join",
    name: "webrtcJoinRoom",
    component: RoomJoin,
  },
];
