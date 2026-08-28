import request from '@/utils/request'

export function listRobotRecommendQuestion(params) {
  return request({
    url: '/robot_recommend_question/list',
    method: 'post',
    data: params || {}
  })
}

export function saveRobotRecommendQuestion(data) {
  return request({
    url: '/robot_recommend_question',
    method: 'post',
    data
  })
}

export function updateRobotRecommendQuestion(data) {
  return request({
    url: '/robot_recommend_question',
    method: 'put',
    data
  })
}

export function deleteRobotRecommendQuestion(id) {
  return request({
    url: '/robot_recommend_question/' + id,
    method: 'delete'
  })
}
