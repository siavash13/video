<template>
  <div>
    <p>Video Conference Test</p>
    <Rooms/>
  </div>
</template>

<script>
import Rooms from "./components/webrtc/Rooms";
import VideoConference from "./components/webrtc/VideoConference";
import {inject} from "vue";

export default {
  components: {
    Rooms,
  }
}
</script>

<style lang="scss">

</style>
