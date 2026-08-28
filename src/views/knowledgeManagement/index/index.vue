<template>
  <div class="app-container knowledge-page">
    <div class="knowledge-layout">
      <!-- 左侧分类 -->
      <aside class="type-panel">
        <div class="type-panel-header">
          <div class="type-panel-header-main">
            <span class="type-panel-icon"><i class="el-icon-folder-opened" /></span>
            <div>
              <div class="type-panel-title">知识分类</div>
              <div class="type-panel-subtitle">共 {{ typeList.length }} 个分类</div>
            </div>
          </div>
          <el-button type="text" class="type-add-btn" icon="el-icon-plus" @click="handleAddType">新建</el-button>
        </div>
        <div class="type-search-wrap">
          <el-input
            v-model="typeKeyword"
            placeholder="搜索分类名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            class="type-search"
          />
        </div>
        <div v-loading="typeLoading" class="type-list-wrap">
          <div
            v-for="item in filteredTypeList"
            :key="item.id"
            :class="['type-item', { active: selectedType && selectedType.id === item.id }]"
            @click="selectType(item)"
          >
            <span class="type-item-icon"><i class="el-icon-collection-tag" /></span>
            <span class="type-name" :title="item.typeName">{{ item.typeName }}</span>
            <div class="type-item-actions" @click.stop>
              <el-button type="text" icon="el-icon-edit" @click="handleEditType(item)" />
              <el-button type="text" icon="el-icon-delete" style="color: #f56c6c;" @click="handleDeleteType(item)" />
            </div>
          </div>
          <el-empty v-if="!typeLoading && !filteredTypeList.length" description="暂无分类，请先新建" :image-size="72" />
        </div>
      </aside>

      <!-- 右侧知识 -->
      <section class="knowledge-panel">
        <template v-if="selectedType">
          <div class="knowledge-panel-top">
            <div class="knowledge-panel-info">
              <div class="knowledge-type-badge">当前分类</div>
              <h2 class="knowledge-panel-title">{{ selectedType.typeName }}</h2>
              <p class="knowledge-panel-desc">共 <strong>{{ total }}</strong> 条知识</p>
            </div>
            <div class="knowledge-toolbar">
              <el-input
                v-model="queryParams.name"
                placeholder="搜索知识名称"
                clearable
                size="small"
                prefix-icon="el-icon-search"
                class="toolbar-input"
                @keyup.enter.native="handleQuery"
                @clear="handleQuery"
              />
              <el-select
                v-model="queryParams.status"
                placeholder="解析状态"
                clearable
                size="small"
                class="toolbar-select"
                @change="handleQuery"
              >
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-select
                v-model="queryParams.online"
                placeholder="上线状态"
                clearable
                size="small"
                class="toolbar-select"
                @change="handleQuery"
              >
                <el-option :value="true" label="已上线" />
                <el-option :value="false" label="未上线" />
              </el-select>
              <el-button size="medium" plain icon="el-icon-refresh" @click="resetQuery">重置</el-button>
              <el-button size="medium" type="primary" icon="el-icon-plus" @click="handleAdd">新增知识</el-button>
            </div>
          </div>

          <div class="knowledge-table-wrap">
            <el-table
              ref="knowledgeTable"
              v-loading="loading"
              :data="knowledgeList"
              class="knowledge-table"
              :row-class-name="tableRowClassName"
              style="width: 100%"
            >
              <el-table-column label="知识名称" min-width="180" header-align="center" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                  <div class="knowledge-name-cell">
                    <span class="knowledge-file-icon"><i :class="getFileIcon(scope.row.fileFormatType)" /></span>
                    <span class="knowledge-name-text">{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="文件名" prop="fullFileName" min-width="150" header-align="center" :show-overflow-tooltip="true" />
              <el-table-column label="格式" align="center" header-align="center" width="88">
                <template slot-scope="scope">
                  <enum-tag :value="scope.row.fileFormatType" :label-map="fileFormatTypeMap" :type-map="fileFormatTypeColorMap" />
                </template>
              </el-table-column>
              <el-table-column label="大小" prop="fileSizeKb" align="center" header-align="center" width="100" class-name="size-column">
                <template slot-scope="scope">
                  <span class="file-size-text">{{ formatFileSize(scope.row.fileSizeKb) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="解析状态" align="center" header-align="center" width="108">
                <template slot-scope="scope">
                  <enum-tag :value="scope.row.status" :label-map="statusEnumMap" :type-map="statusTypeMap" />
                </template>
              </el-table-column>
              <el-table-column label="上线" align="center" header-align="center" width="88">
                <template slot-scope="scope">
                  <enum-tag :value="scope.row.online" :label-map="onlineEnumMap" :type-map="onlineTypeMap" />
                </template>
              </el-table-column>
              <el-table-column label="创建时间" prop="createTime" align="center" header-align="center" min-width="158" :show-overflow-tooltip="true" />
              <el-table-column label="操作" align="center" header-align="center" width="240" class-name="action-column">
                <template slot-scope="scope">
                  <div class="action-cell">
                    <el-button
                      v-if="scope.row.status === 1"
                      type="text"
                      size="small"
                      icon="el-icon-tickets"
                      class="action-btn action-chunks"
                      @click="handleViewChunks(scope.row)"
                    >切片查看</el-button>
                    <el-button
                      v-if="canPublishOnline(scope.row)"
                      type="text"
                      size="small"
                      icon="el-icon-upload2"
                      class="action-btn action-publish publish-btn"
                      :loading="scope.row._publishing"
                      @click="handlePublishOnline(scope.row)"
                    >上线</el-button>
                    <el-button
                      type="text"
                      size="small"
                      icon="el-icon-delete"
                      class="action-btn action-delete danger-btn"
                      @click="handleDeleteKnowledge(scope.row)"
                    >删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="knowledge-pagination">
            <pagination
              :total="total"
              :current-page.sync="queryParams.current"
              :page-size.sync="queryParams.size"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </template>

        <div v-else class="knowledge-empty">
          <div class="knowledge-empty-inner">
            <i class="el-icon-folder-opened knowledge-empty-icon" />
            <p class="knowledge-empty-title">请选择分类</p>
            <p class="knowledge-empty-desc">从左侧选择或新建知识分类，即可管理该分类下的知识</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 分类对话框 -->
    <el-dialog
      :title="typeDialogTitle"
      :visible.sync="typeDialogOpen"
      width="480px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="90px">
        <el-form-item label="分类名称" prop="typeName">
          <el-input v-model="typeForm.typeName" placeholder="请输入分类名称" maxlength="255" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="typeDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="typeSubmitting" @click="submitTypeForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 新增知识对话框 -->
    <el-dialog
      title="新增知识"
      :visible.sync="knowledgeDialogOpen"
      width="640px"
      append-to-body
      destroy-on-close
      @close="resetKnowledgeForm"
    >
      <el-form ref="knowledgeFormRef" :model="knowledgeForm" :rules="knowledgeRules" label-width="100px">
        <el-form-item label="所属分类">
          <el-input :value="selectedType ? selectedType.typeName : ''" disabled />
        </el-form-item>
        <el-form-item label="上传文件" prop="fileUrl">
          <el-upload
            :action="uploadAction"
            :headers="uploadHeaders"
            :limit="1"
            :file-list="uploadFileList"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleUploadRemove"
            :on-exceed="handleUploadExceed"
          >
            <el-button size="small" type="primary" icon="el-icon-upload2">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">上传后将自动解析，知识名称取文件名（不含后缀）</div>
          </el-upload>
        </el-form-item>
        <el-form-item v-if="knowledgeForm.name" label="知识名称">
          <el-input :value="knowledgeForm.name" disabled />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="knowledgeDialogOpen = false">取消</el-button>
        <el-button type="primary" :loading="knowledgeSubmitting" @click="submitKnowledgeForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 切片查看对话框 -->
    <el-dialog
      :title="chunkDialogTitle"
      :visible.sync="chunkDialogOpen"
      width="860px"
      append-to-body
      destroy-on-close
      class="chunk-dialog"
      @close="resetChunks"
    >
      <div class="chunk-toolbar">
        <el-input
          v-model="chunkQuery.keyword"
          placeholder="搜索切片内容"
          clearable
          size="small"
          prefix-icon="el-icon-search"
          class="chunk-search"
          @keyup.enter.native="handleChunkQuery"
          @clear="handleChunkQuery"
        />
        <el-button size="small" type="primary" icon="el-icon-search" @click="handleChunkQuery">搜索</el-button>
      </div>
      <el-table
        v-loading="chunkLoading"
        :data="chunkList"
        class="chunk-table"
        max-height="420"
      >
        <el-table-column label="序号" prop="orderNum" align="center" width="80">
          <template slot-scope="scope">
            {{ scope.row.orderNum != null ? scope.row.orderNum + 1 : scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="切片内容" prop="chunkText" min-width="360" :show-overflow-tooltip="true" />
        <el-table-column label="更新时间" prop="updateTime" align="center" width="168" :show-overflow-tooltip="true" />
      </el-table>
      <div class="chunk-pagination">
        <pagination
          :total="chunkTotal"
          :current-page.sync="chunkQuery.current"
          :page-size.sync="chunkQuery.size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadChunks"
          @current-change="loadChunks"
        />
      </div>
      <div slot="footer">
        <el-button @click="chunkDialogOpen = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  pageKnowledge,
  saveKnowledge,
  deleteKnowledge,
  publishKnowledgeOnline,
  pageKnowledgeChunks
} from '../api/knowledge'
import {
  listKnowledgeType,
  saveKnowledgeType,
  updateKnowledgeType,
  deleteKnowledgeType
} from '../api/knowledge_type'
import Pagination from '@/components/Pagination'
import EnumTag from '@/components/EnumTag'
import { getToken } from '@/utils/auth'

export default {
  name: 'KnowledgeManagement',
  components: {
    Pagination,
    EnumTag
  },
  data() {
    return {
      typeLoading: false,
      typeList: [],
      typeKeyword: '',
      selectedType: null,
      typeDialogOpen: false,
      typeDialogTitle: '',
      typeSubmitting: false,
      typeForm: {},
      typeRules: {
        typeName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }]
      },
      loading: false,
      knowledgeList: [],
      total: 0,
      queryParams: {
        current: 1,
        size: 10,
        knowledgeTypeId: null,
        name: '',
        status: null,
        online: null
      },
      knowledgeDialogOpen: false,
      knowledgeSubmitting: false,
      knowledgeForm: {},
      uploadFileList: [],
      knowledgeRules: {
        fileUrl: [{ required: true, message: '请上传文件', trigger: 'change' }]
      },
      statusOptions: [
        { value: 0, label: '解析中' },
        { value: 1, label: '解析成功' },
        { value: 2, label: '解析失败' }
      ],
      statusEnumMap: {
        0: '解析中',
        1: '解析成功',
        2: '解析失败'
      },
      statusTypeMap: {
        0: 'warning',
        1: 'success',
        2: 'danger'
      },
      onlineEnumMap: {
        true: '已上线',
        false: '未上线'
      },
      onlineTypeMap: {
        true: 'success',
        false: 'info'
      },
      fileFormatTypeMap: {
        0: '文档',
        1: '图片',
        2: 'PDF',
        3: 'Office'
      },
      fileFormatTypeColorMap: {
        0: 'info',
        1: 'success',
        2: 'danger',
        3: 'warning'
      },
      chunkDialogOpen: false,
      chunkLoading: false,
      chunkDialogTitle: '切片查看',
      chunkList: [],
      chunkTotal: 0,
      chunkKnowledgeId: null,
      chunkQuery: {
        current: 1,
        size: 10,
        keyword: ''
      },
      pollTimer: null
    }
  },
  computed: {
    filteredTypeList() {
      const keyword = (this.typeKeyword || '').trim().toLowerCase()
      if (!keyword) {
        return this.typeList
      }
      return this.typeList.filter(item => (item.typeName || '').toLowerCase().includes(keyword))
    },
    uploadAction() {
      return process.env.VUE_APP_BASE_API + '/upload/file/url'
    },
    uploadHeaders() {
      return {
        Authorization: getToken()
      }
    }
  },
  created() {
    this.loadTypeList()
  },
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    loadTypeList() {
      this.typeLoading = true
      listKnowledgeType({}).then(response => {
        this.typeList = response.data || []
        this.typeLoading = false
        if (this.typeList.length) {
          const currentId = this.selectedType && this.selectedType.id
          const matched = currentId ? this.typeList.find(item => item.id === currentId) : null
          this.selectType(matched || this.typeList[0])
        } else {
          this.selectedType = null
          this.knowledgeList = []
          this.total = 0
        }
      }).catch(() => {
        this.typeLoading = false
      })
    },
    selectType(item) {
      this.selectedType = item
      this.queryParams.knowledgeTypeId = item.id
      this.queryParams.current = 1
      this.getList()
    },
    handleAddType() {
      this.typeForm = {}
      this.typeDialogTitle = '新建分类'
      this.typeDialogOpen = true
    },
    handleEditType(item) {
      this.typeForm = { ...item }
      this.typeDialogTitle = '修改分类'
      this.typeDialogOpen = true
    },
    submitTypeForm() {
      this.$refs.typeFormRef.validate(valid => {
        if (!valid) {
          return
        }
        this.typeSubmitting = true
        const request = this.typeForm.id ? updateKnowledgeType(this.typeForm) : saveKnowledgeType(this.typeForm)
        request.then(() => {
          this.$message.success(this.typeForm.id ? '修改成功' : '新增成功')
          this.typeDialogOpen = false
          this.loadTypeList()
        }).finally(() => {
          this.typeSubmitting = false
        })
      })
    },
    handleDeleteType(item) {
      this.$confirm(`确认删除分类「${item.typeName}」吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteKnowledgeType(item.id).then(() => {
          this.$message.success('删除成功')
          if (this.selectedType && this.selectedType.id === item.id) {
            this.selectedType = null
          }
          this.loadTypeList()
        })
      }).catch(() => {})
    },
    getList() {
      if (!this.selectedType) {
        this.knowledgeList = []
        this.total = 0
        return
      }
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      pageKnowledge(current, size, { ...rest, knowledgeTypeId: this.selectedType.id }).then(response => {
        const pageData = response.data || {}
        this.knowledgeList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.syncPolling()
        this.layoutTable()
      }).finally(() => {
        this.loading = false
      })
    },
    syncPolling() {
      const hasParsing = this.knowledgeList.some(item => item.status === 0)
      if (hasParsing) {
        this.startPolling()
      } else {
        this.stopPolling()
      }
    },
    startPolling() {
      if (this.pollTimer) {
        return
      }
      this.pollTimer = setInterval(() => {
        if (!this.selectedType || this.loading) {
          return
        }
        const { current, size, ...rest } = this.queryParams
        pageKnowledge(current, size, { ...rest, knowledgeTypeId: this.selectedType.id }).then(response => {
          const pageData = response.data || {}
          this.knowledgeList = pageData.records || []
          this.total = Number(pageData.total) || 0
          if (!this.knowledgeList.some(item => item.status === 0)) {
            this.stopPolling()
          }
          this.layoutTable()
        })
      }, 5000)
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
    handleQuery() {
      this.queryParams.current = 1
      this.getList()
    },
    resetQuery() {
      this.queryParams.name = ''
      this.queryParams.status = null
      this.queryParams.online = null
      this.handleQuery()
    },
    handleSizeChange() {
      this.getList()
    },
    handleCurrentChange() {
      this.getList()
    },
    resetKnowledgeForm() {
      this.knowledgeForm = {}
      this.uploadFileList = []
    },
    handleAdd() {
      this.knowledgeForm = {
        knowledgeTypeId: this.selectedType.id,
        vectorization: true,
        status: 0
      }
      this.uploadFileList = []
      this.knowledgeDialogOpen = true
    },
    handleBeforeUpload(file) {
      const ext = this.getFileSuffix(file.name)
      const allowed = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp']
      if (!allowed.includes(ext)) {
        this.$message.error('不支持的文件格式')
        return false
      }
      this.$set(this.knowledgeForm, 'name', this.getNameWithoutSuffix(file.name))
      this.$set(this.knowledgeForm, 'fullFileName', file.name)
      this.$set(this.knowledgeForm, 'fileNameSuffix', ext)
      this.$set(this.knowledgeForm, 'fileSizeKb', Number((file.size / 1024).toFixed(2)))
      this.$set(this.knowledgeForm, 'fileFormatType', this.detectFileFormatType(ext))
      return true
    },
    handleUploadSuccess(response, file) {
      if (response.code !== 200) {
        this.$message.error(response.msg || '上传失败')
        this.uploadFileList = []
        return
      }
      this.$set(this.knowledgeForm, 'fileUrl', response.data)
      this.uploadFileList = [{ name: file.name, url: response.data }]
      this.$refs.knowledgeFormRef && this.$refs.knowledgeFormRef.validateField('fileUrl')
    },
    handleUploadRemove() {
      this.$set(this.knowledgeForm, 'fileUrl', '')
      this.$set(this.knowledgeForm, 'fullFileName', '')
      this.$set(this.knowledgeForm, 'fileNameSuffix', '')
      this.$set(this.knowledgeForm, 'fileSizeKb', null)
      this.$set(this.knowledgeForm, 'name', '')
      this.uploadFileList = []
    },
    handleUploadExceed() {
      this.$message.warning('只能上传一个文件，请先删除已上传文件')
    },
    submitKnowledgeForm() {
      this.$refs.knowledgeFormRef.validate(valid => {
        if (!valid) {
          return
        }
        this.knowledgeSubmitting = true
        const payload = {
          ...this.knowledgeForm,
          knowledgeTypeId: this.selectedType.id,
          vectorization: true
        }
        saveKnowledge(payload).then(() => {
          this.$message.success('新增成功，正在解析')
          this.knowledgeDialogOpen = false
          this.getList()
        }).finally(() => {
          this.knowledgeSubmitting = false
        })
      })
    },
    getFileSuffix(fileName) {
      if (!fileName || fileName.indexOf('.') === -1) {
        return ''
      }
      return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
    },
    getNameWithoutSuffix(fileName) {
      if (!fileName) {
        return ''
      }
      const dotIndex = fileName.lastIndexOf('.')
      return dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName
    },
    detectFileFormatType(suffix) {
      const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']
      const officeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
      if (suffix === 'pdf') {
        return 2
      }
      if (imageTypes.includes(suffix)) {
        return 1
      }
      if (officeTypes.includes(suffix)) {
        return 3
      }
      return 0
    },
    formatFileSize(size) {
      if (size == null || size === '') {
        return '-'
      }
      return Number(size).toFixed(2) + ' KB'
    },
    tableRowClassName({ row }) {
      if (row.status === 2) {
        return 'row-failed'
      }
      if (row.status === 0) {
        return 'row-parsing'
      }
      return ''
    },
    layoutTable() {
      this.$nextTick(() => {
        this.$refs.knowledgeTable && this.$refs.knowledgeTable.doLayout()
      })
    },
    getFileIcon(fileFormatType) {
      const iconMap = {
        0: 'el-icon-document',
        1: 'el-icon-picture-outline',
        2: 'el-icon-reading',
        3: 'el-icon-folder-opened'
      }
      return iconMap[fileFormatType] || 'el-icon-document'
    },
    canPublishOnline(row) {
      return row.status === 1 && !row.online
    },
    handleViewChunks(row) {
      this.chunkKnowledgeId = row.id
      this.chunkDialogTitle = `切片查看 - ${row.name}`
      this.chunkQuery = {
        current: 1,
        size: 10,
        keyword: ''
      }
      this.chunkDialogOpen = true
      this.loadChunks()
    },
    handleChunkQuery() {
      this.chunkQuery.current = 1
      this.loadChunks()
    },
    loadChunks() {
      if (!this.chunkKnowledgeId) {
        return
      }
      this.chunkLoading = true
      const { current, size, keyword } = this.chunkQuery
      pageKnowledgeChunks(this.chunkKnowledgeId, current, size, keyword).then(response => {
        const pageData = response.data || {}
        this.chunkList = pageData.records || []
        this.chunkTotal = Number(pageData.total) || 0
      }).finally(() => {
        this.chunkLoading = false
      })
    },
    resetChunks() {
      this.chunkList = []
      this.chunkTotal = 0
      this.chunkKnowledgeId = null
      this.chunkLoading = false
      this.chunkDialogTitle = '切片查看'
      this.chunkQuery = {
        current: 1,
        size: 10,
        keyword: ''
      }
    },
    handlePublishOnline(row) {
      this.$confirm(`确认将「${row.name}」上线吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$set(row, '_publishing', true)
        publishKnowledgeOnline(row.id).then(() => {
          this.$message.success('上线成功')
          this.getList()
        }).finally(() => {
          this.$set(row, '_publishing', false)
        })
      }).catch(() => {})
    },
    handleDeleteKnowledge(row) {
      this.$confirm(`确认删除知识「${row.name}」吗？删除后不可恢复。`, '提示', {
        type: 'warning'
      }).then(() => {
        deleteKnowledge(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
$primary: #409eff;
$primary-light: #ecf5ff;
$border: #e4e7ed;
$text-main: #303133;
$page-bg: #f5f7fb;

.knowledge-page {
  padding: 16px 20px 20px;
  background: $page-bg;
  min-height: calc(100vh - 84px);
}

.knowledge-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;
  min-height: calc(100vh - 124px);
}

.type-panel {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.type-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 16px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
}

.type-panel-header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-panel-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.type-panel-title {
  font-size: 16px;
  font-weight: 600;
}

.type-panel-subtitle {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.85;
}

.type-add-btn {
  color: #fff !important;
  padding: 0 8px;
}

.type-search-wrap {
  padding: 14px 14px 0;
}

.type-search {
  ::v-deep .el-input__inner {
    border-radius: 8px;
    border-color: $border;
    background: #fafbfc;
  }
}

.type-list-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 10px 10px 14px;
  min-height: 240px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  padding: 11px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
  border: 1px solid transparent;

  &:hover {
    background: #f5f9ff;
    border-color: rgba($primary, 0.15);

    .type-item-actions {
      opacity: 1;
    }
  }

  &.active {
    background: $primary-light;
    border-color: rgba($primary, 0.35);

    .type-item-icon {
      background: $primary;
      color: #fff;
    }

    .type-name {
      color: $primary;
      font-weight: 600;
    }
  }
}

.type-item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f0f2f5;
  color: #606266;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: $text-main;
  font-size: 14px;
}

.type-item-actions {
  opacity: 0;
  transition: opacity 0.2s;

  .el-button {
    padding: 0 4px;
  }
}

.knowledge-panel {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.knowledge-panel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #f0f2f5;
}

.knowledge-type-badge {
  display: inline-block;
  padding: 2px 10px;
  margin-bottom: 8px;
  font-size: 12px;
  color: $primary;
  background: $primary-light;
  border-radius: 20px;
}

.knowledge-panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.knowledge-panel-desc {
  margin: 8px 0 0;
  color: #909399;
  font-size: 14px;
}

.knowledge-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.toolbar-input {
  width: 180px;
}

.toolbar-select {
  width: 120px;
}

.knowledge-table-wrap {
  flex: none;
  padding: 20px 24px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}

.knowledge-pagination {
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f2f5;
}

.knowledge-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.knowledge-file-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f0f7ff;
  color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.knowledge-name-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  color: $text-main;
}

.file-size-text {
  color: #606266;
  font-size: 13px;
}

.publish-btn {
  color: #67c23a !important;

  &:hover {
    color: #85ce61 !important;
  }
}

.danger-btn {
  color: #f56c6c !important;

  &:hover {
    color: #f78989 !important;
  }
}

.action-cell {
  display: grid;
  grid-template-columns: 88px 68px 68px;
  align-items: center;
  justify-content: center;
  width: 224px;
  margin: 0 auto;
}

::v-deep .action-btn {
  padding: 0 !important;
  margin: 0 !important;
  font-size: 13px;
  line-height: 28px;
  height: 28px;
  border-radius: 4px;
  background: transparent !important;
  justify-self: center;

  &::after {
    display: none !important;
  }

  &.action-chunks {
    grid-column: 1;
  }

  &.action-publish {
    grid-column: 2;
  }

  &.action-delete {
    grid-column: 3;
  }
}

::v-deep .knowledge-table {
  border-radius: 8px;
  border: 1px solid #eef0f4;

  &::before,
  &::after {
    display: none;
  }

  .el-table__header-wrapper {
    th {
      background: #fafbfc !important;
      border-bottom: 1px solid #eef0f4 !important;
      padding: 12px 0;
      color: #606266;
      font-size: 13px;
      font-weight: 600;

      .cell {
        padding: 0 12px;
        text-align: center;
      }
    }
  }

  .el-table__body-wrapper {
    .el-table__body tr {
      background: #fff;
      transition: background 0.2s;

      &:hover > td {
        background: #f8fafc !important;
      }

      td {
        border-bottom: 1px solid #f2f4f7 !important;
        padding: 14px 0;
        color: #303133;
        font-size: 13px;

        .cell {
          padding: 0 12px;
          line-height: 1.5;
        }
      }
    }
  }

  .row-parsing {
    td {
      background-color: #fffbf0 !important;
    }

    &:hover > td {
      background-color: #fff8e6 !important;
    }
  }

  .row-failed {
    td {
      background-color: #fef5f5 !important;
    }

    &:hover > td {
      background-color: #fdeeee !important;
    }
  }

  .action-column .cell {
    padding: 0 12px !important;
    overflow: visible;
    text-align: center;
  }

  .size-column .cell {
    white-space: nowrap;
  }

  .el-table__empty-block {
    min-height: 120px;
    background: #fff;
  }
}

.chunk-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.chunk-search {
  width: 240px;
}

.chunk-pagination {
  margin-top: 16px;
}

::v-deep .chunk-table {
  border-radius: 8px;
  border: 1px solid #eef0f4;
}

.knowledge-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
}

.knowledge-empty-inner {
  text-align: center;
  color: #909399;
}

.knowledge-empty-icon {
  font-size: 64px;
  color: #dcdfe6;
}

.knowledge-empty-title {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #606266;
}

.knowledge-empty-desc {
  margin: 0;
  font-size: 14px;
}
</style>
