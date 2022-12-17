export default {
  "connection_terminate": (process.env.MIX_SOCKET_CONNECTION_TERMINATE === 'true') || false,
  "webrtc_url": process.env.MIX_WEBRTC_SOCKET_CONNECTION || 'http://localhost:5000',
  "peer_host": process.env.MIX_PEERJS_HOST || 'localhost',
  "peer_port": process.env.MIX_PEERJS_PORT || '3003',
  "videoconference_theme": process.env.MIX_WEBRTC_THEME || 'Default',
}
