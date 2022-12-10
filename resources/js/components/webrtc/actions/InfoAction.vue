<template>
  <span></span>
</template>

<script>
export default {
  name: "InfoAction",
  props: ['webrtc'],
  data() {
    return {
      action: {
        name: 'info',
        moderator: true,
        users: [],
        attributes: {

        }
      }
    }
  },
  methods: {
    run(room, data) {
      let action = Object.assign({}, this.action);
      this.webrtc.runAction(room.id, action);
    }
  }
}
</script>
