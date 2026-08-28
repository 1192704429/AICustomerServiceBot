import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* 布局组件 */
import Layout from '@/layout'


/**
 * 常量路由
 * 不需要权限的基础页面
 * 所有角色都可以访问
 */
export const constantRoutes = [
  // 用户相关
  {
    path: '/',
    redirect: '/user/home',
    hidden: true
  },
  {
    path: '/user/login',
    redirect: '/login',
    hidden: true
  },
  {
    path: '/user/register',
    component: () => import('@/views/client/register'),
    hidden: true,
    meta: {
      appType: 'client',
      requiresAuth: false
    }
  },
  // 管理员相关
  {
    // 管理员登录
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    // 管理员首页
    path: '/index',
    component: Layout,
    children: [
      {
        path: '',
        name: '首页',
        component: () => import('@/views/index/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/chat',
    component: () => import('@/views/chat/index'),
    hidden: true,
    meta: { requiresAuth: false }
  },
]

/**
 * 异步路由
 * 需要根据角色动态添加的路由
 */
export const asyncRoutes = [
  // 平台管理员
  {
    path: '/enterpriseManage',
    name: 'EnterpriseManage',
    component: Layout,
    meta: { title: '企业管理', icon: 'el-icon-office-building', roles: ['platform_admin'] },
    redirect: '/enterpriseManage/index',
    children: [{
      path: '/enterpriseManage/index',
      name: 'EnterpriseManageIndex',
      component: () => import('@/views/views/enterpriseManage/index'),
      meta: { title: '企业管理', icon: 'el-icon-office-building', roles: ['platform_admin'] }
    }]
  },
  {
    path: '/accountManage',
    name: 'AccountManage',
    component: Layout,
    meta: { title: '账号管理', icon: 'el-icon-user-solid', roles: ['platform_admin'] },
    redirect: '/platformAdminManage/index',
    children: [{
      path: '/platformAdminManage/index',
      name: 'PlatformAdminManageIndex',
      component: () => import('@/views/views/userManage/index'),
      meta: { title: '平台管理员管理', icon: 'el-icon-s-check', roles: ['platform_admin'] }
    }, {
      path: '/enterpriseUserManage/index',
      name: 'EnterpriseUserManageIndex',
      component: () => import('@/views/views/enterpriseUserManage/index'),
      meta: { title: '企业人员管理', icon: 'el-icon-s-custom', roles: ['platform_admin'] }
    }]
  },
  {
    path: '/robotManage',
    name: 'RobotManage',
    component: Layout,
    meta: { title: '机器人管理', icon: 'el-icon-cpu', roles: ['platform_admin'] },
    redirect: '/robotManage/index',
    children: [{
      path: '/robotManage/index',
      name: 'RobotManageIndex',
      component: () => import('@/views/views/robotManage/index'),
      meta: { title: '机器人管理', icon: 'el-icon-cpu', roles: ['platform_admin'] }
    }]
  },
  {
    path: '/channelManage',
    name: 'ChannelManage',
    component: Layout,
    meta: { title: '渠道管理', icon: 'el-icon-connection', roles: ['platform_admin'] },
    redirect: '/channelManage/index',
    children: [{
      path: '/channelManage/index',
      name: 'ChannelManageIndex',
      component: () => import('@/views/views/channelManage/index'),
      meta: { title: '渠道管理', icon: 'el-icon-connection', roles: ['platform_admin'] }
    }]
  },
  {
    path: '/packageManage',
    name: 'PackageManage',
    component: Layout,
    meta: { title: '套餐管理', icon: 'el-icon-goods', roles: ['platform_admin'] },
    redirect: '/packageManage/index',
    children: [{
      path: '/packageManage/index',
      name: 'PackageManageIndex',
      component: () => import('@/views/views/packageManage/index'),
      meta: { title: '套餐管理', icon: 'el-icon-goods', roles: ['platform_admin'] }
    }]
  },
  // 企业管理员
  {
    path: '/enterprisePersonnelManage',
    name: 'EnterprisePersonnelManage',
    component: Layout,
    meta: { title: '人员管理', icon: 'el-icon-s-custom', roles: ['enterprise_admin'] },
    redirect: '/enterprisePersonnelManage/index',
    children: [{
      path: '/enterprisePersonnelManage/index',
      name: 'EnterprisePersonnelManageIndex',
      component: () => import('@/views/views/enterprisePersonnelManage/index'),
      meta: { title: '人员管理', icon: 'el-icon-s-custom', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/enterpriseRobotManage',
    name: 'EnterpriseRobotManage',
    component: Layout,
    meta: { title: '机器人管理', icon: 'el-icon-cpu', roles: ['enterprise_admin'] },
    redirect: '/enterpriseRobotManage/index',
    children: [{
      path: '/enterpriseRobotManage/index',
      name: 'EnterpriseRobotManageIndex',
      component: () => import('@/views/views/enterpriseRobotManage/index'),
      meta: { title: '机器人管理', icon: 'el-icon-cpu', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/enterpriseKnowledgeManage',
    name: 'EnterpriseKnowledgeManage',
    component: Layout,
    meta: { title: '知识库管理', icon: 'el-icon-notebook-2', roles: ['enterprise_admin'] },
    redirect: '/enterpriseKnowledgeManage/index',
    children: [{
      path: '/enterpriseKnowledgeManage/index',
      name: 'EnterpriseKnowledgeManageIndex',
      component: () => import('@/views/knowledgeManagement/index'),
      meta: { title: '知识库管理', icon: 'el-icon-notebook-2', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/enterpriseChannelManage',
    name: 'EnterpriseChannelManage',
    component: Layout,
    meta: { title: '渠道管理', icon: 'el-icon-connection', roles: ['enterprise_admin'] },
    redirect: '/enterpriseChannelManage/index',
    children: [{
      path: '/enterpriseChannelManage/index',
      name: 'EnterpriseChannelManageIndex',
      component: () => import('@/views/views/enterpriseChannelManage/index'),
      meta: { title: '渠道管理', icon: 'el-icon-connection', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/agentWorkbench',
    name: 'AgentWorkbench',
    component: Layout,
    meta: { title: '客服工作台', icon: 'el-icon-service', roles: ['enterprise_admin'] },
    redirect: '/agentWorkbench/index',
    children: [{
      path: '/agentWorkbench/index',
      name: 'AgentWorkbenchIndex',
      component: () => import('@/views/views/agentWorkbench/index'),
      meta: { title: '客服工作台', icon: 'el-icon-service', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/sessionRecordManage',
    name: 'SessionRecordManage',
    component: Layout,
    meta: { title: '会话记录管理', icon: 'el-icon-chat-dot-round', roles: ['enterprise_admin'] },
    redirect: '/sessionRecordManage/index',
    children: [{
      path: '/sessionRecordManage/index',
      name: 'SessionRecordManageIndex',
      component: () => import('@/views/views/sessionRecordManage/index'),
      meta: { title: '会话记录管理', icon: 'el-icon-chat-dot-round', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/businessDataStatistics',
    name: 'BusinessDataStatistics',
    component: Layout,
    meta: { title: '业务数据统计', icon: 'el-icon-data-analysis', roles: ['enterprise_admin'] },
    redirect: '/businessDataStatistics/index',
    children: [{
      path: '/businessDataStatistics/index',
      name: 'BusinessDataStatisticsIndex',
      component: () => import('@/views/views/businessDataStatistics/index'),
      meta: { title: '业务数据统计', icon: 'el-icon-data-analysis', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/llmConfig',
    name: 'LlmConfig',
    component: Layout,
    meta: { title: '大模型配置', icon: 'el-icon-magic-stick', roles: ['enterprise_admin'] },
    redirect: '/llmConfig/index',
    children: [{
      path: '/llmConfig/index',
      name: 'LlmConfigIndex',
      component: () => import('@/views/views/llmConfig/index'),
      meta: { title: '大模型配置', icon: 'el-icon-magic-stick', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/packageOrderManage',
    name: 'PackageOrderManage',
    component: Layout,
    meta: { title: '套餐订单管理', icon: 'el-icon-shopping-cart-2', roles: ['enterprise_admin'] },
    redirect: '/packagePurchase',
    children: [{
      path: '/packagePurchase',
      name: 'PackagePurchase',
      component: () => import('@/views/views/packagePurchase/index'),
      meta: { title: '套餐购买', icon: 'el-icon-shopping-cart-full', roles: ['enterprise_admin'] }
    }, {
      path: '/myOrder',
      name: 'MyOrder',
      component: () => import('@/views/views/myOrder/index'),
      meta: { title: '我的订单', icon: 'el-icon-s-order', roles: ['enterprise_admin'] }
    }]
  },
  {
    path: '/enterprisePersonalCenterManage',
    name: 'EnterpriseInfoManage',
    component: Layout,
    meta: { title: '企业信息管理', icon: 'el-icon-office-building', roles: ['enterprise_admin'] },
    redirect: '/enterprisePersonalCenterManage/index',
    children: [{
      path: '/enterprisePersonalCenterManage/index',
      name: 'EnterpriseInfoManageIndex',
      component: () => import('@/views/views/enterprisePersonalCenterManage/index'),
      meta: { title: '企业信息管理', icon: 'el-icon-office-building', roles: ['enterprise_admin'] }
    }]
  },
  // 企业运营人员
  {
    path: '/enterpriseOperatorRobotManage',
    name: 'EnterpriseOperatorRobotManage',
    component: Layout,
    meta: { title: '机器人管理', icon: 'el-icon-cpu', roles: ['enterprise_operator'] },
    redirect: '/enterpriseOperatorRobotManage/index',
    children: [{
      path: '/enterpriseOperatorRobotManage/index',
      name: 'EnterpriseOperatorRobotManageIndex',
      component: () => import('@/views/views/enterpriseOperatorRobotManage/index'),
      meta: { title: '机器人管理', icon: 'el-icon-cpu', roles: ['enterprise_operator'] }
    }]
  },
  {
    path: '/enterpriseOperatorKnowledgeManage',
    name: 'EnterpriseOperatorKnowledgeManage',
    component: Layout,
    meta: { title: '知识库管理', icon: 'el-icon-notebook-2', roles: ['enterprise_operator'] },
    redirect: '/enterpriseOperatorKnowledgeManage/index',
    children: [{
      path: '/enterpriseOperatorKnowledgeManage/index',
      name: 'EnterpriseOperatorKnowledgeManageIndex',
      component: () => import('@/views/knowledgeManagement/index'),
      meta: { title: '知识库管理', icon: 'el-icon-notebook-2', roles: ['enterprise_operator'] }
    }]
  },
  {
    path: '/enterpriseOperatorChannelManage',
    name: 'EnterpriseOperatorChannelManage',
    component: Layout,
    meta: { title: '渠道管理', icon: 'el-icon-connection', roles: ['enterprise_operator'] },
    redirect: '/enterpriseOperatorChannelManage/index',
    children: [{
      path: '/enterpriseOperatorChannelManage/index',
      name: 'EnterpriseOperatorChannelManageIndex',
      component: () => import('@/views/views/enterpriseOperatorChannelManage/index'),
      meta: { title: '渠道管理', icon: 'el-icon-connection', roles: ['enterprise_operator'] }
    }]
  },
  {
    path: '/enterpriseOperatorAgentWorkbench',
    name: 'EnterpriseOperatorAgentWorkbench',
    component: Layout,
    meta: { title: '客服工作台', icon: 'el-icon-service', roles: ['enterprise_operator'] },
    redirect: '/enterpriseOperatorAgentWorkbench/index',
    children: [{
      path: '/enterpriseOperatorAgentWorkbench/index',
      name: 'EnterpriseOperatorAgentWorkbenchIndex',
      component: () => import('@/views/views/agentWorkbench/index'),
      meta: { title: '客服工作台', icon: 'el-icon-service', roles: ['enterprise_operator'] }
    }]
  },
  {
    path: '/enterpriseOperatorPersonalCenterManage',
    name: 'EnterpriseOperatorPersonalCenterManage',
    component: Layout,
    meta: { title: '个人中心管理', icon: 'el-icon-user', roles: ['enterprise_operator'] },
    redirect: '/enterpriseOperatorPersonalCenterManage/index',
    children: [{
      path: '/enterpriseOperatorPersonalCenterManage/index',
      name: 'EnterpriseOperatorPersonalCenterManageIndex',
      component: () => import('@/views/views/enterpriseOperatorPersonalCenterManage/index'),
      meta: { title: '个人中心管理', icon: 'el-icon-user', roles: ['enterprise_operator'] }
    }]
  }
]

/**
 * 用户端路由
 * 统一挂在用户端布局 @/layout/client 下，meta.appType 固定为 'client'，
 * 由 permission.js 按 appType 走独立的用户端鉴权流程。
 * meta.requiresAuth 控制是否需要登录后才能访问。
 */
export const clientAsyncRoutes = [
  {
    path: '/user',
    component: () => import('@/layout/client'),
    redirect: '/user/home',
    hidden: true,
    meta: { appType: 'client' },
    children: [
      {
        path: 'home',
        name: 'ClientHome',
        component: () => import('@/views/client/home'),
        meta: { title: '首页', navTitle: '首页', appType: 'client', requiresAuth: false, showInHeader: false }
      }
    ]
  }
]

const createRouter = () => new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [...constantRoutes, ...clientAsyncRoutes]
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}


/**
 * 根据角色添加路由
 * @param {Array} roles - 用户角色数组
 * @returns {Array} - 符合用户角色的可访问路由数组
 */
export function addRoutesByRoles(roles) {
  // 不能用 JSON 深拷贝，会把 component 的函数丢失，导致页面渲染失败
  function cloneRoutes(routes) {
    return routes.map(route => {
      const clonedRoute = {
        ...route,
        meta: route.meta ? { ...route.meta } : undefined
      }
      if (route.children) {
        clonedRoute.children = cloneRoutes(route.children)
      }
      return clonedRoute
    })
  }
  const routePool = cloneRoutes(asyncRoutes)
  // 递归过滤子路由
  function filterChildRoutes(children) {
    if (!children) return [];
    return children.filter(child => {
      let hasAccess = false;
      // 检查当前路由是否有可访问的角色
      if (child.meta && child.meta.roles) {
        hasAccess = roles.some(role => child.meta.roles.includes(role));
      } else {
        hasAccess = true;
      }

      // 递归处理子路由
      if (child.children) {
        const filteredChildren = filterChildRoutes(child.children);
        child.children = filteredChildren;
        // 如果当前路由没有直接访问权限，但子路由有，则认为该路由可访问
        hasAccess = hasAccess || filteredChildren.length > 0;
      }
      return hasAccess;
    });
  }
  const accessedRoutes = routePool.filter(route => {
    const filteredChildren = filterChildRoutes(route.children);
    route.children = filteredChildren;
    // 如果父路由有子路由，或者父路由自身有匹配的角色，则保留该父路由
    const hasRouteAccess = filteredChildren.length > 0;
    return hasRouteAccess;
  });
  // 动态添加可访问的路由到路由实例中
  router.addRoutes(accessedRoutes);
  // 返回符合用户角色的可访问路由数组
  return accessedRoutes;
}

export default router

