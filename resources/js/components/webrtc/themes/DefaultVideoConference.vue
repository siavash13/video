<template>
  <div>
    <div>
      <a href="#" @click.prevent="leftTheRoom">Left Room</a>
    </div>
    <div class="room-actions">
      <a
          v-if="userSettings.isCreator"
          class="action-item"
          @click.prevent="runAction('terminate')"
      >
        (Terminate)
      </a>
      <a
          class="action-item"
          @click.prevent="runAction('info')"
      >
        (Info Log)
      </a>
    </div>
    <div
        id="video-conference-users"
        :class="{ 'two-user-joined': (connections.length <= 1), 'multi-user-joined': (connections.length > 1)}"
    >
      <div
          :class="{ 'room-creator': userSettings.isCreator , 'room-user': !userSettings.isCreator }"
      >
        <div class="room-item">
          <div class="user-actions"></div>
          <div class="user-video">
            <video class="video-content video-item"></video>
          </div>
        </div>
      </div>

      <div
          v-for="(connection, index) in connections"
          :key="'connection_' + index"
          :class="{ 'room-creator': connection.isCreator , 'room-user': !connection.isCreator }"
      >
        <div class="room-item">
          <div class="user-name" v-text="connection.name"></div>
          <div class="user-actions">
            <a
                v-if="userSettings.isCreator"
                class="ban-user"
                @click.prevent="runAction('ban', {
                peerJsId: connection.peerJsId
              })"
            >
              (Ban)
            </a>
            <a
                class="alert-user"
                @click.prevent="runAction('alert', {
                peerJsId: connection.peerJsId
              })"
            >
              (Alert)
            </a>
            <a
                v-if="userSettings.isCreator"
                @click.prevent="runAction('multi', {
                peerJsId: connection.peerJsId
              })"
            >
              (Ban in 5 sec)
            </a>
          </div>
          <div class="user-video">
            <video v-show="connection.active" class="peer-content video-item"></video>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "DefaultVideoConference",
  props: ['connections', 'userSettings'],
  data() {
    return {}
  },
  methods: {
    leftTheRoom() {
      this.$emit('onLeftRoom');
    },
    runAction(name, data = {}) {
      this.$emit('onRunAction', {
        name: name,
        data: data
      });
    }
  }
}
</script>

<style lang="scss">
#video-conference-users {
  display: flex;
  flex-wrap: wrap;
  width: 100%;

  @media (min-width: 960px) {
    width: 60%;
    margin: auto;
  }

  &.two-user-joined {
    flex-wrap: nowrap;

    .room-creator {
      width: 50%;
      order: 1;
    }

    .room-user {
      width: 50%;
      order: 2;
    }

    @media (max-width: 768px) {
      .room-creator,
      .room-user {
        width: 50%;
      }
    }
  }

  &.multi-user-joined {
    .room-creator {
      width: 100%;
      order: 1;
      padding: 10px;

      .room-item {
        width: 500px;
      }
    }

    .room-user {
      display: inline-block;
      width: 150px;
      order: 2;
      padding: 10px;

      .room-item {
        height: 150px;
      }
    }
  }


  .room-item {
    position: relative;
    padding: 15px;

    .user-name {
      position: absolute;
      z-index: 2;
      left: 15px;
      bottom: 15px;
      display: inline-block;
      color: #fff;
      padding: 5px 10px;
      overflow: hidden;
      border-bottom-left-radius: 8px;

      &:before {
        content: ' ';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: 0.6;
        background: #000;
      }
    }

    .user-actions {
      min-height: 20px;
    }

    .user-video {
      position: relative;
      width: 100%;
      padding-bottom: 100%;

      video {
        position: absolute;
        z-index: 1;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: cover;
      }
    }
  }
}

.action-item {
  cursor: pointer;
}
</style>
