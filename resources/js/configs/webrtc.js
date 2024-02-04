export default {
  debug: process.env.MIX_WEBRTC_DEBUG || false,
  base_utl: process.env.MIX_WEBRTC_BASE_URL || 'http://localhost',
  api_url: process.env.MIX_WEBRTC_API_URL || 'localhost/api',
  api_token_url: process.env.MIX_WEBRTC_TOKEN_URL || 'localhost/api/token',
  webrtc_url: process.env.MIX_WEBRTC_SOCKET_URL || 'http://localhost:5000',
  webrtc_connection: process.env.MIX_WEBRTC_SOCKET_CONNECTION || 'localhost:5000',
  peer_secure: process.env.MIX_PEERJS_SECURE || false,
  peer_host: process.env.MIX_PEERJS_HOST || 'localhost',
  peer_port: process.env.MIX_PEERJS_PORT || '3003',
  videoconference_theme: process.env.MIX_WEBRTC_THEME || 'Canvasface',
  mediapipe: {
    models: {
      'faceDetector': process.env.MIX_WEBRTC_BASE_URL + '/models/face',
      'bodySegmentation': process.env.MIX_WEBRTC_BASE_URL + '/models/selfie'
    },
    fps: 30
  },
  axios: {
    headers: {}
  }
}
