<template>
  <div>
    <!-- 添加按钮 -->
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>

    <!-- 表格 -->
    <el-table
      :data="trademarkList"
      border
      style="width: 100%;margin:20px 0"
    >
      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center">
      </el-table-column>

      <el-table-column
        label="品牌名称"
        prop="tmName"
        width="width">
      </el-table-column>

      <el-table-column
        label="品牌LOGO"
        width="width"
      >
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="height:60px">
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="width"
      >
        <template slot-scope="{ row, $index }">
          <el-button 
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button 
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      style="text-align:center"
      :current-page="page"
      :page-size="limit"
      :total="total"
      :pager-count="5"
      :page-sizes="[1, 3, 5]"
      layout="prev, pager, next, jumper, ->, sizes, total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
    </el-pagination>

    <!-- 对话框dialog -->
    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form style="width:80%">
        <el-form-item label="品牌名称" label-width="100px">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>

        <el-form-item label="品牌LOGO" label-width="100px">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button 
          type="primary" 
          @click="addOrUpdateTrademark"
        >确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
    name:'TrademarkList',
    data(){
      return {
        //标识对话框是否可见
        dialogFormVisible:false,
        //初始分页器数据,当前页为1,每页展示三条数据
        page:1,
        limit:3,
        total:0,
        //初始品牌列表
        trademarkList:[],
        //初始收集的品牌对象
        tmForm:{
          tmName:'',
          logoUrl:''
        }

      }      
    },
    mounted(){
      this.getTrademarkList()
    },
    methods:{
      //发请求获取品牌分页数据
      async getTrademarkList(){
        const result = await this.$API.trademark.getPageList(this.page,this.limit)
        if(result.code === 200){
          this.trademarkList = result.data.records
          this.total = result.data.total
        }
      },

      //点击添加按钮的回调
      showAddDialog(){
        this.dialogFormVisible = true
        this.tmForm = {
          tmName:'',
          logoUrl:''
        }
      },

      //点击修改按钮的回调
      showUpdateDialog(row){
        this.dialogFormVisible = true
        this.tmForm = { ...row }
      },

      //点击删除按钮
      deleteTrademark(row) {
        this.$confirm(`确定删除${row.tmName}吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            await this.$API.trademark.delete(row.id)
            //1、删除成功后提示
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            //2、重新发请求获取列表数据
            // 正常删除哪个数据回到的还是哪个数据所在的页面
            // 假设删除数据的那一页只有一条数据，我们需要回到前一页，而不是数据当前页
            this.getTrademarkList(this.getTrademarkList.length>1 ? this.page : this.page = this.page - 1)            
          } catch (error) {
            this.$message({
              type: 'error',
              message: '删除失败!'
            });
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },

      //点击确定按钮发请求添加或者修改品牌
      async addOrUpdateTrademark(){
        //获取参数
        let trademark = this.tmForm; //tmForm就是咱们添加或者修改最终收集到的品牌数据
        //发请求
        try {
          await this.$API.trademark.addOrUpdate(trademark)
          // 1.提示
          this.$message.success(trademark.id?'修改品牌成功':'添加品牌成功')
          // 2.关闭弹框
          this.dialogFormVisible = false
          // 3.重新发请求
          //  如果是添加成功,那么重新请求的是第一页的数据,新添加的数据在最后一页
          //  如果是修改成功,还要请求当前页的数据
          this.getTrademarkList(trademark.id?this.page:this.page = 1)          
        } catch (error) {
          this.$message.error(trademark.id?'修改品牌失败':'添加品牌失败')
        }
      },

      //分页器相关回调
      handleSizeChange(size){        
        this.limit = size
        this.getTrademarkList()
      },
      handleCurrentChange(page){
        this.page = page
        this.getTrademarkList()
      },

      //上传组件的回调
      handleAvatarSuccess(res, file) {
        this.tmForm.logoUrl = res.data
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      }
    }
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>