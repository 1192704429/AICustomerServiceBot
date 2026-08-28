<template>
  <div v-loading="loading" class="app-container enterprise-info-page">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="summary-card">
          <div class="enterprise-head">
            <img
              :src="enterprise.enterpriseLogo || defaultLogo"
              alt="logo"
              class="enterprise-logo"
            >
            <div>
              <h3>{{ enterprise.enterpriseName || '未设置企业名称' }}</h3>
              <el-tag size="mini" :type="statusTagType(enterprise.status)">
                {{ statusLabel(enterprise.status) }}
              </el-tag>
            </div>
          </div>

          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="所属行业">{{ enterprise.industryName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="机器人上限">{{ enterprise.robotLimit != null ? enterprise.robotLimit : '-' }}</el-descriptions-item>
            <el-descriptions-item label="服务到期">{{ enterprise.expireTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ enterprise.createTime || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card shadow="never">
          <div slot="header" class="card-header">
            <span>企业信息维护</span>
          </div>

          <el-form ref="enterpriseForm" :model="enterpriseForm" label-width="100px" class="form-block">
            <el-form-item label="企业名称">
              <el-input v-model="enterpriseForm.enterpriseName" placeholder="请输入企业名称" />
            </el-form-item>
            <el-form-item label="所属行业">
              <el-input v-model="enterpriseForm.industryName" placeholder="请输入所属行业" />
            </el-form-item>
            <el-form-item label="联系人">
              <el-input v-model="enterpriseForm.contactName" placeholder="请输入联系人" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="enterpriseForm.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="enterpriseForm.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>
            <el-form-item label="企业地址">
              <el-input v-model="enterpriseForm.enterpriseAddress" placeholder="请输入企业地址" />
            </el-form-item>
            <el-form-item label="企业Logo">
              <img-upload v-model="enterpriseForm.enterpriseLogo" :limit="1" />
            </el-form-item>
            <el-form-item label="营业执照">
              <img-upload v-model="enterpriseForm.businessLicense" :limit="1" />
            </el-form-item>
            <el-form-item label="企业简介">
              <el-input
                v-model="enterpriseForm.enterpriseDesc"
                type="textarea"
                :rows="4"
                placeholder="请输入企业简介"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="saving" @click="saveEnterprise">保存企业信息</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo } from '@/api/user'
import { getEnterpriseInfoById, updateEnterpriseInfo } from '@/api/enterprise_info'
import ImgUpload from '@/components/ImgUpload'

export default {
  name: 'EnterpriseInfoManage',
  components: { ImgUpload },
  data() {
    return {
      loading: false,
      saving: false,
      enterprise: {},
      enterpriseForm: {},
      defaultLogo: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      statusEnumMap: { 2: '待审核', 1: '审核通过', 0: '审核不通过' }
    }
  },
  computed: {
    ...mapGetters(['id'])
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const userRes = await getUserInfo(this.id)
        const enterpriseId = userRes.data && userRes.data.enterpriseId
        if (!enterpriseId) {
          this.$message.warning('当前账号未关联企业')
          return
        }
        const entRes = await getEnterpriseInfoById(enterpriseId)
        this.enterprise = entRes.data || {}
        this.enterpriseForm = { ...this.enterprise }
      } finally {
        this.loading = false
      }
    },
    statusLabel(status) {
      return this.statusEnumMap[status] || '-'
    },
    statusTagType(status) {
      if (status === 2) return 'warning'
      if (status === 1) return 'success'
      if (status === 0) return 'danger'
      return 'info'
    },
    saveEnterprise() {
      this.saving = true
      updateEnterpriseInfo(this.enterpriseForm).then(() => {
        this.$message.success('企业信息已更新')
        this.loadData()
      }).finally(() => {
        this.saving = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.enterprise-info-page {
  .summary-card {
    border-radius: 14px;
    margin-bottom: 20px;
  }

  .enterprise-head {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 18px;

    .enterprise-logo {
      width: 72px;
      height: 72px;
      border-radius: 16px;
      object-fit: cover;
      background: #f5f7fa;
    }

    h3 {
      margin: 0 0 8px;
      color: #134e4a;
      font-size: 18px;
    }
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .form-block {
    max-width: 720px;
    padding-top: 8px;
  }
}
</style>
