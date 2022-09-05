import Rooms from "../components/webrtc/Rooms";

export default [
    {
        path: "/webrtc/rooms",
        name: "rooms",
        component: Rooms,
        meta: {
            authentication: true,
        }
    },
];
