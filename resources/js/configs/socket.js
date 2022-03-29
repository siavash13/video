export default {
  "connection_terminate": (process.env.MIX_SOCKET_CONNECTION_TERMINATE === 'true') || false,
  "webrtc_url": process.env.MIX_WEBRTC_SOCKET_CONNECTION || 'http://localhost:5000',
}
