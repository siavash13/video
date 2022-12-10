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
      console.log('run terminate action');
      this.action.attributes = Object.assign(this.action.attributes, data);
      this.webrtc.runAction(room.id, this.action);
    }
  }
}
</script>
