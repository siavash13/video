<template>
<div id="videoConferenceActions">
  <BanAction
    ref="actions[ban]"
    :webrtc="webrtc"
  />

  <TerminateAction
    ref="actions[terminate]"
    :webrtc="webrtc"
  />

  <InfoAction
    ref="actions[info]"
    :webrtc="webrtc"
  />

  <AlertAction
    ref="actions[alert]"
    :webrtc="webrtc"
  />

  <MultiAction
    ref="actions[multi]"
    :webrtc="webrtc"
  />

  <CanvastextAction
    ref="actions[canvastext]"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <FaceApiAction
    ref="actions[faceapi]"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

</div>
</template>

<script>
import InfoAction from "./actions/InfoAction";
import BanAction from "./actions/BanAction";
import TerminateAction from "./actions/TerminateAction";
import AlertAction from "./actions/AlertAction";
import MultiAction from "./actions/MultiAction";
import CanvastextAction from "./actions/CanvastextAction";
import FaceApiAction from "./actions/FaceApiAction";

export default {
  name: "VideoConferenceActions",
  props: ['room', 'webrtc', 'connections', 'userSettings'],
  methods: {
    runAction(action) {
      const actionRefName = 'actions[' + action.name + ']';
      this.$refs[actionRefName].run(this.room, action.data || {});
    },
  },
  components: {
    InfoAction,
    BanAction,
    TerminateAction,
    AlertAction,
    MultiAction,
    CanvastextAction,
    FaceApiAction,
  }
}
</script>

<style lang="scss">
#videoConferenceActions {
  position: fixed;
  z-index: 99999;
  width: 100%;
  height: 100vh;
}
</style>
