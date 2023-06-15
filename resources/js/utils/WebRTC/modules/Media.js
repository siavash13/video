module.exports = () => {

  const Media = {
    parent: null,
    userMedia: null,
    videoReference: null,
  };

  Media.setup = (parent, reference) => {
    this.parent = parent;
    this.events = {
      play: [],
    };
    this.userMedia = null;
    this.videoReference = reference;
  }

  /**
   * Grab User Media
   */
  Media.grab = () => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(media => {
        Media.userMedia = media;
        resolve(media)
      }).catch(err => {
        reject(err);
      });
    });
  }

  /**
   * Release User Media
   */
  Media.release = () => {
    let videoRef = document.querySelector(this.videoReference);
    let srcObject = videoRef.srcObject;

    const stream = srcObject;
    const tracks = stream.getTracks();

    tracks.forEach((track) => {
      track.stop();
    });

    srcObject = null;
    this.userMedia = null;
  }

  /**
   * Stream Connection Media
   */
  Media.stream = (video, media, mute = false) => {
    video.muted = mute;
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
   * Stream user media
   */
  Media.streamUserMedia = () => {
    let videoRef = document.querySelector(this.videoReference);
    Media.stream(videoRef, Media.userMedia, true);
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

  return Media;
}
