<template>
  <div class="enterprise-home">
    <div class="overview-header">
      <div>
        <h2>{{ overview.enterpriseName || '企业工作台' }}</h2>
        <p>
          服务到期：{{ overview.expireTime || '未设置' }}
          <span v-if="overview.robotLimit != null" class="divider">|</span>
          <span v-if="overview.robotLimit != null">机器人配额 {{ overview.totalRobots || 0 }}/{{ overview.robotLimit }}</span>
        </p>
      </div>
      <el-button size="small" icon="el-icon-refresh" @click="$emit('refresh')">刷新</el-button>
    </div>

    <el-row :gutter="16" class="stat-row">
      <el-col v-for="item in statCards" :key="item.label" :xs="12" :sm="8" :lg="4">
        <div class="stat-card">
          <div class="stat-value" :class="{ highlight: item.highlight }">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </el-col>
    </el-row>

    <div class="section-block">
      <div class="section-title">快捷入口</div>
      <div class="quick-grid">
        <div
          v-for="item in quickLinks"
          :key="item.path"
          class="quick-item"
          @click="go(item.path)"
        >
          <i :class="item.icon" />
          <span>{{ item.title }}</span>
          <em v-if="item.badge != null">{{ item.badge }}</em>
        </div>
      </div>
    </div>

    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <basic-line-chart name="近7日会话趋势" :data-list="overview.sessionTrend || []" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <basic-bar-chart name="近7日访客趋势" :data-list="overview.visitorTrend || []" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import BasicLineChart from '@/components/BasicLineChart'
import BasicBarChart from '@/components/BasicBarChart'

export default {
  name: 'EnterpriseHomePanel',
  components: { BasicLineChart, BasicBarChart },
  props: {
    overview: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    statCards() {
      const o = this.overview || {}
      const remaining = o.remainingRobots != null ? o.remainingRobots : '-'
      return [
        { label: '今日会话', value: o.todaySessions || 0 },
        { label: '今日访客', value: o.todayVisitors || 0 },
        { label: '总会话数', value: o.totalSessions || 0 },
        { label: '已创建机器人', value: o.totalRobots || 0 },
        { label: '可创建机器人', value: remaining, highlight: true },
        { label: '知识库条目', value: o.totalDocuments || 0 }
      ]
    },
    quickLinks() {
      const o = this.overview || {}
      const remaining = o.remainingRobots != null ? o.remainingRobots : null
      return [
        { title: '机器人管理', icon: 'el-icon-cpu', path: '/enterpriseRobotManage/index', badge: remaining },
        { title: '知识库管理', icon: 'el-icon-notebook-2', path: '/enterpriseKnowledgeManage/index' },
        { title: '渠道管理', icon: 'el-icon-connection', path: '/enterpriseChannelManage/index', badge: o.totalChannels },
        { title: '人员管理', icon: 'el-icon-s-custom', path: '/enterprisePersonnelManage/index', badge: o.totalUsers },
        { title: '套餐购买', icon: 'el-icon-shopping-cart-full', path: '/packagePurchase' },
        { title: '我的订单', icon: 'el-icon-s-order', path: '/myOrder' },
        { title: '会话记录', icon: 'el-icon-chat-dot-round', path: '/sessionRecordManage/index' },
        { title: '企业信息', icon: 'el-icon-office-building', path: '/enterprisePersonalCenterManage/index' }
      ]
    }
  },
  methods: {
    go(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped lang="scss">
.enterprise-home {
  .overview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #909399;
    }

    .divider {
      margin: 0 8px;
    }
  }

  .stat-row {
    margin-bottom: 24px;
  }

  .stat-card {
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    text-align: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    line-height: 1.2;

    &.highlight {
      color: #409eff;
    }
  }

  .stat-label {
    margin-top: 8px;
    font-size: 13px;
    color: #909399;
  }

  .section-block {
    margin-bottom: 24px;
    padding: 20px;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  .section-title {
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .quick-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 96px;
    padding: 12px 8px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
    position: relative;

    &:hover {
      border-color: #c6e2ff;
      background: #f5f9ff;
    }

    i {
      font-size: 24px;
      color: #409eff;
    }

    span {
      font-size: 13px;
      color: #606266;
      text-align: center;
    }

    em {
      position: absolute;
      top: 8px;
      right: 8px;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: #ecf5ff;
      color: #409eff;
      font-size: 11px;
      font-style: normal;
      line-height: 18px;
      text-align: center;
    }
  }

  .chart-row {
    margin-bottom: 8px;
  }
}
</style>
