<template>
  <header class="client-header">
    <div class="header-inner">
      <div class="brand" @click="goHome">
        <img
          v-if="clientHeaderLogo"
          :src="clientHeaderLogo"
          alt="logo"
          class="logo-image"
        >
        <div v-else class="logo-placeholder">AI</div>
        <span class="title">{{ clientHeaderTitle }}</span>
      </div>

      <el-menu
        v-if="menuRoutes.length"
        mode="horizontal"
        :default-active="activeMenu"
        class="nav-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuRoutes"
          :key="item.path"
          :index="item.path"
          class="nav-item"
        >
          {{ item.meta.navTitle || item.meta.title || item.name }}
        </el-menu-item>
      </el-menu>

      <div class="user-area">
        <template v-if="isLoggedIn">
          <el-dropdown trigger="hover" @command="handleCommand">
            <div class="user-trigger">
              <img v-if="avatar" :src="avatar" alt="avatar" class="avatar-img">
              <div v-else class="avatar">{{ avatarText }}</div>
              <span class="username">{{ name || '用户' }}</span>
              <i class="el-icon-arrow-down el-icon--right" />
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="/index">管理后台</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <button class="entry-btn login-btn" @click="$router.push('/login')">登录</button>
          <button class="entry-btn register-btn" @click="$router.push('/user/register')">注册</button>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import { clientAsyncRoutes } from '@/router'
import defaultSettings from '@/settings'

export default {
  name: 'ClientHeader',
  computed: {
    ...mapGetters(['token', 'name', 'avatar']),
    clientHeaderTitle() {
      return defaultSettings.clientTitle || '企业智能客服平台'
    },
    clientHeaderLogo() {
      return defaultSettings.clientLogo || ''
    },
    isLoggedIn() {
      return Boolean(this.token)
    },
    activeMenu() {
      return this.$route.path
    },
    menuRoutes() {
      const staticUserRoot = clientAsyncRoutes.find(route => route.path === '/user')
      const optionsRoutes = this.$router.options.routes || []
      const runtimeUserRoot = optionsRoutes.find(route => route.path === '/user')
      const userRoot = staticUserRoot || runtimeUserRoot
      const children = (userRoot && userRoot.children) || []
      return children
        .map(route => ({
          ...route,
          path: route.path.startsWith('/user/') ? route.path : `/user/${route.path}`
        }))
        .filter(route => {
          const meta = route.meta || {}
          if (!meta.showInHeader) return false
          if (meta.requiresAuth && !this.isLoggedIn) return false
          return true
        })
    },
    avatarText() {
      if (!this.name) return 'U'
      return this.name.slice(0, 1).toUpperCase()
    }
  },
  methods: {
    handleMenuSelect(path) {
      if (path !== this.$route.path) {
        this.$router.push(path)
      }
    },
    async handleCommand(command) {
      if (command === 'logout') {
        await this.$store.dispatch('user/logout')
        this.$router.replace('/login')
        return
      }
      this.$router.push(command)
    },
    goHome() {
      this.$router.push('/user/home')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../client-theme.scss";

.client-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 60px;
  background: $client-header-bg-start;
  box-shadow: 0 4px 14px $client-header-shadow;
}

.header-inner {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-image,
.logo-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #5eead4 0%, #14b8a6 100%);
  color: #134e4a;
  font-weight: 600;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: $client-header-title;
  letter-spacing: 1px;
}

.nav-menu.el-menu--horizontal {
  border-bottom: none;
  background-color: transparent;
}

.nav-menu ::v-deep .el-menu-item {
  position: relative;
  height: 60px;
  line-height: 60px;
  color: $client-header-menu;
  background-color: transparent;
  border-bottom: none !important;
  transition: color 0.25s ease, transform 0.25s ease;
}

.nav-menu ::v-deep .el-menu-item:hover {
  color: $client-header-menu-hover !important;
  transform: translateY(-1px);
}

.nav-menu ::v-deep .el-menu-item::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 8px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, $client-header-menu-line-start, $client-header-menu-line-end);
  transform: scaleX(0);
  transition: transform 0.25s ease;
}

.nav-menu ::v-deep .el-menu-item:hover::after,
.nav-menu ::v-deep .el-menu-item.is-active::after {
  transform: scaleX(1);
}

.nav-menu ::v-deep .el-menu-item.is-active {
  color: $client-header-menu-active !important;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 20px;
  transition: background-color 0.25s ease;
}

.user-trigger:hover {
  background-color: rgba(255, 240, 245, 0.8);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(120deg, #ffc6d5 0%, #ffe2c7 100%);
  color: #9f5f66;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(197, 139, 152, 0.25);
}

.username {
  color: #7d5f64;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-btn {
  border: none;
  outline: none;
  border-radius: 20px;
  padding: 7px 16px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.25s ease;
}

.login-btn {
  background: #ffffff;
  color: #0d9488;
  border: 1px solid #ccfbf1;
}

.login-btn:hover {
  background: #ecfdf5;
  border-color: #99f6e4;
}

.register-btn {
  color: #ffffff;
  background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
}

.register-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(20, 184, 166, 0.35);
}
</style>
