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
