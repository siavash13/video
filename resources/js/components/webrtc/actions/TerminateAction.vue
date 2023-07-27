<template>
  <span></span>
</template>

<script>
export default {
  name: "TerminateAction",
  props: ['webrtc'],
  data() {
    return {
      action: {
        name: 'terminate',
        moderator: true,
        users: [],
        attributes: {

        }
      }
    }
  },
  methods: {
    run(room, data) {
      this.webrtc.runAction(room.id, this.action);
    }
  }
}
</script>
