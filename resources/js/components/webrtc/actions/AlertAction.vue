<template>
  <div id="alert-action" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="alert-action-box">
      <textarea
        rows="5"
        v-model="text"
      ></textarea>
      <button :disabled="!text" @click="sendAlert">Send</button>
    </div>
    <div class="alert-action-back" @click="show(false)"></div>
  </div>
</template>

<script>
export default {
  name: "AlertAction",
  props: ['webrtc'],
  data() {
    return {
      text: null,
      dialog: false,
      room: null,
      actionData: null,
      action: {
        name: 'alert',
        moderator: false,
        users: [],
        attributes: {

        }
      }
    }
  },
  methods: {
    show(status = true) {
      this.dialog = status;

      if(!status) {
        this.text = null;
        this.room = null;
        this.actionData = null;
      }
    },
    run(room, data) {
      this.room = room;
      this.actionData = data;
      this.show();
    },
    sendAlert() {
      let action = Object.assign({}, this.action);
      action.attributes.message = this.text;
      action.users.push({
        peerJsId: this.actionData.peerJsId
      });

      this.webrtc.runAction(this.room.id, action);
      this.show(false);
    }
  }
}
</script>

<style lang="scss">
#alert-action {

  .alert-action-box {
    position: fixed;
    z-index: 2;
    top: 50%;
    left: 50%;
    width: 350px;
    padding: 10px;
    background: #fff;
    border: 1px solid #ccc;
    transform: translate(-50%, -50%);

    textarea, button {
      width: 100%;
    }
  }

  .alert-action-back {
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.6;
  }
}
</style>
