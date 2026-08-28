<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="待审核" name="2" />
      <el-tab-pane label="审核通过" name="1" />
      <el-tab-pane label="审核不通过" name="0" />
    </el-tabs>

    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="企业名称">
          <el-input
            v-model="queryParams.enterpriseName"
            placeholder="请输入企业名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input
            v-model="queryParams.contactPhone"
            placeholder="请输入联系电话"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="enterpriseInfoList"
        class="modern-table"
      >
        <el-table-column label="企业名称" prop="enterpriseName" align="center" min-width="140" :show-overflow-tooltip="true" />
        <el-table-column label="联系人" prop="contactName" align="center" width="100" :show-overflow-tooltip="true" />
        <el-table-column label="联系电话" prop="contactPhone" align="center" width="120" :show-overflow-tooltip="true" />
        <el-table-column label="所属行业" prop="industryName" align="center" width="120" :show-overflow-tooltip="true" />
        <el-table-column label="状态" prop="status" align="center" width="100">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="small">
              {{ getEnumLabel(scope.row.status, statusEnumMap) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center" width="160" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            <template v-if="activeTab === '2'">
              <el-button type="text" style="color: #67c23a;" @click="handleAudit(scope.row, 1)">通过</el-button>
              <el-button type="text" style="color: #e6a23c;" @click="handleAudit(scope.row, 0)">驳回</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <pagination
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[5, 10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 详情对话框 -->
    <el-dialog title="企业详情" :visible.sync="detailOpen" width="720px" append-to-body>
      <el-descriptions v-if="detailRow" :column="2" border size="medium">
        <el-descriptions-item label="企业名称" :span="2">{{ detailRow.enterpriseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属行业">{{ detailRow.industryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业状态">
          <el-tag :type="statusTagType(detailRow.status)" size="small">
            {{ getEnumLabel(detailRow.status, statusEnumMap) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系人">{{ detailRow.contactName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailRow.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系邮箱" :span="2">{{ detailRow.contactEmail || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业地址" :span="2">{{ detailRow.enterpriseAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业简介" :span="2">{{ detailRow.enterpriseDesc || '-' }}</el-descriptions-item>
        <el-descriptions-item label="机器人上限">{{ detailRow.robotLimit != null ? detailRow.robotLimit : '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务到期">{{ detailRow.expireTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailRow.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailRow.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业Logo" :span="2">
          <image-preview v-if="detailRow.enterpriseLogo" :src="detailRow.enterpriseLogo" width="80px" height="80px" />
          <span v-else class="text-muted">暂无</span>
        </el-descriptions-item>
        <el-descriptions-item label="营业执照" :span="2">
          <image-preview v-if="detailRow.businessLicense" :src="detailRow.businessLicense" width="120px" height="120px" />
          <span v-else class="text-muted">暂无</span>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="detailRow && detailRow.status === 2" type="success" @click="handleAudit(detailRow, 1)">通过</el-button>
        <el-button v-if="detailRow && detailRow.status === 2" type="warning" @click="handleAudit(detailRow, 0)">驳回</el-button>
        <el-button @click="detailOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageEnterpriseInfo,
  getEnterpriseInfoById,
  auditEnterpriseInfo
} from '@/api/enterprise_info'
import ImagePreview from '@/components/ImagePreview'
import Pagination from '@/components/Pagination'

export default {
  name: 'EnterpriseInfo',
  components: {
    ImagePreview,
    Pagination
  },
  data() {
    return {
      activeTab: '2',
      loading: true,
      total: 0,
      enterpriseInfoList: [],
      detailOpen: false,
      detailRow: null,
      queryParams: {
        current: 1,
        size: 5,
        enterpriseName: null,
        contactPhone: null,
        status: 2
      },
      statusEnumMap: { 2: '待审核', 1: '审核通过', 0: '审核不通过' }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      pageEnterpriseInfo(current, size, { ...rest }).then(response => {
        const pageData = response.data
        this.enterpriseInfoList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleTabChange() {
      this.queryParams.status = Number(this.activeTab)
      this.queryParams.current = 1
      this.getList()
    },
    statusTagType(status) {
      if (status === 2) return 'warning'
      if (status === 1) return 'success'
      return 'danger'
    },
    getEnumLabel(val, map) {
      if (map == null || map[val] === undefined) return val
      return map[val]
    },
    handleDetail(row) {
      getEnterpriseInfoById(row.id).then(response => {
        this.detailRow = response.data
        this.detailOpen = true
      })
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.current = 1
      this.queryParams.size = this.queryParams.size || 5
      this.queryParams.enterpriseName = null
      this.queryParams.contactPhone = null
      this.handleQuery()
    },
    handleAudit(row, status) {
      const action = status === 1 ? '通过' : '驳回'
      this.$confirm(`确认${action}企业「${row.enterpriseName}」的注册申请？审核结果将邮件通知联系人。`, '审核确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => auditEnterpriseInfo(row.id, status)).then(() => {
        this.$message.success(`已${action}`)
        this.detailOpen = false
        this.getList()
      }).catch(() => {})
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.getList()
    },
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.text-muted {
  color: #909399;
}
</style>
