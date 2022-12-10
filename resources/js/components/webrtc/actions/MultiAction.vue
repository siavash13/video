<template>
  <span></span>
</template>

<script>
export default {
  name: "MultiAction",
  props: ['webrtc'],
  data() {
    return {
    }
  },
  methods: {
    run(room, data) {
      this.webrtc.runAction(room.id, {
        name: 'alert',
        moderator: false,
        users: [{
          peerJsId: data.peerJsId
        }],
        attributes: {
          message: 'You are ban in 5 seconds.'
        }
      });

      setTimeout(() => {
        this.webrtc.runAction(room.id, {
          name: 'ban',
          moderator: true,
          users: [],
          attributes: {
            ban: {
              peerJsId: data.peerJsId
            }
          }
        });
      }, 5000);
    }
  }
}
</script>
