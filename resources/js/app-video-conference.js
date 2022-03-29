require('./bootstrap');

import { createApp } from "vue";

import webrtcSocket from './utils/socket/webRtcSocket'

import App from "./App-video-conference.vue";

const app = createApp(App);

app.provide('webrtc', webrtcSocket).mount("#app");
