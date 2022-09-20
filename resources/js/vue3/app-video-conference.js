import { createApp } from "vue";
import router from "./router";
import WebRTC from './utils/WebRTC/WebRTC'

import App from "./App-video-conference.vue";

const app = createApp(App);

app.use(router).provide('webrtc', WebRTC).mount("#app");
