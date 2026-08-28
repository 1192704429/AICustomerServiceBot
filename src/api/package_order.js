import request from '@/utils/request'

// 分页查询我的订单列表（current、size 放路径参数，其余放 body）
export function pagePackageOrder(current, size, params) {
  return request({
    url: `/package_order/page?current=${current}&size=${size}`,
    method: 'post',
    data: params
  })
}

// 查询我的订单详情
export function getPackageOrderById(id) {
  return request({
    url: '/package_order/' + id,
    method: 'get'
  })
}

// 新增我的订单
export function savePackageOrder(data) {
  return request({
    url: '/package_order',
    method: 'post',
    data: data
  })
}

// 修改我的订单
export function updatePackageOrder(data) {
  return request({
    url: '/package_order',
    method: 'put',
    data: data
  })
}

// 删除我的订单
export function deletePackageOrder(ids) {
  return request({
    url: '/package_order/' + ids,
    method: 'delete'
  })
}

// 批量删除我的订单
export function deleteBatchPackageOrder(ids) {
  return request({
    url: '/package_order/batch',
    method: 'delete',
    data: ids
  })
}


// 下拉选项：购买企业
export function listEnterpriseInfo(data) {
  return request({
    url: '/enterprise_info/list',
    method: 'post',
    data: data || {}
  })
}

// 下拉选项：购买套餐
export function listRobotPackage(data) {
  return request({
    url: '/robot_package/list',
    method: 'post',
    data: data || {}
  })
}

// 下拉选项：购买用户
export function listSysUser(data) {
  return request({
    url: '/sys_user/list',
    method: 'post',
    data: data || {}
  })
}

// 购买套餐并拉起支付
export function purchasePackage(data) {
  return request({
    url: '/package_order/purchase',
    method: 'post',
    data: data
  })
}

// 已有待支付订单重新拉起支付
export function prepayOrder(data) {
  return request({
    url: '/pay/prepay-order',
    method: 'post',
    data: data
  })
}

// 轮询订单支付状态
export function getPackageOrderPayStatus(orderNo) {
  return request({
    url: `/package_order/pay-status/${orderNo}`,
    method: 'get'
  })
}
