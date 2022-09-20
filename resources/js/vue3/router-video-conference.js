import { createRouter, createWebHistory } from "vue-router";
import webrtcRoutes from "./webrtc";

let routes = [];

routes = routes.concat(webrtcRoutes);

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router
