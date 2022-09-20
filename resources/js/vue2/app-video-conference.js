import Vue from 'vue';
import Webrtc from './utils/WebRTC';
import router from './router/router-video-conference'


Vue.use(Webrtc);

var vm = new Vue({
  el: '#app',
  router,
});

export default vm;
