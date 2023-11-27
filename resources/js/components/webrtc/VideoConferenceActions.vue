<template>
<div id="videoConferenceActions">
  <BanAction
    ref="actions[ban]"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <TerminateAction
    ref="actions[terminate]"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <MultiAction
    ref="actions[multi]"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <CanvasTextAction
    ref="actions[canvas-text]"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <FaceApiAction
    ref="actions[face-api]"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <MuteUserMicAction
    ref="actions[mute-user-mic]"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <AdmitAction
    ref="actions[admit]"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

</div>
</template>

<script>
import BanAction from "./actions/BanAction";
import TerminateAction from "./actions/TerminateAction";
import MultiAction from "./actions/MultiAction";
import CanvasTextAction from "./actions/CanvasTextAction";
import FaceApiAction from "./actions/FaceApiAction";
import MuteUserMicAction from "./actions/MuteUserMicAction";
import AdmitAction from "./actions/AdmitAction";

export default {
  name: "VideoConferenceActions",
  props: ['room', 'webrtc', 'connections', 'userSettings'],
  methods: {
    runAction(action) {
      const actionName = this.webrtc.camelToKebab(action.name);
      const actionRefName = 'actions[' + actionName + ']';
      this.$refs[actionRefName].run(this.room, action.data || {});
    },
  },
  components: {
    BanAction,
    TerminateAction,
    MultiAction,
    CanvasTextAction,
    FaceApiAction,
    MuteUserMicAction,
    AdmitAction,
  }
}
</script>

<style lang="scss">
#videoConferenceActions {
  width: 100%;

  .action {
    position: absolute;
    z-index: 999998;
  }
}
</style>
