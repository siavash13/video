export default {
  created() {
    let data = JSON.parse(localStorage.getItem(this.webrtcStorageKey));
    if(!!data) {
      this.webrtcToken = data;
    }
  },
  data() {
    return {
      webrtcStorageKey: 'cnidus.videoconference.user.token',
      webrtcToken: {
        token: null,
        expired: null,
      }
    }
  },
  methods: {
    async webrtcGetUserToken(next) {
      if (!this.webrtcToken || !this.webrtcToken.token || this.webrtcToken.expired < Date.now()) {
        await this.webrtcReGenerateUserToken();
      }
      next(this.webrtcToken.token);
    },
    async webrtcForceGetUserToken(next) {
      await this.webrtcReGenerateUserToken();
      next(this.webrtcToken.token);
    },
    async webrtcReGenerateUserToken() {
      return new Promise((resolve, reject) => {
        axios.get('/videoconference/userToken').then(response => {
          this.webrtcToken.token = response.data.data.token;
          this.webrtcToken.expired = Date.now() + (12 * 60 * 60 * 1000);
          localStorage.setItem(this.webrtcStorageKey, JSON.stringify(this.webrtcToken));
          resolve(true);
        }, error => {

          reject('Error happened! ' + error.response.data.message);
        });
      });
    },
    webrtcRemoveUserToken() {
      localStorage.setItem(this.webrtcStorageKey, JSON.stringify({
        token: null,
        expired: null,
      }));
    },
  }
}
