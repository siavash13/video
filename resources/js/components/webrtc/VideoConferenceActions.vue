<template>
<div>
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
</div>
</template>

<script>
import InfoAction from "./actions/InfoAction";
import BanAction from "./actions/BanAction";
import TerminateAction from "./actions/TerminateAction";
import AlertAction from "./actions/AlertAction";
import MultiAction from "./actions/MultiAction";

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
  }
}
</script>
