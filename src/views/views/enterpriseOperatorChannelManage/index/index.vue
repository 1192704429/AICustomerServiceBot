<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form" size="small">
        <el-form-item label="渠道名称">
          <el-input
            v-model="queryParams.channelName"
            placeholder="请输入渠道名称"
            clearable
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="渠道类型">
          <el-select
            v-model="queryParams.channelType"
            placeholder="请选择渠道类型"
            clearable
          >
            <el-option
              :key="1"
              :label="'网站'"
              :value="1"
            />
            <el-option
              :key="2"
              :label="'H5'"
              :value="2"
            />
            <el-option
              :key="3"
              :label="'其他'"
              :value="3"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择渠道状态"
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
        <el-form-item label="机器人名称">
          <el-input
            v-model="queryParams.robotName"
            placeholder="请输入机器人名称"
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
        :data="websiteChannelList"
        @selection-change="handleSelectionChange"
        class="modern-table"
      >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="渠道名称" prop="channelName"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="渠道类型" prop="channelType"  align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ getEnumLabel(scope.row.channelType, channelTypeEnumMap) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="网站名称" prop="websiteName"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="网站地址" prop="websiteDomain"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="渠道状态" prop="status"  align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ getEnumLabel(scope.row.status, statusEnumMap) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间(秒)" prop="endSecond"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="备注" prop="remark"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" prop="createTime"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="企业名称" prop="enterpriseName"  align="center" :show-overflow-tooltip="true" />
      <el-table-column label="机器人名称" prop="robotName"  align="center" :show-overflow-tooltip="true" />
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
        <el-form-item label="关联机器人" prop="robotId">
          <el-select v-model="form.robotId" placeholder="请选择关联机器人" clearable style="width: 100%;">
            <el-option
              v-for="(item, idx) in aiRobotOptions"
              :key="idx"
              :label="item.robotName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道名称" prop="channelName">
          <el-input v-model="form.channelName" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelType">
          <el-select v-model="form.channelType" placeholder="请选择渠道类型" clearable style="width: 100%;">
            <el-option
              v-for="(item, index) in channelTypeOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="网站名称" prop="websiteName">
          <el-input v-model="form.websiteName" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网站地址" prop="websiteDomain">
          <el-input v-model="form.websiteDomain" placeholder="请输入网站地址" />
        </el-form-item>
        <el-form-item label="渠道状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="(item, index) in statusOptions"
              :key="index"
              :label="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="结束时间(秒)" prop="endSecond">
          <el-input v-model="form.endSecond" placeholder="请输入结束时间(秒)" />
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
  pageWebsiteChannel,
  getWebsiteChannelById,
  saveWebsiteChannel,
  updateWebsiteChannel,
  deleteWebsiteChannel,
  deleteBatchWebsiteChannel,
  listAiRobot

} from '@/api/website_channel'
import ImgUpload from '@/components/ImgUpload'
import ImagePreview from '@/components/ImagePreview'
import Pagination from '@/components/Pagination'
import BasicEditor from '@/components/BasicEditor'

export default {
  name: 'WebsiteChannel',
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
      websiteChannelList: [],
      title: '',
      open: false,
      queryParams: {
        current: 1,
        size: 5,
        channelName:  null,
        channelType:  null,
        status:  null,
        enterpriseName:  null,
        robotName:  null
      },
      form: {},
      rules: {
        robotId: [
          { required: true, message: '关联机器人不能为空', trigger: 'change' }
        ],
        channelName: [
          { required: true, message: '渠道名称不能为空', trigger: 'blur' }
        ],
        channelType: [
          { required: true, message: '渠道类型不能为空', trigger: 'change' }
        ],
        websiteName: [
          { required: true, message: '网站名称不能为空', trigger: 'blur' }
        ],
        websiteDomain: [
          { required: true, message: '网站地址不能为空', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '渠道状态不能为空', trigger: 'change' }
        ],
        endSecond: [
          { required: true, message: '结束时间(秒)不能为空', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '备注不能为空', trigger: 'blur' }
        ]
      },
      aiRobotOptions: []

,
      channelTypeOptions: [{value: 1, label: '网站'},{value: 2, label: 'H5'},{value: 3, label: '其他'}],
      statusOptions: [{value: 0, label: '停用'},{value: 1, label: '启用'}],

      channelTypeEnumMap: { 1: '网站', 2: 'H5', 3: '其他' },
      statusEnumMap: { 0: '停用', 1: '启用' },
    }
  },
  created() {
    this.getList()
    this.getAiRobotOptions({})
  },
  methods: {
    /** 查询网站渠道管理列表（范围查询绑定 xxxRange，传参拆成 xxxStart/xxxEnd） */
    getList() {
      this.loading = true
      const { current, size, ...rest } = this.queryParams
      const entity = { ...rest }
      pageWebsiteChannel(current, size, entity).then(response => {
        const pageData = response.data
        this.websiteChannelList = pageData.records || []
        this.total = Number(pageData.total) || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /** 获取关联机器人下拉选项 */
    getAiRobotOptions(params) {
      listAiRobot(params || {}).then(response => {
        this.aiRobotOptions = response.data || []
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
      this.queryParams.channelName = null
      this.queryParams.channelType = null
      this.queryParams.status = null
      this.queryParams.enterpriseName = null
      this.queryParams.robotName = null
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
      this.title = '添加网站渠道管理'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getWebsiteChannelById(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改网站渠道管理'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateWebsiteChannel(this.form).then(response => {
              this.$message.success('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            saveWebsiteChannel(this.form).then(response => {
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
        return deleteWebsiteChannel(ids)
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
        return deleteBatchWebsiteChannel(ids)
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
