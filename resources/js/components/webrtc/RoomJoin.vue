<template>
  <div id="room-join">
    <div v-if="!token">
      Wait for user authorization token...
    </div>
    <div v-show="initializeVideo">
      <VideoConference
        ref="conference"
        @onCloseConference="closeConference"
      />
    </div>
  </div>
</template>

<script>
import VideoConference from "./VideoConference";
import webRTCHelper from "@/utils/WebRTC/webRTCHelper";

export default {
  name: "RoomJoin",
  mixins: [webRTCHelper],
  created() {
    this.room.id = this.$route.params.roomId;
  },
  mounted() {
    this.getUserAccessToken();
  },
  data() {
    return {
      initializeVideo: false,
      token: null,
      room: {
        id: null,
      },
      message: {
        status: false,
        text: '',
        color: 'green'
      },
      loading: false,
    }
  },
  methods: {
    getUserAccessToken() {
      this.webrtcGetUserToken((token) => {
        this.token = token;
        this.joinToRoom();
      });
    },
    joinToRoom() {
      this.initializeVideo = true;
      this.$refs.conference.initialize(this.room, this.token);
    },
    closeConference() {
      this.$router.push({ name: 'webrtcRooms'});
    },
  },
  components: {
    VideoConference,
  }
}
</script>

<style lang="scss">
#room-join {
  max-width: 500px;
}
</style>
