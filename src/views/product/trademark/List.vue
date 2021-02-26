<template>
  <div>
      <!-- 添加按钮 -->
      <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>

      <!-- 表格 -->
      <el-table
      :data="trademarkList"
        border
        style="width: 100%;margin:20px 0">>
        <el-table-column
          type="index"
          label="序号"
          width="80"
          align="center">
        </el-table-column>

        <el-table-column
          prop="tmName"
          label="品牌名称"
          width="width">
        </el-table-column>

        <el-table-column
          prop="logoUrl"
          label="品牌LOGO"
          width="width">
          <template slot-scope="{row,$index}">
            <img :src="row.logoUrl" alt="" style="width:80px">
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="width">
          <template slot-scope="{row,$index}">
            <el-button type="warning" icon="el-icon-edit" @click="showUpdateDialog(row)">修改</el-button>
            <el-button type="primary" icon="el-icon-delete" @click="deleteTrademark(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <el-pagination
        background
        style="text-align:center"
        :current-page="page"
        :page-size="limit"
        :total="total"
        :pager-count="5"
        :page-sizes="[1, 3, 5]"
        layout="prev, pager, next, jumper, ->,sizes, total"
        @current-change="getTrademarkList"
        @size-change = "handleSizeChange"
      >
      </el-pagination>

      <!-- 点击添加或修改弹出的对话框 -->
      <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
        <el-form style="width:80%" :model="tmForm">
          <!-- 
            form当中都会写一个数据: model="对象" 作用:1.以后用来对这个form表单进行验证
                                                    2.用来标识这个form收集的数据收集到哪
           -->
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
          <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
        </div>
      </el-dialog>
  </div>
</template>

<script>
export default {
    name:'Trademark',
    data(){
      return {
        page:1,
        limit:1,
        trademarkList:[],
        total:0,

        dialogFormVisible:false,     //这个数据决定dialog是否显示

        //upload组件内部的数据 后期有可能不用
        imageUrl: '',

        //用来收集数据
        tmForm:{
          tmName:'',  //收集我们的品牌名称
          logoUrl:''  //收集我们的品牌logoUrl
        }
      }
    },
    mounted(){
      this.getTrademarkList()
    },
    methods:{
      async getTrademarkList(page = 1){
        this.page = page
        const result = await this.$API.trademark.getPageList(this.page,this.limit)
        if(result.code === 200){
          this.trademarkList = result.data.records
          this.total = result.data.total
        }
      },

      //这个是切换分页器页码的回调 这个回调可以省略
      // handleCurrentChange(page){
      //   this.page = page
      //   this.getTrademarkList()
      // }

      //这个是切换每页数量的回调,这个回调不能省略
      handleSizeChange(size){
        this.limit = size
        this.getTrademarkList()
      },

      //点击添加按钮弹出添加品牌对话框
      showAddDialog(){
        this.dialogFormVisible = true
        //把tmForm内的数据清空 如果不清空，添加数据点取消，再点添加，数据还存在
        this.tmForm = {
          tmName: "", //收集我们的品牌名称
          logoUrl: "", //收集我们的品牌logo图片路径
        };
      },

      //点击修改按钮弹出添加品牌对话框
      showUpdateDialog(row){
        this.dialogFormVisible = true
        this.tmForm = {...row}
      },

      //点击确定按钮发请求添加或者修改品牌
      async addOrUpdateTrademark(){
        //获取参数
        let trademark = this.tmForm
        // if(trademark.id){
        //   console.log('我有id');
        //   console.log(trademark);
        // }
        //如果我们的参数数据不符合请求的参数格式,就需要整理数据
        //发请求
        try {
          await this.$API.trademark.addOrUpdate(trademark)
          //1.提示
          this.$message.success(trademark.id?'修改品牌成功':'添加品牌成功')
          //2.关闭dialog
          this.dialogFormVisible = false
          //3.重新发请求获取数据
          this.getTrademarkList(trademark.id?this.page:1)
        } catch (error) {
          //1.提示
          this.$message.warning(trademark.id?'修改品牌失败':'添加品牌失败')
          //2.关闭dialog
          this.dialogFormVisible = false
        }
      },

      //点击删除按钮
      deleteTrademark(row) {
        this.$confirm(`你确定删除${row.tmName}吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          try {
            await this.$API.trademark.delete(row.id)
            //1.删除成功后提示
            this.$message.success('删除品牌成功')
            // this.$message({
            //   type: 'success',
            //   message: '删除成功!'
            // }); 
            //2.重新发请求获取列表数据
            //  删除哪个数据回到的还是哪个数据所在的也没
            //  如果删除数据的那一页只有一条数据,我们需要回到前一页面

            this.getTrademarkList(this.trademarkList.length > 1 ? this.page : this.page - 1 )           
          } catch (error) {            
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        });
      },

      //upload组件中的两个方法
      handleAvatarSuccess(res, file) {
        //res代表上传成功后返回的响应数据
        //file代表上传成功后返回的图片文件本身

        //本身写的东西是错的,他也是在收集上传成功的图片路径,但是这样的写法只是模拟
        //它最终收集的是本地的路径,是错的,我们要的是上传成功后服务器返回来的线上路径
        // this.imageUrl = URL.createObjectURL(file.raw);
        this.tmForm.logoUrl = res.data
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传图片大小不能超过 2MB!');
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