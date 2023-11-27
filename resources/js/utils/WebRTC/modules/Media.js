const faceDetection = require('./MediapipeFaceDetect')();
const bodySegmentation = require('./MediapipeBodySegment')();

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

/**
 * Draw video frame image on canvas
 */
const drawVideoOnCanvas = async (video, canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

/**
 * Flip horizontal canvas frame image
 */
const flipVideoImage = async (canvas) => {
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(canvas, canvas.width * -1, 0, canvas.width, canvas.height);
  ctx.restore();
}

module.exports = () => {

  const Media = {
    parent: null,
    devices: null,
    userMedia: null,
    options: null,
    canvas: null,
    video: null,
    interval: null,
    process: false,
    bodySegmenter: null,
    faceDetector: null,
  };

  Media.setup = (parent, options) => {
    this.parent = parent;
    this.events = {
      play: [],
    };
    this.devices = null;
    this.userMedia = null;
    this.options = options;
    this.canvas = document.createElement('canvas');
    this.video = document.createElement('video');

    this.canvas.width = "640";
    this.canvas.height = "480";
    this.video.width = "640";
    this.video.height = "480";

    this.bodySegmenter = {
      segmenter: null,
      blur: 0,
    };

    this.faceDetector = {
      detector: null,
      detect: false,
      positions: null,
      callbacks: []
    };

    bodySegmentation.initial(this.parent.configs).then(segmenter => {
      this.bodySegmenter.segmenter = segmenter;

      faceDetection.initial(this.parent.configs).then(detector => {
        this.faceDetector.detector = detector;
      });
    });
  }

  /**
   * Grab User Media
   */
  Media.grab = (devices, muteVideo = false, muteAudio = false) => {
    return new Promise(async (resolve, reject) => {
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

        clearInterval(this.interval);

        if (this.parent.userSettings.camDisable) {
          media.addTrack(createEmptyVideoTrack({ width:640, height:480 }));
        }

        if (this.parent.userSettings.micDisable) {
          media.addTrack(createEmptyAudioTrack());
        }

        this.video.srcObject = media;
        this.video.muted = true;
        this.video.play();

        const audioTrack = media.getAudioTracks()[0];

        this.video.addEventListener('loadeddata', () => {
          this.process = false;
          this.interval = setInterval(Media.processOnMedia, 1000 / this.parent.configs.mediapipe.fps);
        });

        const processedMedia = this.canvas.captureStream();
        processedMedia.addTrack(audioTrack);

        Media.userMedia = processedMedia;

        resolve(processedMedia);
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

  Media.processOnMedia = async () => {
    if (this.process) return;

    this.process = true;

    await drawVideoOnCanvas(this.video, this.canvas);

    if(!this.parent.userSettings.camDisable) {
      await flipVideoImage(this.canvas);

      if (this.bodySegmenter.blur > 0) {
        await bodySegmentation.blur(this.bodySegmenter, this.canvas);
      }

      if (this.faceDetector && this.faceDetector.callbacks.length > 0) {
        const index =  this.faceDetector.callbacks.findIndex(x => x.enable);

        if (index > -1) {
          await faceDetection.detect(this.faceDetector, this.canvas);

          this.faceDetector.callbacks.forEach(item => {
            if(!item.enable || this.faceDetector.positions.length === 0) return;
            item.callback(this.faceDetector.positions[0].box, this.canvas, item.name);
          });
        }
      }
    }

    this.process = false;
  }

  Media.blurBackground = (status = true) => {
    this.bodySegmenter.blur = (!status)? 0 : 20;
  }

  /**
   * Mediapipe face detection callback actions register
   */
  Media.registerFaceDetectorCallback = (name, callback) => {
    let index = this.faceDetector.callbacks.findIndex(x => x.name === name);

    if (index > 0) {
      this.faceDetector.callbacks[index]['callback'] = callback;
    } else {
      index = this.faceDetector.callbacks.push({
        name: name,
        enable: false,
        callback: callback
      }) - 1;
    }

    return this.faceDetector.callbacks[index];
  }

  /**
   * Release User Media
   */
  Media.release = () => {
    let videoRef = document.getElementById(this.options.localVideoRef);

    if (videoRef) {
      let srcObject = videoRef.srcObject;

      const stream = srcObject;
      const tracks = stream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });

      srcObject = null;
    }

    clearInterval(this.interval);

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
      if(!this.events.play && this.events.play.length > 0) {
        this.events.play.forEach((item) => {
          if(!item.handler) return false;
          item.handler(video);
        });
      }
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
