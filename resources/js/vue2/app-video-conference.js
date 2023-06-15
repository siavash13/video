import Vue from 'vue';
import Webrtc from './utils/WebRTC';
import router from './router/router-video-conference'

window.axios = require('axios');

/**
 * Face Detect Plugin
 */
/*
Promise.all([
    window.faceAPI.nets.tinyFaceDetector.loadFromUri('/models'),
    window.faceAPI.nets.faceLandmark68Net.loadFromUri('/models'),
    window.faceAPI.nets.faceExpressionNet.loadFromUri('/models'),
    window.faceAPI.nets.faceRecognitionNet.loadFromUri('/models'),
])
 */

Vue.use(Webrtc);

var vm = new Vue({
  el: '#app',
  router,
});

export default vm;
