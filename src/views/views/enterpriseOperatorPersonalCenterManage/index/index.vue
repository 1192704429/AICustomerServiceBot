<template>
  <div class="app-container personal-center-page">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="profile-card">
          <div class="profile-head">
            <img :src="profile.avatar || defaultAvatar" alt="avatar" class="avatar">
            <div>
              <h3>{{ profile.realName || name }}</h3>
              <p>{{ profile.username }}</p>
              <el-tag size="mini">企业运营</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="16">
        <el-card shadow="never">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="profile">
              <el-form ref="profileForm" :model="profileForm" label-width="90px" class="form-block">
                <el-form-item label="真实姓名">
                  <el-input v-model="profileForm.realName" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="profileForm.phone" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
                <el-form-item label="头像">
                  <img-upload v-model="profileForm.avatar" :limit="1" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="saving" @click="saveProfile">保存信息</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="password">
              <change-password />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo, updateUserInfo } from '@/api/user'
import ImgUpload from '@/components/ImgUpload'
import ChangePassword from '@/layout/components/ChangePassword'

export default {
  name: 'EnterpriseOperatorPersonalCenterManage',
  components: { ImgUpload, ChangePassword },
  data() {
    return {
      activeTab: 'profile',
      saving: false,
      profile: {},
      profileForm: {},
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  },
  computed: {
    ...mapGetters(['id', 'name'])
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      const userRes = await getUserInfo(this.id)
      this.profile = userRes.data || {}
      this.profileForm = {
        id: this.profile.id,
        realName: this.profile.realName,
        phone: this.profile.phone,
        email: this.profile.email,
        avatar: this.profile.avatar
      }
    },
    saveProfile() {
      this.saving = true
      updateUserInfo(this.profileForm).then(() => {
        this.$message.success('个人信息已更新')
        this.loadData()
      }).finally(() => {
        this.saving = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.personal-center-page {
  .profile-card { border-radius: 14px; }
  .profile-head {
    display: flex;
    gap: 16px;
    align-items: center;
    .avatar { width: 72px; height: 72px; border-radius: 16px; object-fit: cover; }
    h3 { margin: 0 0 4px; color: #134e4a; }
    p { margin: 0 0 8px; color: #64748b; font-size: 13px; }
  }
  .form-block { max-width: 640px; padding-top: 8px; }
}
</style>
