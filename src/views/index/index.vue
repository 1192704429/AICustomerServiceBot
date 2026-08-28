<template>
  <div class="dashboard-container">
    <div v-if="!isPlatformAdmin" class="welcome-banner welcome-banner--simple">
      <div>
        <h2>你好，{{ name || '管理员' }}</h2>
        <p>欢迎使用企业智能客服机器人平台。</p>
      </div>
    </div>
    <div v-else class="welcome-banner">
      <div>
        <h2>你好，{{ name || '管理员' }}</h2>
        <p>欢迎使用企业智能客服机器人平台，以下是平台运行概览。</p>
      </div>
      <div class="banner-actions">
        <el-button type="primary" plain icon="el-icon-refresh" @click="loadData">刷新数据</el-button>
      </div>
    </div>

    <enterprise-home-panel
      v-if="isEnterpriseAdmin"
      v-loading="loading"
      :overview="overview"
      @refresh="loadData"
    />
    <business-statistics-panel
      v-else
      v-loading="loading"
      :overview="overview"
      :platform-mode="isPlatformAdmin"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getStatisticsOverview } from '@/api/statistics'
import BusinessStatisticsPanel from '@/components/BusinessStatisticsPanel'
import EnterpriseHomePanel from '@/components/EnterpriseHomePanel'

export default {
  name: 'Dashboard',
  components: { BusinessStatisticsPanel, EnterpriseHomePanel },
  data() {
    return {
      loading: false,
      overview: {}
    }
  },
  computed: {
    ...mapGetters(['name', 'role']),
    isPlatformAdmin() {
      return this.role === 'platform_admin'
    },
    isEnterpriseAdmin() {
      return this.role === 'enterprise_admin'
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loading = true
      getStatisticsOverview({ days: 7 }).then(res => {
        this.overview = res.data || {}
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 24px 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 45%, #ffffff 100%);
  border: 1px solid #ccfbf1;
  box-shadow: 0 8px 24px rgba(20, 184, 166, 0.08);

  h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #134e4a;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 14px;
  }

  &--simple {
    padding: 0 0 16px;
    margin-bottom: 0;
    border: none;
    border-radius: 0;
    background: none;
    box-shadow: none;

    h2 {
      font-size: 20px;
      color: #303133;
    }

    p {
      color: #909399;
    }
  }
}
</style>
