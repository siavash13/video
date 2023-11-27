<template>
  <span></span>
</template>

<script>
export default {
  name: "AdmitAction",
  props: ['webrtc'],
  data() {
    return {
      action: {
        name: 'admit',
        moderator: true,
        users: [],
        attributes: {
          status: false,
          peerJsId: null,
        }
      }
    }
  },
  methods: {
    run(room, data) {
      const action = JSON.parse(JSON.stringify(this.action));

      action.attributes = data;
      action.users.push({
        peerJsId: data.peerJsId,
        status: 'waiting'
      });

      this.webrtc.runAction(room.id, action);
    }
  }
}
</script>
