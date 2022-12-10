<template>
  <span></span>
</template>

<script>
export default {
  name: "BanAction",
  props: ['webrtc'],
  data() {
    return {
      action: {
        name: 'ban',
        moderator: true,
        users: [],
        attributes: {
          ban: {}
        }
      }
    }
  },
  methods: {
    run(room, data) {
      console.log('run user ban action');
      let action = Object.assign({}, this.action);
      action.attributes.ban = data;
      this.webrtc.runAction(room.id, action);
    }
  }
}
</script>
