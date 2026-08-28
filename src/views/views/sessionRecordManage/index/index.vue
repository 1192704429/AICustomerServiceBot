<template>
  <div class="app-container session-record-page">
    <div class="page-header">
      <div class="page-header__main">
        <h2>会话记录</h2>
        <p>查看访客咨询会话，记录由系统自动生成，支持检索历史与查看消息详情。</p>
      </div>
    </div>

    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="会话ID">
          <el-input
            v-model="queryParams.sessionKeyword"
            placeholder="输入 ID 或编号"
            clearable
            prefix-icon="el-icon-link"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="访客">
          <el-input
            v-model="queryParams.visitorName"
            placeholder="搜索访客名称"
            clearable
            prefix-icon="el-icon-user"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.sessionStatus"
            placeholder="全部状态"
            clearable
          >
            <el-option :key="1" label="进行中" :value="1" />
            <el-option :key="2" label="人工接管中" :value="2" />
            <el-option :key="3" label="已结束" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="机器人">
          <el-input
            v-model="queryParams.robotName"
            placeholder="搜索机器人"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="渠道">
          <el-input
            v-model="queryParams.channelName"
            placeholder="搜索渠道"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="接管客服">
          <el-input
            v-model="queryParams.realName"
            placeholder="搜索客服姓名"
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

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button :disabled="multiple" @click="handleDeleteBatch">批量删除</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="chatSessionList"
        stripe
        @selection-change="handleSelectionChange"
        class="modern-table"
      >
        <el-table-column type="selection" width="48" align="center" />
        <el-table-column label="会话ID" prop="id" width="88" align="center">
          <template slot-scope="scope">
            <span class="session-id">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="会话编号" prop="sessionNo" min-width="150" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="session-no">{{ scope.row.sessionNo || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="访客" prop="visitorName" min-width="100" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span class="visitor-name">{{ scope.row.visitorName || '匿名访客' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="会话摘要" prop="sessionContent" min-width="200" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            <span v-if="isSummaryGenerating(scope.row)" class="summary-loading">
              <i class="el-icon-loading" /> AI 生成中...
            </span>
            <span v-else-if="scope.row.summaryStatus === 3" class="summary-failed">
              {{ scope.row.sessionContent || '摘要生成失败' }}
            </span>
            <span v-else class="session-summary">{{ scope.row.sessionContent || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="sessionStatus" width="110" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="getStatusTagType(scope.row.sessionStatus)"
              size="small"
              effect="plain"
            >
              {{ getEnumLabel(scope.row.sessionStatus, sessionStatusEnumMap) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="机器人" prop="robotName" min-width="110" :show-overflow-tooltip="true" />
        <el-table-column label="渠道" prop="channelName" min-width="100" :show-overflow-tooltip="true" />
        <el-table-column label="接管客服" prop="realName" width="100" align="center" :show-overflow-tooltip="true">
          <template slot-scope="scope">
            {{ scope.row.realName || '—' }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="startTime" width="160" align="center">
          <template slot-scope="scope">
            {{ formatTime(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="endTime" width="160" align="center">
          <template slot-scope="scope">
            {{ formatTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button type="text" @click="handleViewMessages(scope.row)">查看消息</el-button>
            <el-button type="text" class="danger-text" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-drawer
      :visible.sync="messageDrawer"
      size="520px"
      append-to-body
      custom-class="session-message-drawer"
      :with-header="false"
    >
      <div class="message-drawer">
        <header class="drawer-head">
          <div class="drawer-head__info">
            <h3>{{ activeSession.visitorName || '匿名访客' }}</h3>
            <p>
              {{ activeSession.channelName || '—' }}
              · {{ activeSession.robotName || '—' }}
              <span v-if="messageList.length"> · 共 {{ messageList.length }} 条</span>
            </p>
          </div>
          <el-button type="text" icon="el-icon-close" class="drawer-close" @click="messageDrawer = false" />
        </header>

        <div ref="messageBox" v-loading="messageLoading" class="message-box">
          <div
            v-for="item in messageList"
            :key="item.id"
            :class="['msg-row', messageRoleClass(item.messageRole)]"
          >
            <div :class="['msg-avatar', messageRoleClass(item.messageRole)]">
              <i :class="messageRoleIcon(item.messageRole)" />
            </div>
            <div class="msg-main">
              <div class="msg-label">
                <span>{{ messageRoleLabel(item.messageRole) }}</span>
                <span class="msg-time">{{ formatTime(item.createTime) }}</span>
              </div>
              <div class="msg-bubble">
                <ChatMessageContent
                  :content="item.messageContent"
                  :variant="messageContentVariant(item.messageRole)"
                />
              </div>
            </div>
          </div>
          <div v-if="!messageLoading && !messageList.length" class="message-empty">
            <i class="el-icon-chat-line-round" />
            <p>暂无聊天记录</p>
          </div>
        </div>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import {
  pageChatSession,
  deleteChatSession,
  deleteBatchChatSession
} from '@/api/chat_session'
import { listChatMessage } from '@/api/chat_message'
import Pagination from '@/components/Pagination'
import ChatMessageContent from '@/components/ChatMessageContent'

export default {
  name: 'ChatSession',
  components: {
    Pagination,
    ChatMessageContent
  },
  data() {
    return {
      loading: true,
      ids: [],
      multiple: true,
      total: 0,
      chatSessionList: [],
      messageDrawer: false,
      messageLoading: false,
      messageList: [],
      activeSession: {},
      queryParams: {
        current: 1,
        size: 10,
        sessionKeyword: null,
        visitorName:  null,
        sessionStatus:  null,
        robotName:  null,
        channelName:  null,
        realName:  null
      },
      sessionStatusEnumMap: { 1: '进行中', 2: '人工接管中', 3: '已结束' },
      summaryPollTimer: null
    }
  },
  created() {
    this.getList()
  },
  beforeDestroy() {
    this.stopSummaryPoll()
  },
  methods: {
    buildSearchEntity() {
      const { current, size, sessionKeyword, ...rest } = this.queryParams
      const entity = { ...rest }
      const keyword = (sessionKeyword || '').trim()
      if (keyword) {
        if (/^\d+$/.test(keyword)) {
          entity.id = Number(keyword)
        } else {
          entity.sessionNo = keyword
        }
      }
      return entity
    },
    /** 查询会话详情管理列表（范围查询绑定 xxxRange，传参拆成 xxxStart/xxxEnd） */
    getList() {
      this.loading = true
      const { current, size } = this.queryParams
      pageChatSession(current, size, this.buildSearchEntity()).then(response => {
        const pageData = response.data
        this.chatSessionList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
        this.syncSummaryPoll()
      }).catch(() => {
        this.loading = false
      })
    },
    isSummaryGenerating(row) {
      return row && row.summaryStatus === 1
    },
    syncSummaryPoll() {
      const hasPending = (this.chatSessionList || []).some(row => this.isSummaryGenerating(row))
      if (hasPending && !this.summaryPollTimer) {
        this.summaryPollTimer = setInterval(() => {
          this.refreshSummaries()
        }, 4000)
      } else if (!hasPending) {
        this.stopSummaryPoll()
      }
    },
    refreshSummaries() {
      const hasPending = (this.chatSessionList || []).some(row => this.isSummaryGenerating(row))
      if (!hasPending) {
        this.stopSummaryPoll()
        return
      }
      const { current, size } = this.queryParams
      pageChatSession(current, size, this.buildSearchEntity()).then(response => {
        const pageData = response.data
        this.chatSessionList = pageData.records || []
        this.syncSummaryPoll()
      }).catch(() => {})
    },
    stopSummaryPoll() {
      if (this.summaryPollTimer) {
        clearInterval(this.summaryPollTimer)
        this.summaryPollTimer = null
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.current = 1
      this.queryParams.size = this.queryParams.size || 10
      this.queryParams.sessionKeyword = null
      this.queryParams.visitorName = null
      this.queryParams.sessionStatus = null
      this.queryParams.robotName = null
      this.queryParams.channelName = null
      this.queryParams.realName = null
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    /** 枚举列展示：根据 value 取 label，无则显示原值 */
    getEnumLabel(val, map) {
      if (map == null || map[val] === undefined) return val
      return map[val]
    },
    getStatusTagType(status) {
      const map = { 1: 'success', 2: 'warning', 3: 'info' }
      return map[status] || 'info'
    },
    formatTime(val) {
      if (!val) return '—'
      return String(val).replace('T', ' ').slice(0, 19)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteChatSession(ids)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 批量删除按钮操作 */
    handleDeleteBatch() {
      const ids = this.ids
      this.$confirm('是否确认删除选中的' + ids.length + '条数据？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteBatchChatSession(ids)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
    },
    /** 查看消息 */
    handleViewMessages(row) {
      this.activeSession = row || {}
      this.messageDrawer = true
      this.messageLoading = true
      this.messageList = []
      listChatMessage({ sessionId: row.id }).then(res => {
        this.messageList = res.data || []
        this.$nextTick(() => this.scrollMessagesToBottom())
      }).finally(() => {
        this.messageLoading = false
      })
    },
    scrollMessagesToBottom() {
      const box = this.$refs.messageBox
      if (box) {
        box.scrollTop = box.scrollHeight
      }
    },
    messageRoleClass(role) {
      if (role === 1) return 'visitor'
      if (role === 3) return 'agent'
      return 'bot'
    },
    messageContentVariant(role) {
      if (role === 1) return 'bot'
      if (role === 3) return 'user'
      return 'agent'
    },
    messageRoleLabel(role) {
      if (role === 1) return '访客'
      if (role === 3) return '人工客服'
      return 'AI 客服'
    },
    messageRoleIcon(role) {
      if (role === 1) return 'el-icon-user'
      if (role === 3) return 'el-icon-headset'
      return 'el-icon-service'
    },
    /** 分页大小改变 */
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.getList()
    },
    /** 当前页改变 */
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getList()
    }
  }
}
</script>

<style scoped lang="scss">
.session-record-page {
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;

    &__main {
      h2 {
        margin: 0 0 6px;
        font-size: 22px;
        font-weight: 600;
        color: #1e293b;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #64748b;
        line-height: 1.5;
      }
    }
  }

  .visitor-name {
    font-weight: 500;
    color: #334155;
  }

  .session-id {
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    color: #475569;
    font-weight: 600;
  }

  .session-no {
    font-family: Consolas, Monaco, monospace;
    font-size: 12px;
    color: #64748b;
  }

  .session-summary {
    color: #64748b;
    font-size: 13px;
  }

  .summary-loading {
    color: #409eff;
    font-size: 13px;

    i {
      margin-right: 4px;
    }
  }

  .summary-failed {
    color: #94a3b8;
    font-size: 13px;
  }

  .danger-text {
    color: #f56c6c !important;
  }
}

.message-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8fafc;
}

::v-deep .session-message-drawer {
  .el-drawer__body {
    padding: 0;
    overflow: hidden;
  }
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;

  &__info {
    min-width: 0;

    h3 {
      margin: 0 0 4px;
      font-size: 17px;
      font-weight: 600;
      color: #1e293b;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.drawer-close {
  font-size: 18px;
  color: #94a3b8;
  padding: 4px;

  &:hover {
    color: #475569;
  }
}

.message-box {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}

.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;

  i {
    font-size: 44px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  align-items: flex-start;

  &.visitor {
    flex-direction: row;

    .msg-bubble {
      background: #fff;
      border: 1px solid #e2e8f0;
      color: #334155;
      border-top-left-radius: 4px;
    }
  }

  &.agent,
  &.bot {
    flex-direction: row-reverse;

    .msg-main {
      align-items: flex-end;
    }

    .msg-label {
      flex-direction: row-reverse;
    }
  }

  &.agent .msg-bubble {
    background: linear-gradient(135deg, #14b8a6, #0d9488);
    color: #fff;
    border: none;
    border-top-right-radius: 4px;
  }

  &.bot .msg-bubble {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    color: #9a3412;
    border-top-right-radius: 4px;
  }
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;

  &.visitor {
    background: #e0f2fe;
    color: #0284c7;
  }

  &.agent {
    background: #ccfbf1;
    color: #0f766e;
  }

  &.bot {
    background: #ffedd5;
    color: #c2410c;
  }
}

.msg-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 78%;
  min-width: 0;
}

.msg-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 6px;
  padding: 0 2px;
}

.msg-time {
  font-size: 11px;
  color: #cbd5e1;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  line-height: 1.65;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}
</style>
