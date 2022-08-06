<template>
  <div>
    <p>Video Conference Test</p>
    <VideoConference/>
    <Rooms />
  </div>
</template>

<script>
import Rooms from "./components/webrtc/Rooms";
import VideoConference from "./components/webrtc/VideoConference";
import {inject} from "vue";

export default {
  components: {
    Rooms,
    VideoConference,
  }
}
</script>

