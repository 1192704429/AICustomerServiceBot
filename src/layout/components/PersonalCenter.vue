<template>
  <el-dialog title="个人中心" :visible.sync="visible" width="720px" append-to-body @closed="handleClosed">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="profile">
        <el-form ref="profileForm" :model="profileForm" label-width="90px">
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
            <el-button type="primary" :loading="saving" @click="saveProfile">保存</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="password">
        <change-password ref="changePassword" @success="visible = false" />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo, updateUserInfo } from '@/api/user'
import ImgUpload from '@/components/ImgUpload'
import ChangePassword from './ChangePassword.vue'

export default {
  name: 'PersonalCenter',
  components: { ImgUpload, ChangePassword },
  data() {
    return {
      visible: false,
      activeTab: 'profile',
      saving: false,
      profileForm: {}
    }
  },
  computed: {
    ...mapGetters(['id'])
  },
  methods: {
    open() {
      this.visible = true
      this.activeTab = 'profile'
      this.loadProfile()
    },
    loadProfile() {
      getUserInfo(this.id).then(res => {
        const data = res.data || {}
        this.profileForm = {
          id: data.id,
          realName: data.realName,
          phone: data.phone,
          email: data.email,
          avatar: data.avatar
        }
      })
    },
    saveProfile() {
      this.saving = true
      updateUserInfo(this.profileForm).then(() => {
        this.$message.success('保存成功')
      }).finally(() => {
        this.saving = false
      })
    },
    handleClosed() {
      if (this.$refs.changePassword) {
        this.$refs.changePassword.reset()
      }
    }
  }
}
</script>
