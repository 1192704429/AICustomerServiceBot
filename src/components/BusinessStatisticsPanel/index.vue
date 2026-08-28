<template>
  <div class="statistics-panel">
    <div class="stat-cards">
      <div v-for="item in cards" :key="item.label" class="stat-card" :style="{ background: item.bg }">
        <div class="stat-icon"><i :class="item.icon" /></div>
        <div class="stat-body">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <basic-line-chart name="近7日会话趋势" :data-list="overview.sessionTrend || []" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <basic-bar-chart name="近7日访客趋势" :data-list="overview.visitorTrend || []" />
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <basic-pie-chart name="热门问题 TOP" :data-list="hotQuestionPie" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="insight-card">
          <div slot="header" class="card-title">AI 与知识库洞察</div>
          <div class="insight-grid">
            <div class="insight-item">
              <span class="insight-label">RAG 命中率</span>
              <span class="insight-value">{{ formatRate(overview.ragHitRate) }}</span>
            </div>
            <div class="insight-item">
              <span class="insight-label">平均响应时间</span>
              <span class="insight-value">{{ overview.avgResponseMs || 0 }} ms</span>
            </div>
            <div class="insight-item">
              <span class="insight-label">消息总量</span>
              <span class="insight-value">{{ overview.totalMessages || 0 }}</span>
            </div>
            <div class="insight-item">
              <span class="insight-label">知识文档数</span>
              <span class="insight-value">{{ overview.totalDocuments || 0 }}</span>
            </div>
          </div>
          <div class="hot-list">
            <div v-for="(item, idx) in overview.hotQuestions || []" :key="idx" class="hot-item">
              <span class="hot-rank">{{ idx + 1 }}</span>
              <span class="hot-text">{{ item.name }}</span>
              <span class="hot-count">{{ item.value }} 次</span>
            </div>
            <el-empty v-if="!(overview.hotQuestions || []).length" description="暂无热门问题" :image-size="72" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import BasicLineChart from '@/components/BasicLineChart'
import BasicBarChart from '@/components/BasicBarChart'
import BasicPieChart from '@/components/BasicPieChart'

export default {
  name: 'BusinessStatisticsPanel',
  components: { BasicLineChart, BasicBarChart, BasicPieChart },
  props: {
    overview: {
      type: Object,
      default: () => ({})
    },
    platformMode: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cards() {
      const o = this.overview || {}
      const list = [
        { label: '今日访客', value: o.todayVisitors || 0, icon: 'el-icon-user', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
        { label: '今日会话', value: o.todaySessions || 0, icon: 'el-icon-chat-dot-round', bg: 'linear-gradient(135deg,#11998e,#38ef7d)' },
        { label: '总会话数', value: o.totalSessions || 0, icon: 'el-icon-s-data', bg: 'linear-gradient(135deg,#f093fb,#f5576c)' },
        { label: '总访客数', value: o.totalVisitors || 0, icon: 'el-icon-s-custom', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)' }
      ]
      if (this.platformMode) {
        list.push(
          { label: '企业总数', value: o.totalEnterprises || 0, icon: 'el-icon-office-building', bg: 'linear-gradient(135deg,#fa709a,#fee140)' },
          { label: '机器人总数', value: o.totalRobots || 0, icon: 'el-icon-cpu', bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' }
        )
      } else {
        list.push(
          { label: '机器人数量', value: o.totalRobots || 0, icon: 'el-icon-cpu', bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
          { label: '知识库文档', value: o.totalDocuments || 0, icon: 'el-icon-notebook-2', bg: 'linear-gradient(135deg,#ffecd2,#fcb69f)' }
        )
      }
      return list
    },
    hotQuestionPie() {
      return (this.overview.hotQuestions || []).map(item => ({
        name: item.name && item.name.length > 12 ? item.name.slice(0, 12) + '...' : item.name,
        value: Number(item.value || 0)
      }))
    }
  },
  methods: {
    formatRate(val) {
      const num = Number(val || 0)
      return `${num.toFixed(1)}%`
    }
  }
}
</script>

<style scoped lang="scss">
.statistics-panel {
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    border-radius: 14px;
    color: #fff;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    opacity: 0.92;
    margin-top: 4px;
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .insight-card {
    border-radius: 12px;
    min-height: 460px;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .insight-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 18px;
  }

  .insight-item {
    background: #f8fafc;
    border-radius: 10px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .insight-label {
    color: #64748b;
    font-size: 13px;
  }

  .insight-value {
    color: #0f766e;
    font-size: 22px;
    font-weight: 700;
  }

  .hot-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px dashed #e2e8f0;
  }

  .hot-rank {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #ecfdf5;
    color: #0f766e;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .hot-text {
    flex: 1;
    color: #334155;
    font-size: 13px;
  }

  .hot-count {
    color: #94a3b8;
    font-size: 12px;
  }
}
</style>
