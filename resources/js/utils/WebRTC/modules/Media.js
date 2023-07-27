const errors = [
  { name: ['NotFoundError', 'DevicesNotFoundError'], message: 'required track is missing' },
  { name: ['NotReadableError', 'TrackStartError'], message: 'webcam or mic are already in use ' },
  { name: ['OverconstrainedError', 'ConstraintNotSatisfiedError'], message: 'constraints can not be satisfied by avb. devices' },
  { name: ['NotAllowedError', 'PermissionDeniedError'], message: 'permission denied in browser' },
  { name: ['TypeError'], message: 'empty constraints object' },
];

const createEmptyMediaStream = () => {
  return new MediaStream([
    createEmptyAudioTrack(),
    createEmptyVideoTrack({ width:640, height:480 })
  ])
}


const createEmptyAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
}

const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d').fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: false });
};

module.exports = () => {

  const Media = {
    parent: null,
    devices: null,
    userMedia: null,
    options: null,
  };

  Media.setup = (parent, options) => {
    this.parent = parent;
    this.events = {
      play: [],
    };
    this.devices = null;
    this.userMedia = null;
    this.options = options;
  }

  /**
   * Grab User Media
   */
  Media.grab = (devices, muteVideo = false, muteAudio = false) => {
    return new Promise((resolve, reject) => {
      Media.devices = devices;

      let videoParams = (muteVideo)? false : {
        deviceId: {
          exact: devices.camera
        }
      };

      let audioParams = (muteAudio)? false : {
        deviceId: {
          exact: devices.microphone
        }
      };

      if (!videoParams && !audioParams) {
        Media.userMedia = createEmptyMediaStream();
        resolve(Media.userMedia);
      }

      navigator.mediaDevices.getUserMedia({
        video: videoParams,
        audio: audioParams
      }).then(media => {

        if(this.parent.userSettings.camDisable) {
          media.addTrack(createEmptyVideoTrack({ width:640, height:480 }));
        }

        if(this.parent.userSettings.micDisable) {
          media.addTrack(createEmptyAudioTrack());
        }

        Media.userMedia = media;
        resolve(media);
        }).catch(error => {
          let message = null;

          for (const item of errors) {
            if (item.name.includes(error.name)) {
              message = item.message;
              break;
            }
          }

          console.log(error.name);

          reject(message || error.name);
        });
    });
  }

  /**
   * Release User Media
   */
  Media.release = () => {
    let videoRef = document.getElementById(this.options.localVideoRef);
    let srcObject = videoRef.srcObject;

    const stream = srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    srcObject = null;
    Media.userMedia = null;
  }

  /**
   * Set mediaStream video
   */
  Media.streamVideo = (peerJsId, media) => {
    let reference = (!peerJsId)? this.options.localVideoRef : this.options.remoteVideoRef + '-' + peerJsId;
    let video = document.getElementById(reference);

    video.muted = true;
    video.srcObject = media;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });

    video.addEventListener('play', () => {
      Media.events.play.forEach((item) => {
        if(!item.handler) return false;
        item.handler(video);
      });
    });
  }

  /**
   * Set mediaStream audio
   */
  Media.streamAudio = (peerJsId, media) => {
    let reference = this.options.remoteAudioRef + '-' + peerJsId;
    let audio = document.getElementById(reference);

    audio.srcObject = media;
  }

  Media.setEvent = (name = 'none', handler = () => {}, section = 'play') => {
    if (!Media.hasOwnProperty('events')) Media.events = {};
    if (!Media.events.hasOwnProperty(section)) Media.events[section] = [];

    let index = Media.events[section].findIndex(x => x.name === name);
    let item  = {
      name: name,
      handler: handler
    };

    if (index > -1) {
      Media.events[section][index] = item;
    } else {
      Media.events[section].push(item);
    }
  }

  /**
   * Mute user camera to other users
   */
  Media.muteCamera = () => {
    if (this.parent.userSettings.camDisable) {
      Media.terminateConnectionsVideoAudioMedia('video');
    } else {
      Media.restartMedia();
    }
  }

  /**
   * Mute user microphone to other users
   */
  Media.muteMicrophone = () => {
    if (this.parent.userSettings.micDisable) {
      Media.terminateConnectionsVideoAudioMedia('audio');
    } else {
      Media.restartMedia();
    }
  }

  /**
   * Grab new browser media by user settings
   */
  Media.restartMedia = () => {
    let currentMedia = Media.userMedia;

    Media.grab(
      Media.devices,
      this.parent.userSettings.camDisable,
      this.parent.userSettings.micDisable
    ).then((media) => {
      currentMedia.getTracks().forEach(track => {
        track.stop();
      });

      Media.streamVideo(null, Media.userMedia);
      Media.resetConnectionsVideoAudioMedia(media);
    });
  }

  /**
   * Reset joined users peer video audio stream media
   */
  Media.resetConnectionsVideoAudioMedia = (media) => {
    let connections = this.parent.People.getConnections();

    connections.forEach(connection => {
      let senders = connection.mediaConnection.peerConnection.getSenders();

      if (!this.parent.userSettings.camDisable) {
        let camIndex = senders.findIndex(x => x.track && x.track.kind === 'video');

        if (camIndex > -1) {
          senders[camIndex].replaceTrack(media.getVideoTracks()[0]);
        } else {
          connection.mediaConnection.peerConnection.addTrack(media.getVideoTracks()[0]);
        }
      }

      if (!this.parent.userSettings.micDisable) {
        let micIndex = senders.findIndex(x => x.track && x.track.kind === 'audio');

        if (micIndex > -1) {
          senders[micIndex].replaceTrack(media.getAudioTracks()[0]);
        } else {
          connection.mediaConnection.peerConnection.addTrack(media.getAudioTracks()[0]);
        }
      }

      connection.dataConnection.send({
        event: 'muteMedia',
        camMute: this.parent.userSettings.camDisable,
        micMute: this.parent.userSettings.micDisable
      });
    });
  }

  /**
   * Terminate joined user peer video audio stream media by type
   */
  Media.terminateConnectionsVideoAudioMedia = (type = 'video') => {
    let connections = this.parent.People.getConnections();

    Media.userMedia.getTracks().forEach(track => {
      if (track.kind === type) {
        track.stop();
      }
    });

    connections.forEach(connection => {
      connection.dataConnection.send({
        event: 'muteMedia',
        camMute: this.parent.userSettings.camDisable,
        micMute: this.parent.userSettings.micDisable
      });
    });
  }

  Media.setConnectionMediaStatus = (data) => {
    const connections = this.parent.People.getConnections();
    let connection = connections.find(x => x.peerJsId === data.peerJsId);

    if (connection) {
      connection.camMute = data.camMute;
      connection.micMute = data.micMute;
      Media.streamVideo(data.peerJsId, connection.mediaConnection.remoteStream);
      Media.streamAudio(data.peerJsId, connection.mediaConnection.remoteStream);
    }
  }

  return Media;
}
