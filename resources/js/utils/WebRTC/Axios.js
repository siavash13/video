import axios from 'axios'
import configs from '../../configs/webrtc'

import store from '../../store'

const apiClient = {}

apiClient.getInstance = (baseUrl = configs.webrtc_url, customConfigs = {}) => {
  const client = axios.create(Object.assign({
    baseURL: baseUrl,
    withCredentials: false,
    crossDomain: true,
    headers: Object.assign({
      "Accept": "application/json",
      "Content-type": "application/json",
    }, configs.axios.headers),
  }, customConfigs))

  client.interceptors.request.use(async (request) => {
    const isLoggedIn = store.getters["user/isLoggedIn"];

    if (isLoggedIn) {
      request.headers.common.Authorization = `Bearer ${store.getters["user/getToken"]}`;
    }

    return request
  })

  client.defaults.validateStatus = (status) => {
    // validate response status
    return true
  }

  return client
}

export default apiClient
