module.exports = () => {

  const Media = {
    parent: null,
    userMedia: null,
    videoReference: null,
  };

  Media.setup = (parent, reference) => {
    this.parent = parent;
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
  }

  return Media;
}
