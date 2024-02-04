<template>
<div id="videoConferenceActions">
  <BanAction
    :ref="(obj) => { setAction('ban', obj) }"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <TerminateAction
    :ref="(obj) => { setAction('terminate', obj) }"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <MultiAction
    :ref="(obj) => { setAction('multi', obj) }"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <CanvasTextAction
    :ref="(obj) => { setAction('canvas-text', obj) }"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <FaceApiAction
    :ref="(obj) => { setAction('face-api', obj) }"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <MuteUserMicAction
    :ref="(obj) => { setAction('mute-user-mic', obj) }"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

  <AdmitAction
    :ref="(obj) => { setAction('admit', obj) }"
    class="action"
    :room="room"
    :webrtc="webrtc"
    :userSettings="userSettings"
  />

</div>
</template>

<script setup>
import { defineProps, defineExpose, ref } from 'vue'

import BanAction from './actions/BanAction.vue'
import TerminateAction from './actions/TerminateAction.vue'
import MultiAction from './actions/MultiAction.vue'
import CanvasTextAction from './actions/CanvasTextAction.vue'
import FaceApiAction from './actions/FaceApiAction.vue'
import MuteUserMicAction from './actions/MuteUserMicAction.vue'
import AdmitAction from './actions/AdmitAction.vue'

const props = defineProps({
  webrtc: {
    type: Object,
    required: true
  },
  room: {
    type: Object,
    required: true
  },
  userSettings: {
    type: Object,
    required: true
  },
  connections: {
    type: Array,
    required: true
  },
})

const actions = ref({})

const setAction = (name, object) => {
  actions.value[name] = object
}

const runAction = (action) => {
  const actionName = props.webrtc.camelToKebab(action.name)
  actions.value[actionName].run(props.room, action.data || {})
}

defineExpose({
  runAction
})
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
