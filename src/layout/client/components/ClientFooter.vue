<template>
  <footer class="client-footer">
    <div class="footer-inner">
      <div class="footer-top">
        <section class="footer-col">
          <h4 class="col-title">关于平台</h4>
          <ul class="link-list">
            <li><a href="javascript:void(0)">平台介绍</a></li>
            <li><a href="javascript:void(0)">核心能力</a></li>
            <li><a href="javascript:void(0)">部署流程</a></li>
          </ul>
        </section>

        <section class="footer-col">
          <h4 class="col-title">产品能力</h4>
          <ul class="link-list">
            <li><a href="javascript:void(0)">智能机器人</a></li>
            <li><a href="javascript:void(0)">知识库 RAG</a></li>
            <li><a href="javascript:void(0)">网站快速接入</a></li>
            <li><a href="javascript:void(0)">数据统计洞察</a></li>
          </ul>
        </section>

        <section class="footer-col">
          <h4 class="col-title">快速开始</h4>
          <ul class="link-list">
            <li><router-link to="/user/register">免费注册企业</router-link></li>
            <li><router-link to="/login">进入管理后台</router-link></li>
            <li><router-link to="/user/home">返回首页</router-link></li>
          </ul>
        </section>

        <section class="footer-col">
          <h4 class="col-title">联系我们</h4>
          <ul class="link-list contact-list">
            <li>商务咨询：400-888-0000</li>
            <li>技术支持：support@ics-platform.com</li>
          </ul>
          <div class="social-wrap">
            <div class="icon-group">
              <i class="el-icon-chat-dot-round social-icon" title="在线客服" />
              <i class="el-icon-message social-icon" title="邮件联系" />
              <i class="el-icon-phone social-icon" title="电话咨询" />
            </div>
          </div>
        </section>
      </div>

      <div class="footer-bottom">
        <p>© 2026 {{ clientTitle }} All Rights Reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
import defaultSettings from '@/settings'

export default {
  name: 'ClientFooter',
  computed: {
    clientTitle() {
      return defaultSettings.clientTitle || '企业智能客服平台'
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../client-theme.scss";

.client-footer {
  margin-top: 0;
  background: $client-footer-bg-start;
  border-top: 1px solid $client-footer-border;
  box-shadow: 0 -2px 10px $client-footer-shadow;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 34px 20px 18px;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid $client-footer-border;
}

.col-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: $client-footer-title;
}

.link-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.link-list li {
  margin-bottom: 10px;
  line-height: 1.7;
  color: $client-footer-text;
  font-size: 14px;
}

.link-list a {
  color: $client-footer-text;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link-list a:hover {
  color: $client-footer-link-hover;
}

.contact-list li {
  margin-bottom: 8px;
}

.social-wrap {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.social-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #fff;
  color: #0d9488;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(20, 184, 166, 0.15);
  transition: all 0.2s ease;
  cursor: pointer;
}

.social-icon:hover {
  color: #0f766e;
  transform: scale(1.08);
}

.footer-bottom {
  text-align: center;
  padding-top: 16px;
}

.footer-bottom p {
  margin: 6px 0;
  font-size: 12px;
  color: $client-footer-bottom-text;
}

@media (max-width: 960px) {
  .footer-top {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .footer-top {
    grid-template-columns: 1fr;
  }
}
</style>
