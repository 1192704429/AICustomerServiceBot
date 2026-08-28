<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="机器人名称">
          <el-input
            v-model="queryParams.robotName"
            placeholder="请输入机器人名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="机器人状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择机器人状态"
            clearable
          >
            <el-option
              :key="0"
              :label="'停用'"
              :value="0"
            />
            <el-option
              :key="1"
              :label="'启用'"
              :value="1"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input
            v-model="queryParams.enterpriseName"
            placeholder="请输入企业名称"
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
      <el-button type="primary" @click="handleAdd">新建</el-button>
      <el-button :disabled="multiple" @click="handleDeleteBatch">批量删除</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="loading"
        :data="aiRobotList"
        @selection-change="handleSelectionChange"
        class="modern-table"
      >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="机器人名称" prop="robotName"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="机器人头像" prop="robotAvatar" width="${c.width}" align="center">
        <template slot-scope="scope">
          <image-preview v-if="scope.row.robotAvatar" :src="scope.row.robotAvatar" width="60px" height="60px" />
          <span v-else style="color: #909399;">暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="机器人介绍" prop="robotDesc"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="欢迎语" prop="welcomeMessage"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="默认回复" prop="defaultReply"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="系统提示词" prop="systemPrompt"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="机器人状态" prop="status"  align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ getEnumLabel(scope.row.status, statusEnumMap) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="remark"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" prop="createTime"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="企业名称" prop="enterpriseName"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            type="text"
            style="color: #f56c6c;"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 添加或修改对话框（有富文本/MD 时宽度 50%，否则 600px） -->
    <el-dialog :title="title" :visible.sync="open"  width="600px"  append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="所属企业" prop="enterpriseId">
          <el-select v-model="form.enterpriseId" placeholder="请选择所属企业" clearable style="width: 100%;">
            <el-option
              v-for="(item, idx) in enterpriseInfoOptions"
              :key="idx"
              :label="item.enterpriseName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="机器人名称" prop="robotName">
          <el-input v-model="form.robotName" placeholder="请输入机器人名称" />
        </el-form-item>
        <el-form-item label="机器人头像" prop="robotAvatar">
          <img-upload v-model="form.robotAvatar" :limit="1" />
        </el-form-item>
        <el-form-item label="机器人介绍" prop="robotDesc">
          <el-input
            v-model="form.robotDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入机器人介绍"
          />
        </el-form-item>
        <el-form-item label="欢迎语" prop="welcomeMessage">
          <el-input
            v-model="form.welcomeMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入欢迎语"
          />
        </el-form-item>
        <el-form-item label="默认回复" prop="defaultReply">
          <el-input
            v-model="form.defaultReply"
            type="textarea"
            :rows="3"
            placeholder="请输入默认回复"
          />
        </el-form-item>
        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input
            v-model="form.systemPrompt"
            type="textarea"
            :rows="3"
            placeholder="请输入系统提示词"
          />
        </el-form-item>
        <el-form-item label="机器人状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="(item, index) in statusOptions"
              :key="index"
              :label="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  pageAiRobot,
  getAiRobotById,
  saveAiRobot,
  updateAiRobot,
  deleteAiRobot,
  deleteBatchAiRobot,
  listEnterpriseInfo

} from '@/api/ai_robot'
import ImgUpload from '@/components/ImgUpload'
import ImagePreview from '@/components/ImagePreview'
import Pagination from '@/components/Pagination'
import BasicEditor from '@/components/BasicEditor'

export default {
  name: 'AiRobot',
  components: {
    ImgUpload,
    ImagePreview,
    Pagination,
    BasicEditor
  },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      aiRobotList: [],
      title: '',
      open: false,
      queryParams: {
        current: 1,
        size: 5,
        robotName:  null,
        status:  null,
        enterpriseName:  null
      },
      form: {},
      rules: {
        enterpriseId: [
          { required: true, message: '所属企业不能为空', trigger: 'change' }
        ],
        robotName: [
          { required: true, message: '机器人名称不能为空', trigger: 'blur' }
        ],
        robotAvatar: [
          { required: true, message: '机器人头像不能为空', trigger: 'blur' }
        ],
        robotDesc: [
          { required: true, message: '机器人介绍不能为空', trigger: 'blur' }
        ],
        welcomeMessage: [
          { required: true, message: '欢迎语不能为空', trigger: 'blur' }
        ],
        defaultReply: [
          { required: true, message: '默认回复不能为空', trigger: 'blur' }
        ],
        systemPrompt: [
          { required: true, message: '系统提示词不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '机器人状态不能为空', trigger: 'change' }
        ],
        remark: [
          { required: true, message: '备注不能为空', trigger: 'blur' }
        ]
      },
      enterpriseInfoOptions: []

,
      statusOptions: [{value: 0, label: '停用'},{value: 1, label: '启用'}],

      statusEnumMap: { 0: '停用', 1: '启用' },
    }
  },
  created() {
    this.getList()
    this.getEnterpriseInfoOptions({})
  },
  methods: {
    /** 查询机器人管理列表（范围查询绑定 xxxRange，传参拆成 xxxStart/xxxEnd） */
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      const entity = { ...rest }
      pageAiRobot(current, size, entity).then(response => {
        const pageData = response.data
        this.aiRobotList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 获取所属企业下拉选项 */
    getEnterpriseInfoOptions(params) {
      listEnterpriseInfo(params || {}).then(response => {
        this.enterpriseInfoOptions = response.data || []
      })
    },
    /** 枚举列展示：根据 value 取 label，无则显示原值 */
    getEnumLabel(val, map) {
      if (map == null || map[val] === undefined) return val
      return map[val]
    },
    /** 取消按钮 */
    cancel() {
      this.open = false
      this.reset()
    },
    /** 表单重置 */
    reset() {
      this.form = {}
      if (this.$refs.form) {
        this.$refs.form.resetFields()
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
      this.queryParams.size = this.queryParams.size || 5
      this.queryParams.robotName = null
      this.queryParams.status = null
      this.queryParams.enterpriseName = null
      this.handleQuery()
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加机器人管理'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getAiRobotById(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改机器人管理'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAiRobot(this.form).then(response => {
              this.$message.success('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            saveAiRobot(this.form).then(response => {
              this.$message.success('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$confirm('是否确认删除编号为"' + ids + '"的数据项？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return deleteAiRobot(ids)
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
        return deleteBatchAiRobot(ids)
      }).then(() => {
        this.getList()
        this.$message.success('删除成功')
      }).catch(() => {})
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
</style>
