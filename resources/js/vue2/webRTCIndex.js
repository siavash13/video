import webrtc from "./WebRTC";

export default {
  install (Vue, options = {}) {
    Vue.$webrtc = Vue.prototype.$webrtc = webrtc;
  }
}