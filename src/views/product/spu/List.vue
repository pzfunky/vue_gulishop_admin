<template>
  <div>
      <el-card>
        <CategorySelector @handlerCategory="handlerCategory" :isShowList="isShowList"></CategorySelector>
      </el-card>

      <el-card style="margin-top:20px">

        <!-- spu的列表页 -->
        <div v-show="!isShowSpuForm && !isShowSkuForm">
          <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="showAddSpuForm">添加SPU</el-button>
          <el-table :data="spuList" border style="width: 100%">
            <el-table-column label="序号" type="index" align="center" width="80">
            </el-table-column>
            <el-table-column prop="spuName" label="SPU名称" width="width">
            </el-table-column>
            <el-table-column prop="description" label="SPU描述" width="width">
            </el-table-column>
            <el-table-column prop="prop" label="操作" width="width">
              <template slot-scope="{ row, $index }">
                <HintButton
                  type="success"
                  icon="el-icon-plus"
                  size="mini"
                  title="添加SKU"
                  @click="showAddSkuForm(row)"
                ></HintButton>
                <HintButton
                  type="warning"
                  icon="el-icon-edit"
                  size="mini"
                  title="修改SPU"
                  @click="showUpdateSpuForm(row)"
                ></HintButton>
                <HintButton
                  type="info"
                  icon="el-icon-info"
                  size="mini"
                  title="查看SPU的SKU列表"
                  @click="showSkuList(row)"
                ></HintButton>
                <el-popconfirm :title="`你确定删除${row.spuName}吗？`" @onConfirm="deleteSpu(row)">
                  <HintButton
                    slot="reference"
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    title="删除SPU"
                  ></HintButton>
                </el-popconfirm>                
              </template>
            </el-table-column>
          </el-table>

          <!-- @size-change="handleSizeChange"
          @current-change="handleCurrentChange" -->
          <el-pagination
            style="text-align: center"
            :current-page="page"
            :page-sizes="[2, 4, 6]"
            :page-size="limit"
            :total="total"
            :pager-count="5"
            @current-change="getSpuList"
            @size-change="handleSizeChange"
            layout=" prev, pager, next, jumper,->,sizes,total"
          >
          </el-pagination>
        </div>       

        <!-- spu的添加和修改页面 -->
        <!-- <div> 
        </div> -->
        <!-- <SpuForm 
          v-show="isShowSpuForm" 
          :visible="isShowSpuForm" 
          @updata:visible="isShowSpuForm = $event"
        ></SpuForm> -->
        <SpuForm 
          v-show="isShowSpuForm" 
          :visible.sync="isShowSpuForm" 
          ref="spu"
          @backSuccess="backSuccess"
          @cancelSuccess="cancelSuccess"
        ></SpuForm>

        <!-- sku的添加页面 -->
        <!-- <div>
        </div> -->        
        <SkuForm 
          v-show="isShowSkuForm" 
          :visible.sync="isShowSkuForm"
          ref="sku"  
        ></SkuForm>
      </el-card>

      <!-- sku列表 -->
      <el-dialog
        :title="`${spu.spuName}的sku列表`"
        :visible.sync="dialogVisible"
        width="60%"
        @closed="handleClose"
      >
        <el-table border stripe :data="skuList" v-loading="loading">
          <el-table-column prop="skuName" label="名称" width="width"></el-table-column>
          <el-table-column prop="price" label="价格(元)" width="width"></el-table-column>
          <el-table-column prop="weight" label="重量(kg)" width="width"></el-table-column>
          <el-table-column prop="prop" label="默认图片" width="width">
            <template slot-scope="{row,$index}">
              <img :src="row.skuDefaultImg" alt="" style="width:80px">              
            </template>
          </el-table-column>
        </el-table>
        
        <span slot="footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary">OK</el-button>
        </span>
      </el-dialog>
      
  </div>
</template>

<script>
import SpuForm from '@/views/product/components/SpuForm'
import SkuForm from '@/views/product/components/SkuForm'
export default {
  name:'Spu',
  components:{
    SpuForm,
    SkuForm
  },
  data(){
    return {
      category1Id:'',
      category2Id:'',
      category3Id:'',
      spuList:[],
      isShowList: true, //这个数据是为了完成三级分类的可操作性传递过去的,和咱们这边的三个页面显示隐藏没关系

      //有分页就得有这三个数据
      page: 1,
      limit: 2,
      total: 0,

      //三个页面显示隐藏是通过下面这两个数据实现
      isShowSpuForm:false,
      isShowSkuForm:false,

      //sku列表需要的数据
      dialogVisible:false,
      spu:{},
      skuList:[],
      loading:true


    }
  },
  mounted(){
  },
  methods:{
    handlerCategory({ categoryId, level }){
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.spuList = [];
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    //获取spu分页列表
    async getSpuList(pager = 1) {
      this.page = pager;
      let { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },

    //修改每页数量的回调
    handleSizeChange(size) {
      this.limit = size;
      this.getSpuList();
    },

    //点击添加SPU的回调，显示SPU的添加页面
    showAddSpuForm(){
      this.isShowSpuForm = true
      this.$refs.spu.getAddSpuFormInitData(this.category3Id)
    },
    //点击修改spu的回调，显示Spu的修改页面（其实和添加是同一个页面）
    showUpdateSpuForm(row){
      this.flag = row.id  //这个数据只是为了让返回的时候来判断是从哪返回的
      this.isShowSpuForm = true
      this.$refs.spu.getUpdateSpuFormInitData(row,this.category3Id)
    },
    //点击添加SKU的回调，显示添加SKU的页面
    showAddSkuForm(row){
      this.isShowSkuForm = true
      this.$refs.sku.getAddSkuFormInitData(row,this.category1Id,this.category2Id)
    },

    //点击确定保存spu成功返回的回调
    backSuccess(){
      //重新发请求获取spu列表数据
      //判断如何返回 修改返回和添加返回是不一样的
      if(this.flag){
        this.getSpuList(this.page)
      }else{
        this.getSpuList()
      }
      //重置标志位
      this.flag = null
    },
    //取消返回的的回调
    cancelSuccess(){
      //重置标志位
      this.flag = null
    },

    //删除spu
    async deleteSpu(row){
      try {
        await this.$API.spu.remove(row.id)
        this.$message.success('删除spu成功')
        this.getSpuList(this.spuList.length > 1?this.page:this.page - 1)
      } catch (error) {
        this.$message.error('删除spu失败')
      }
    },

    //查看spu的sku列表
    async showSkuList(row){
      //弹出对话框
      this.dialogVisible = true
      //保存spu
      this.spu = row
      //请求获取当前这个spu的sku列表
      const result = await this.$API.sku.getListBySpuId(row.id)
      if(result.code === 200){
        this.skuList = result.data
      }
      this.loading = false
    },
    //关闭sku列表的回调
    handleClose(){
      this.skuList = []
      this.dialogVisible = false
      this.loading = true
    }


  },
  watch:{
    isShowSpuForm:{
      handler(newVal,oldVal){
        this.isShowList = !newVal
      }
    },
    isShowSkuForm:{
      handler(newVal,oldVal){
        this.isShowList = !newVal
      }
    },
  }

}
</script>

<style lang="scss" scoped>

</style>