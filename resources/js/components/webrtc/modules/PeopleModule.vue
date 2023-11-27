<template>
  <div id="people-module" :style="{ 'display': ((dialog)? 'block' : 'none')}">
    <div class="people-module-box">
      <div class="people-section-heading">
        <h3>people</h3>
        <span class="close" @click="show(false)"></span>
      </div>
      <div class="people-section-interface">
        <div class="people" ref="people">
          <div
            v-for="(user, index) in usersMenu"
            :key="index"
            class="user-item"
          >
            <span>{{ user.name }}</span>
            <div v-if="index > 0">
              <svg
                @click="user.openMenu = !user.openMenu"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
                class="dropdown-dots bi bi-three-dots-vertical"
              >
                <path
                  d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
              <div
                ref="dropdown"
                class="dropdown-content"
                :class="{ show: user.openMenu }"
              >
                <ul>
                  <li v-if="isCreator" @click="banUser(user)">Ban user</li>
                  <li v-if="isCreator" @click="banUser5Second(user)">Ban user in 5 seconds</li>
                  <li v-if="isCreator && !user.micMute" @click="muteMic(user)">Mute user microphone</li>
                </ul>
              </div>
            </div>
          </div>
          <div
            v-if="waitingList.length > 0"
            v-show="showWaitList"
            class="waitingList"
          >
            <hr/>
            <div
              v-for="(waiting, index) in waitingList"
              :key="index"
              class="waitingList-item"
            >
              <span>{{ waiting.name }}</span>
              <div>
                <span
                  class="btn"
                  @click="responseWaiting(true, waiting, index)"
                >
                  approve
                </span>
                <span
                  class="btn"
                  @click="responseWaiting(false, waiting, index)"
                >
                  denied
                </span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
    <div class="people-module-back" @click="show(false)"></div>
  </div>
</template>

<script>
import admitAudio from '../../../assets/webrtc/audio/admit.mp3';

export default {
  name: "PeopleModule",
  props: ['webrtc', 'runAction', 'waitingList'],
  created() {
    this.setClickEventListener();
    this.audio = new Audio(admitAudio);
    window.addEventListener('onRequestToAdmit', this.eventHandlerRequestToAdmit);
    window.addEventListener('onCancelForAdmit', this.eventHandlerCancelForAdmit);
  },
  computed: {
    users() {
      this.usersMenu = [{
        name: this.webrtc.options.name + ' (You)',
        peerJsId: this.webrtc.peerJsId,
        openMenu: false,
      }];

      this.webrtc.People.getConnections().forEach((item) => {
        this.usersMenu.push({
          name: item.name,
          peerJsId: item.peerJsId,
          micMute: item.micMute,
          openMenu: false,
        });
      });
    },
    isCreator() {
      return this.webrtc.userSettings.isCreator;
    }
  },
  watch: {
    users(value) {
      let index = value.findIndex(x => x.peerJsId === this.selectedUser);

      if (index < 0) {
        this.selectedUser = null;
      }
    },
  },
  data() {
    return {
      audio: null,
      dialog: false,
      room: null,
      usersMenu: [],
      showWaitList: true,
    }
  },
  methods: {
    show(status = true) {
      this.dialog = status;
      this.webrtc.userSettings.newAdmitRequest = false;
    },
    open(room) {
      this.room = room;
      this.show();
    },
    hideMenu(event) {
      if (!event.target.matches('.dropdown-content') &&
        this.$refs.dropdown &&
        this.$refs.dropdown.length > 0
      ) {
        this.$refs.dropdown.forEach(dropdown => {
          dropdown.classList.remove('show');
        });
      }

      if (event.target.matches('.dropdown-dots')) {
        event.target.parentElement.childNodes.forEach(node => {
          if (node.classList.contains('dropdown-content') && !node.classList.contains('show')) {
            node.classList.add('show');
          }
        })
      }
    },
    setClickEventListener() {
      window.addEventListener('click', this.hideMenu);
    },
    banUser(user) {
      this.runAction('ban', {
        peerJsId: user.peerJsId
      });

      user.openMenu = false;
    },
    banUser5Second(user) {
      this.runAction('multi', {
        peerJsId: user.peerJsId
      });

      user.openMenu = false;
    },
    muteMic(user) {
      this.runAction('muteUserMic', {
        peerJsId: user.peerJsId
      });

      user.openMenu = false;
    },
    responseWaiting(status = false, user, index) {
      this.runAction('admit', {
        status: status,
        roomId: this.room.id,
        peerJsId: user.peerJsId,
      });

      this.showWaitList = false;
      this.webrtc.People.removeFromWaitingList(index);

      this.$nextTick(() => {
        this.showWaitList = true;
      });
    },
    eventHandlerRequestToAdmit() {
      this.audio.play();
      if(!this.dialog) {
        this.webrtc.userSettings.newAdmitRequest = true;
      }
    },
    eventHandlerCancelForAdmit() {
      if(this.waitingList.length === 0) {
        this.webrtc.userSettings.newAdmitRequest = false;
      }
    }
  },
  unmounted() {
    window.removeEventListener('click', this.hideMenu);
    window.removeEventListener('onRequestToAdmit', this.eventHandlerRequestToAdmit);
    window.removeEventListener('onCancelForAdmit', this.eventHandlerCancelForAdmit);
  }
}
</script>

<style lang="scss">
#people-module {
  .people-section-heading {
    padding: 10px;
  }

  .people-section-interface {
    display: flex;
    flex: auto;
    flex-direction: column;
    justify-content: space-between;
    overflow: auto;
    padding: 10px;

    .people {
      .user-item {
        display: flex;
        justify-content: space-between;
        position: relative;

        .dropdown-dots {
          cursor: pointer;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background-color: #f9f9f9;
          min-width: 160px;
          overflow: auto;
          padding: 10px;
          box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
          z-index: 1;

          &.show {
            display: block;
          }

          li {
            cursor: pointer;
          }
        }
      }

      .waitingList {
        margin-top: 15px;

        .waitingList-item {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;

          .btn {
            font-size: 0.9em;
            padding: 5px 10px;
            margin: 0 2px;
          }
        }
      }
    }
  }

  .people-module-box {
    position: fixed;
    flex-direction: column;
    display: flex;
    z-index: 999999;
    top: 0;
    right: 0;
    width: 350px;
    height: 100vh;
    background: #fff;
    border: 1px solid #ccc;
  }

  .people-module-back {
    position: fixed;
    z-index: 999998;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #000;
    opacity: 0.6;
  }
}
</style>
