<template>
  <span></span>
</template>

<script>
export default {
  name: "MuteUserMicAction",
  props: ['webrtc'],
  data() {
    return {
      action: {
        name: 'mute-user-mic',
        moderator: true,
        users: [],
        attributes: {}
      }
    }
  },
  methods: {
    run(room, data) {
      let action = Object.assign({}, this.action);

      action.users.push({
        peerJsId: data.peerJsId
      });

      this.webrtc.runAction(room.id, action);
    }
  }
}
</script>
