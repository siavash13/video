import { createApp } from "vue";
import router from "./router";
import WebRTC from "./utils/WebRTC/WebRTC";

import axios from "axios";
const apiClient = axios.create({
  baseURL: process.env.MIX_VUE_APP_API_URL || '',
  withCredentials: false,
  crossDomain: true,
  headers: {
    "Accept": "application/json",
    "Content-type": "application/json",
  },
});

window.axios = apiClient;


import App from "./App-video-conference.vue";

const app = createApp(App);

app.use(router).provide('webrtc', WebRTC).mount("#app");
