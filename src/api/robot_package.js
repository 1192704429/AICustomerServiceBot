import request from '@/utils/request'

// 分页查询机器人套餐管理列表（current、size 放路径参数，其余放 body）
export function pageRobotPackage(current, size, params) {
  return request({
    url: `/robot_package/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询机器人套餐管理详情
export function getRobotPackageById(id) {
  return request({
    url: '/robot_package/' + id,
    method: 'get'
  })
}

// 新增机器人套餐管理
export function saveRobotPackage(data) {
  return request({
    url: '/robot_package',
    method: 'post',
    data: data
  })
}

// 修改机器人套餐管理
export function updateRobotPackage(data) {
  return request({
    url: '/robot_package',
    method: 'put',
    data: data
  })
}

// 删除机器人套餐管理
export function deleteRobotPackage(ids) {
  return request({
    url: '/robot_package/' + ids,
    method: 'delete'
  })
}

// 批量删除机器人套餐管理
export function deleteBatchRobotPackage(ids) {
  return request({
    url: '/robot_package/batch',
    method: 'delete',
    data: ids
  })
}

// 查询机器人套餐列表（不分页）
export function listRobotPackage(data) {
  return request({
    url: '/robot_package/list',
    method: 'post',
    data: data || {}
  })
}
