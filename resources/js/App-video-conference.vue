<template>
  <div>
    <p>Video Conference Test</p>
    <VideoConference/>
  </div>
</template>

<script>
import VideoConference from "./components/webrtc/VideoConference";
import {inject} from "vue";

export default {
  components: {
    VideoConference,
  }
}
</script>

<style lang="scss">

</style>
