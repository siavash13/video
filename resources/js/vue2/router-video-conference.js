import Vue from 'vue'
import VueRouter from 'vue-router'
import webrtcRoutes from "./webrtc";

Vue.use(VueRouter);

let routes = [];

routes = routes.concat(webrtcRoutes);

const router = new VueRouter({
  linkActiveClass: 'active',
  routes,
  mode: 'history'
});

export default router
