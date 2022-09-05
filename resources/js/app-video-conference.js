import { createApp } from "vue";

import WebRTC from './utils/WebRTC/WebRTC'

import App from "./App-video-conference.vue";

const app = createApp(App);

app.provide('webrtc', WebRTC).mount("#app");
