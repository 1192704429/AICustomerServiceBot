import Cookies from 'js-cookie'

const ClientTokenKey = 'intelligent_customer_service_client_token'

export function getClientToken() {
  return Cookies.get(ClientTokenKey)
}

export function setClientToken(token) {
  return Cookies.set(ClientTokenKey, token)
}

export function removeClientToken() {
  return Cookies.remove(ClientTokenKey)
}
