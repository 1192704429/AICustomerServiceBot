<template>
  <div v-loading="loading" class="app-container robot-manage-page">
    <div class="page-header">
      <div class="page-header__main">
        <h2>机器人管理</h2>
        <p>创建并管理企业客服机器人。新建后默认下线，绑定知识库并配置大模型后方可上线。</p>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新建机器人</el-button>
    </div>

    <div class="toolbar">
      <el-input
        v-model="queryParams.robotName"
        placeholder="搜索机器人名称"
        prefix-icon="el-icon-search"
        clearable
        class="toolbar__search"
        @keyup.enter.native="handleQuery"
        @clear="handleQuery"
      />
      <el-select
        v-model="queryParams.status"
        placeholder="全部状态"
        clearable
        class="toolbar__filter"
        @change="handleQuery"
      >
        <el-option label="已上线" :value="1" />
        <el-option label="已下线" :value="0" />
      </el-select>
      <el-button @click="resetQuery">重置</el-button>
    </div>

    <div v-if="!loading && robotList.length === 0" class="empty-state">
      <i class="el-icon-chat-dot-round" />
      <p>还没有机器人，点击右上角创建一个吧</p>
      <el-button type="primary" plain @click="handleAdd">新建机器人</el-button>
    </div>

    <div v-else class="robot-grid">
      <div
        v-for="robot in robotList"
        :key="robot.id"
        class="robot-card"
        :class="{ 'is-online': robot.status === 1 }"
      >
        <div class="robot-card__header">
          <div class="robot-card__avatar">
            <img v-if="robot.robotAvatar" :src="robot.robotAvatar" alt="avatar">
            <i v-else class="el-icon-service" />
          </div>
          <div class="robot-card__info">
            <div class="robot-card__title-row">
              <h3 class="robot-card__name">{{ robot.robotName }}</h3>
              <span class="robot-card__status" :class="robot.status === 1 ? 'is-online' : 'is-offline'">
                <i class="status-dot" />
                {{ robot.status === 1 ? '已上线' : '已下线' }}
              </span>
            </div>
            <p class="robot-card__desc">{{ robot.robotDesc || '暂无介绍' }}</p>
          </div>
        </div>

        <div class="robot-card__stats">
          <div class="stat-item" :class="{ 'is-ready': getRecommendCount(robot.id) > 0 }">
            <span class="stat-value">{{ getRecommendCount(robot.id) }}</span>
            <span class="stat-label"><i class="el-icon-chat-line-round" />推荐问题</span>
          </div>
          <div class="stat-item" :class="{ 'is-ready': getKnowledgeCount(robot.id) > 0 }">
            <span class="stat-value">{{ getKnowledgeCount(robot.id) }}</span>
            <span class="stat-label"><i class="el-icon-collection" />知识库</span>
          </div>
          <div class="stat-item" :class="{ 'is-ready': isLlmConfigured(robot.id) }">
            <span class="stat-value">
              <i :class="isLlmConfigured(robot.id) ? 'el-icon-check' : 'el-icon-close'" />
            </span>
            <span class="stat-label"><i class="el-icon-cpu" />大模型</span>
          </div>
        </div>

        <div v-if="getBlockers(robot).length" class="robot-card__tips">
          <i class="el-icon-warning-outline" />
          <span>{{ getBlockers(robot).join('；') }}</span>
        </div>

        <div class="robot-card__footer">
          <div class="robot-card__actions-main">
            <el-button
              v-if="robot.status === 0"
              type="primary"
              size="small"
              :disabled="!canEnable(robot)"
              icon="el-icon-upload2"
              @click="handleEnable(robot)"
            >
              上线
            </el-button>
            <el-button
              v-else
              size="small"
              icon="el-icon-download"
              @click="handleDisable(robot)"
            >
              下线
            </el-button>
            <el-button size="small" icon="el-icon-edit" @click="handleUpdate(robot)">编辑</el-button>
          </div>
          <div class="robot-card__actions-sub">
            <button type="button" class="action-chip" @click="openBindDialog(robot)">
              <i class="el-icon-link" />绑定知识库
            </button>
            <button type="button" class="action-chip" @click="openRecommendDialog(robot)">
              <i class="el-icon-chat-dot-round" />推荐问题
            </button>
            <button type="button" class="action-chip action-chip--danger" @click="handleDelete(robot)">
              <i class="el-icon-delete" />删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <pagination
      v-if="total > 0"
      :total="total"
      :current-page.sync="queryParams.current"
      :page-size.sync="queryParams.size"
      :page-sizes="[6, 12, 24]"
      layout="total, sizes, prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新建/编辑 -->
    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body @closed="reset">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="机器人名称" prop="robotName">
          <el-input v-model="form.robotName" placeholder="给机器人起个名字" />
        </el-form-item>
        <el-form-item label="机器人头像">
          <img-upload v-model="form.robotAvatar" :limit="1" />
        </el-form-item>
        <el-form-item label="机器人介绍">
          <el-input v-model="form.robotDesc" type="textarea" :rows="2" placeholder="简要介绍机器人用途" />
        </el-form-item>
        <el-form-item label="欢迎语" prop="welcomeMessage">
          <el-input v-model="form.welcomeMessage" type="textarea" :rows="2" placeholder="用户进入对话时的欢迎语" />
        </el-form-item>
        <el-form-item label="默认回复" prop="defaultReply">
          <el-input v-model="form.defaultReply" type="textarea" :rows="2" placeholder="无法回答时的默认回复" />
        </el-form-item>
        <el-form-item label="系统提示词">
          <el-input v-model="form.systemPrompt" type="textarea" :rows="3" placeholder="定义机器人角色与回答风格" />
        </el-form-item>
        <el-alert
          v-if="!form.id"
          title="新建机器人默认为下线状态，完成知识库绑定和大模型配置后可上线"
          type="info"
          :closable="false"
          show-icon
        />
      </el-form>
      <div slot="footer">
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 绑定知识库 -->
    <el-dialog
      title="绑定知识库"
      :visible.sync="bindOpen"
      width="520px"
      append-to-body
    >
      <p v-if="bindRobot" class="bind-tip">
        为「{{ bindRobot.robotName }}」选择要关联的知识库（仅显示已上线且解析成功的知识）
      </p>
      <el-select
        v-model="selectedKnowledgeIds"
        multiple
        filterable
        placeholder="请选择知识库"
        style="width: 100%;"
      >
        <el-option
          v-for="item in knowledgeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <div slot="footer">
        <el-button @click="bindOpen = false">取消</el-button>
        <el-button type="primary" :loading="binding" @click="submitBind">保存绑定</el-button>
      </div>
    </el-dialog>

    <!-- 推荐问题管理 -->
    <el-dialog
      title="推荐问题"
      :visible.sync="recommendOpen"
      width="640px"
      append-to-body
      @closed="resetRecommendForm"
    >
      <p v-if="recommendRobot" class="bind-tip">
        为「{{ recommendRobot.robotName }}」配置用户端快捷提问，启用状态下最多展示 6 条（按排序值升序）
      </p>
      <div class="recommend-toolbar">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAddRecommend">新增问题</el-button>
      </div>
      <el-table v-loading="recommendLoading" :data="recommendList" size="small" empty-text="暂无推荐问题">
        <el-table-column prop="questionText" label="问题内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sortNum" label="排序" width="70" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="mini">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="handleEditRecommend(row)">编辑</el-button>
            <el-button type="text" size="small" class="danger-text" @click="handleDeleteRecommend(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        :title="recommendFormTitle"
        :visible.sync="recommendFormOpen"
        width="480px"
        append-to-body
        @closed="resetRecommendFormFields"
      >
        <el-form ref="recommendForm" :model="recommendForm" :rules="recommendRules" label-width="80px">
          <el-form-item label="问题内容" prop="questionText">
            <el-input
              v-model="recommendForm.questionText"
              type="textarea"
              :rows="2"
              placeholder="例如：如何联系人工客服？"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="排序值" prop="sortNum">
            <el-input-number v-model="recommendForm.sortNum" :min="0" :max="999" controls-position="right" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="recommendForm.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="recommendFormOpen = false">取消</el-button>
          <el-button type="primary" :loading="recommendSubmitting" @click="submitRecommendForm">确定</el-button>
        </div>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUserInfo } from '@/api/user'
import {
  pageAiRobot,
  getAiRobotById,
  saveAiRobot,
  updateAiRobot,
  deleteAiRobot,
  enableAiRobot,
  disableAiRobot,
  checkAiRobotEnable
} from '@/api/ai_robot'
import { listRobotKnowledge, syncRobotKnowledge } from '@/api/robot_knowledge'
import {
  listRobotRecommendQuestion,
  saveRobotRecommendQuestion,
  updateRobotRecommendQuestion,
  deleteRobotRecommendQuestion
} from '@/api/robot_recommend_question'
import { listKnowledge } from '@/views/knowledgeManagement/api/knowledge'
import ImgUpload from '@/components/ImgUpload'
import Pagination from '@/components/Pagination'

export default {
  name: 'RobotManagePage',
  components: { ImgUpload, Pagination },
  data() {
    return {
      loading: false,
      submitting: false,
      binding: false,
      recommendLoading: false,
      recommendSubmitting: false,
      enterpriseId: null,
      llmConfigured: false,
      robotList: [],
      knowledgeBindings: [],
      recommendQuestions: [],
      knowledgeOptions: [],
      enableChecks: {},
      total: 0,
      title: '',
      open: false,
      bindOpen: false,
      bindRobot: null,
      selectedKnowledgeIds: [],
      recommendOpen: false,
      recommendFormOpen: false,
      recommendRobot: null,
      recommendList: [],
      recommendForm: {},
      recommendFormTitle: '新增推荐问题',
      recommendRules: {
        questionText: [{ required: true, message: '问题内容不能为空', trigger: 'blur' }],
        sortNum: [{ required: true, message: '排序值不能为空', trigger: 'change' }]
      },
      queryParams: {
        current: 1,
        size: 12,
        robotName: null,
        status: null
      },
      form: {},
      rules: {
        robotName: [{ required: true, message: '机器人名称不能为空', trigger: 'blur' }],
        welcomeMessage: [{ required: true, message: '欢迎语不能为空', trigger: 'blur' }],
        defaultReply: [{ required: true, message: '默认回复不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['id'])
  },
  created() {
    this.initPage()
  },
  methods: {
    async initPage() {
      this.loading = true
      try {
        const userRes = await getUserInfo(this.id)
        this.enterpriseId = userRes.data && userRes.data.enterpriseId
        if (!this.enterpriseId) {
          this.$message.warning('当前账号未关联企业')
          return
        }
        await Promise.all([
          this.loadRobots(),
          this.loadBindings(),
          this.loadRecommendQuestions(),
          this.loadKnowledgeOptions()
        ])
      } finally {
        this.loading = false
      }
    },
    async loadRobots() {
      const { current, size, ...rest } = this.queryParams
      const res = await pageAiRobot(current, size, rest)
      const pageData = res.data || {}
      this.robotList = pageData.records || []
      this.total = Number(pageData.total) || 0
      await this.loadEnableChecks()
    },
    async loadBindings() {
      const res = await listRobotKnowledge({})
      this.knowledgeBindings = res.data || []
    },
    async loadRecommendQuestions() {
      const res = await listRobotRecommendQuestion({})
      this.recommendQuestions = res.data || []
    },
    async loadKnowledgeOptions() {
      const res = await listKnowledge({})
      const list = res.data || []
      // 仅展示解析成功且已上线的知识（与后端上线校验一致）
      this.knowledgeOptions = list
        .filter(item => item.status === 1 && item.online)
        .map(item => ({ label: item.name, value: item.id }))
    },
    async loadEnableChecks() {
      const checks = {}
      let llmConfigured = true
      await Promise.all(this.robotList.map(async robot => {
        const res = await checkAiRobotEnable(robot.id)
        checks[robot.id] = res.data || {}
        if (!checks[robot.id].llmConfigured) {
          llmConfigured = false
        }
      }))
      this.enableChecks = checks
      this.llmConfigured = llmConfigured
    },
    getKnowledgeCount(robotId) {
      return this.knowledgeBindings.filter(item => item.robotId === robotId).length
    },
    getRecommendCount(robotId) {
      return this.recommendQuestions.filter(item => item.robotId === robotId && item.status === 1).length
    },
    getBlockers(robot) {
      const check = this.enableChecks[robot.id]
      return (check && check.blockers) || []
    },
    canEnable(robot) {
      const check = this.enableChecks[robot.id]
      return check && check.canEnable
    },
    isLlmConfigured(robotId) {
      const check = this.enableChecks[robotId]
      return check && check.llmConfigured
    },
    handleQuery() {
      this.queryParams.current = 1
      this.refreshList()
    },
    resetQuery() {
      this.queryParams.robotName = null
      this.queryParams.status = null
      this.handleQuery()
    },
    async refreshList() {
      this.loading = true
      try {
        await Promise.all([this.loadRobots(), this.loadBindings(), this.loadRecommendQuestions()])
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      this.reset()
      this.form = {
        enterpriseId: this.enterpriseId,
        welcomeMessage: '您好，我是智能客服，有什么可以帮您？',
        defaultReply: '抱歉，我暂时无法回答这个问题，请联系人工客服。'
      }
      this.open = true
      this.title = '新建机器人'
    },
    handleUpdate(row) {
      this.reset()
      getAiRobotById(row.id).then(res => {
        this.form = { ...res.data }
        this.open = true
        this.title = '编辑机器人'
      })
    },
    reset() {
      this.form = {}
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.submitting = true
        const payload = { ...this.form, enterpriseId: this.enterpriseId }
        const req = payload.id ? updateAiRobot(payload) : saveAiRobot(payload)
        req.then(() => {
          this.$message.success(payload.id ? '修改成功' : '创建成功，机器人已默认下线')
          this.open = false
          this.refreshList()
        }).finally(() => {
          this.submitting = false
        })
      })
    },
    handleEnable(robot) {
      enableAiRobot(robot.id).then(() => {
        this.$message.success('机器人已上线')
        this.refreshList()
      })
    },
    handleDisable(robot) {
      this.$confirm(`确认下线「${robot.robotName}」？`, '提示', { type: 'warning' })
        .then(() => disableAiRobot(robot.id))
        .then(() => {
          this.$message.success('机器人已下线')
          this.refreshList()
        })
        .catch(() => {})
    },
    handleDelete(robot) {
      this.$confirm(`确认删除「${robot.robotName}」？`, '警告', { type: 'warning' })
        .then(() => deleteAiRobot(robot.id))
        .then(() => {
          this.$message.success('删除成功')
          this.refreshList()
        })
        .catch(() => {})
    },
    openBindDialog(robot) {
      this.bindRobot = robot
      this.selectedKnowledgeIds = this.knowledgeBindings
        .filter(item => item.robotId === robot.id)
        .map(item => item.knowledgeId)
      this.bindOpen = true
    },
    submitBind() {
      if (!this.bindRobot) return
      this.binding = true
      syncRobotKnowledge({
        robotId: this.bindRobot.id,
        knowledgeIds: this.selectedKnowledgeIds
      }).then(() => {
        this.$message.success('知识库绑定已更新')
        this.bindOpen = false
        this.refreshList()
      }).finally(() => {
        this.binding = false
      })
    },
    openRecommendDialog(robot) {
      this.recommendRobot = robot
      this.recommendOpen = true
      this.loadRecommendList(robot.id)
    },
    loadRecommendList(robotId) {
      this.recommendLoading = true
      listRobotRecommendQuestion({ robotId })
        .then(res => {
          this.recommendList = res.data || []
        })
        .finally(() => {
          this.recommendLoading = false
        })
    },
    handleAddRecommend() {
      this.recommendFormTitle = '新增推荐问题'
      this.recommendForm = {
        robotId: this.recommendRobot.id,
        questionText: '',
        sortNum: this.recommendList.length,
        status: 1
      }
      this.recommendFormOpen = true
    },
    handleEditRecommend(row) {
      this.recommendFormTitle = '编辑推荐问题'
      this.recommendForm = { ...row }
      this.recommendFormOpen = true
    },
    resetRecommendFormFields() {
      this.recommendForm = {}
      if (this.$refs.recommendForm) {
        this.$refs.recommendForm.resetFields()
      }
    },
    resetRecommendForm() {
      this.recommendRobot = null
      this.recommendList = []
      this.recommendFormOpen = false
      this.resetRecommendFormFields()
    },
    submitRecommendForm() {
      this.$refs.recommendForm.validate(valid => {
        if (!valid || !this.recommendRobot) return
        this.recommendSubmitting = true
        const payload = { ...this.recommendForm, robotId: this.recommendRobot.id }
        const req = payload.id
          ? updateRobotRecommendQuestion(payload)
          : saveRobotRecommendQuestion(payload)
        req.then(() => {
          this.$message.success(payload.id ? '修改成功' : '新增成功')
          this.recommendFormOpen = false
          this.loadRecommendList(this.recommendRobot.id)
          this.loadRecommendQuestions()
        }).finally(() => {
          this.recommendSubmitting = false
        })
      })
    },
    handleDeleteRecommend(row) {
      this.$confirm(`确认删除推荐问题「${row.questionText}」？`, '提示', { type: 'warning' })
        .then(() => deleteRobotRecommendQuestion(row.id))
        .then(() => {
          this.$message.success('删除成功')
          this.loadRecommendList(this.recommendRobot.id)
          this.loadRecommendQuestions()
        })
        .catch(() => {})
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.queryParams.current = 1
      this.refreshList()
    },
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.refreshList()
    }
  }
}
</script>

<style scoped lang="scss">
.robot-manage-page {
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;

    h2 {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #909399;
      max-width: 560px;
      line-height: 1.6;
    }
  }

  .toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    &__search {
      width: 260px;
    }

    &__filter {
      width: 140px;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    color: #909399;
    background: #fafafa;
    border: 1px dashed #dcdfe6;
    border-radius: 12px;

    i {
      font-size: 48px;
      margin-bottom: 16px;
      color: #c0c4cc;
    }

    p {
      margin: 0 0 16px;
      font-size: 15px;
    }
  }

  .robot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .robot-card {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      border-color: #dcdfe6;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }

    &.is-online {
      border-color: rgba(103, 194, 58, 0.35);

      .robot-card__header {
        background: linear-gradient(135deg, #f0f9eb 0%, #fafcf8 100%);
      }
    }

    &__header {
      display: flex;
      gap: 14px;
      padding: 20px 20px 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
    }

    &__avatar {
      flex-shrink: 0;
      width: 52px;
      height: 52px;
      border-radius: 12px;
      overflow: hidden;
      background: linear-gradient(145deg, #409eff, #79bbff);
      border: 2px solid #fff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      i {
        font-size: 24px;
        color: #fff;
      }
    }

    &__info {
      flex: 1;
      min-width: 0;
    }

    &__title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 6px;
    }

    &__name {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 10px;
      line-height: 1.4;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.is-online {
        color: #529b2e;
        background: rgba(103, 194, 58, 0.12);

        .status-dot {
          background: #67c23a;
          box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
        }
      }

      &.is-offline {
        color: #909399;
        background: rgba(144, 147, 153, 0.1);

        .status-dot {
          background: #c0c4cc;
        }
      }
    }

    &__desc {
      margin: 0;
      font-size: 13px;
      color: #909399;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    &__stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      margin: 0 20px;
      padding: 14px 0;
      border-top: 1px solid #f0f2f5;
      border-bottom: 1px solid #f0f2f5;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        position: relative;
        color: #909399;

        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 28px;
          background: #f0f2f5;
        }

        &.is-ready {
          .stat-value {
            color: #409eff;
          }

          .stat-label {
            color: #606266;
          }
        }

        .stat-value {
          font-size: 20px;
          font-weight: 600;
          color: #c0c4cc;
          line-height: 1.2;

          i {
            font-size: 18px;
            font-weight: bold;
          }
        }

        .stat-label {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 12px;
          color: #909399;

          i {
            font-size: 12px;
          }
        }
      }
    }

    &__tips {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin: 12px 20px 0;
      padding: 8px 10px;
      font-size: 12px;
      color: #e6a23c;
      background: #fdf6ec;
      border-radius: 6px;
      line-height: 1.5;

      i {
        margin-top: 2px;
        flex-shrink: 0;
      }
    }

    &__footer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 20px 16px;
      margin-top: auto;
    }

    &__actions-main {
      display: flex;
      gap: 8px;
    }

    &__actions-sub {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .action-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        font-size: 12px;
        color: #606266;
        background: #f5f7fa;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s ease, color 0.15s ease;

        i {
          font-size: 13px;
        }

        &:hover {
          background: #ecf5ff;
          color: #409eff;
        }

        &--danger:hover {
          background: #fef0f0;
          color: #f56c6c;
        }
      }
    }
  }

  .bind-tip {
    margin: 0 0 12px;
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
  }

  .recommend-toolbar {
    margin-bottom: 12px;
  }

  .danger-text {
    color: #f56c6c;
  }
}
</style>
