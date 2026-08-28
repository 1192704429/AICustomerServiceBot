import request from '@/utils/request'

export function clientLogin(data) {
  return request({
    url: '/client/login',
    method: 'post',
    data,
    authType: 'client'
  })
}

export function clientRegister(data) {
  return request({
    url: '/client/register',
    method: 'post',
    data,
    authType: 'client'
  })
}

export function clientGetInfo() {
  return request({
    url: '/client/user/info',
    method: 'get',
    authType: 'client'
  })
}

export function clientUpdateInfo(data) {
  return request({
    url: '/client/user/update',
    method: 'post',
    data,
    authType: 'client'
  })
}

export function clientUpdatePassword(data) {
  return request({
    url: '/client/user/password',
    method: 'post',
    data,
    authType: 'client'
  })
}

export function clientLogout() {
  return request({
    url: '/client/logout',
    method: 'post',
    authType: 'client'
  })
}
