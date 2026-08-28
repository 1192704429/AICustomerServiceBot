import request from '@/utils/request'

export function getStatisticsOverview(params) {
  return request({
    url: '/statistics/overview',
    method: 'get',
    params
  })
}
