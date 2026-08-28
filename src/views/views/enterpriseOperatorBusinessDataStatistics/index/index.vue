<template>
  <div class="app-container">
    <div class="page-header">
      <div>
        <h2>业务数据统计</h2>
        <p>运营视角下的访客、会话与知识库表现。</p>
      </div>
      <el-button type="primary" icon="el-icon-refresh" @click="loadData">刷新</el-button>
    </div>
    <business-statistics-panel v-loading="loading" :overview="overview" />
  </div>
</template>

<script>
import { getStatisticsOverview } from '@/api/statistics'
import BusinessStatisticsPanel from '@/components/BusinessStatisticsPanel'

export default {
  name: 'EnterpriseOperatorBusinessDataStatistics',
  components: { BusinessStatisticsPanel },
  data() {
    return {
      loading: false,
      overview: {}
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

<style scoped lang="scss">
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0 0 6px;
    color: #134e4a;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
  }
}
</style>
