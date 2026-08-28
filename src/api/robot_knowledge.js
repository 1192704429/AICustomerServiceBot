import request from '@/utils/request'

export function listRobotKnowledge(params) {
  return request({
    url: '/robot_knowledge/list',
    method: 'post',
    data: params || {}
  })
}

export function syncRobotKnowledge(data) {
  return request({
    url: '/robot_knowledge/sync',
    method: 'post',
    data
  })
}
