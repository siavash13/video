export default {
  "connection_terminate": (process.env.MIX_SOCKET_CONNECTION_TERMINATE === 'true') || false,
  "webrtc_url": process.env.MIX_WEBRTC_SOCKET_CONNECTION || 'http://192.168.2.11:5000',
  "webrtc_app_id": "501",
  "webrtc_app_secret": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImFhZWQxYzIzNzU3ZWQ0MWM0NzIzZjhmYTljYjdlYWEw",
  "peer_host": "192.168.2.11",
  "peer_port": "3003",
}
