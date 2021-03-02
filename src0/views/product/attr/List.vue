<template>
  <div>
    <!-- 三级联动 -->
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowList='isShowList'/>      
    </el-card>

    <!-- 属性列表 -->
    <el-card style="margin-top:20px">
      <div v-show="isShowList">
        <!-- 添加属性按钮 -->
        <el-button type="primary" @click="showAddDiv" :disabled="!category3Id">添加属性</el-button>
        <!-- 属性列表 -->
        <el-table
          :data="attrList"
          border
          style="width: 100%;margin:20px 0">

          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center">
          </el-table-column>

          <el-table-column
            prop="attrName"
            label="属性名"
            width="150">
          </el-table-column>

          <el-table-column
            prop="attrValueList"
            label="属性值列表"
            width="width">
            <template slot-scope="{row,$index}">
              <el-tag type="success" v-for="attrValue in row.attrValueList" :key="attrValue.id">{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="prop"
            label="操作"
            width="150">
            <template slot-scope="{row,$index}">
              <HintButton type="waring" icon="el-icon-edit" size="mini" title="修改" @click="showUpdateDiv(row)"/>
              <el-popconfirm :title="`你确定要删除${row.attrName}吗？`" @onConfirm="deleteAttr(row)">
                <HintButton
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>

        </el-table>
      </div>

      <div v-show="!isShowList">
        <el-form :inline='true' :model="attrForm">
          <el-form-item label="属性名">
            <el-input placeholder="请输入属性名" v-model="attrForm.attrName"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus" @click="addAttrValue" :disabled="!attrForm.attrName">添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>

        <el-table
          :data="attrForm.attrValueList"
          border
          style="width: 100%;margin:20px 0">

          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center">
          </el-table-column>

          <el-table-column
            prop="prop"
            label="属性值名称"
            width="width">
            <template slot-scope="{row,$index}">
              <el-input
                :ref="$index"
                v-if="row.isEdit" 
                placeholder="请输入属性值名称" 
                v-model="row.valueName" 
                size="mini"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span v-else style="display:block;width:100%;height:100%" @click="toEdit(row,$index)">{{row.valueName}}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="prop"
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm
                :title="`你确定要删除${row.valueName}这个属性值吗？`"
                @onConfirm="attrForm.attrValueList.splice($index, 1)"
              >
                <HintButton 
                  slot="reference"
                  type="danger" 
                  icon="el-icon-delete" 
                  size="mini" 
                  title="删除"
                ></HintButton>
              </el-popconfirm>          
            </template>
          </el-table-column>
        </el-table>

        <el-button 
          type="primary" 
          icon="el-icon-edit" 
          @click="saveAttr" 
          :disabled="!attrForm.attrValueList.length"
        >保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
    name:'AttrList',
    data(){
      return {
        category1Id:'',
        category2Id:'',
        category3Id:'',
        attrList:[],  //商品属性列表
        attrForm:{    //待修改的商品对象
          attrName:'',  //属性名称
          attrValueList:[],
          categoryId:0, //data中不能使用this来获取data中的另一个值 data在初始化时谁先谁后不一定
          categoryLevel:3
        },
        isShowList:true    //标识属性列表是否显示
      }
    },
    methods:{
      //自定义事件的回调
      handlerCategory({categoryId,level}){
        if(level === 1){
          this.category1Id = categoryId
          //子组件重新选择一级,清空二三级id和属性列表
          this.category2Id = ''
          this.category3Id = ''
          this.attrList = []
        }else if(level === 2){
          this.category2Id = categoryId
          //子组件重新选择一级,清空二三级id和属性列表
          this.category3Id = ''
          this.attrList = []
        }else if(level === 3){
          this.category3Id = categoryId
          //发请求拿属性列表
          this.getAttrList()
        }
        this.isShowList = true  // 标识是否显示属性列表

      },
      //请求获取属性
      async getAttrList(){
        let {category1Id,category2Id,category3Id} = this
        let result = await this.$API.attr.getList(category1Id,category2Id,category3Id)
        if(result.code === 200){
          this.attrList = result.data
        }
      },
      //重置attrForm
      resetAttrForm(){
        this.attrForm = {    //待修改的商品对象
          attrName:'',  //属性名称
          attrValueList:[],
          categoryId:this.category3Id, //data中不能使用this来获取data中的另一个值 data在初始化时谁先谁后不一定
          categoryLevel:3
        }
      },
      //点击添加属性的回调 显示添加属性对话框
      showAddDiv(){
        this.isShowList = false
        this.resetAttrForm()
      },
      //点击编辑显示属性编辑对话框
      showUpdateDiv(row){
        this.isShowList = false
        //这里不能使用浅拷贝,因为内部数组是一个对象类型，浅拷拷的还是地址，数组用的还是同一个
        this.attrForm = cloneDeep(row)
        // 给已存在的属性添加isEdit值,默认为false,需要用this.$set,因为给已存在的值添加isEdit不是响应式数据
        this.attrForm.attrValueList.forEach(item => {
          this.$set(item,'isEdit',false)
        })
      },
      //点击添加属性值的回调
      addAttrValue(){
        this.attrForm.attrValueList.push({
          attrId:this.attrForm.id,   // 这个id代表的是属性值所属属性的id,有id就是修改页面，没有就增加页面undefined
          // id: 0, 新添加属性值没有id
          valueName:'', //一会需要用户输入的属性值名称
          isEdit:true   //标记属性值是编辑模式还是显示模式
        })
        //添加属性值的时候我们需要自动获取焦点
        //新添加的永远是最后一个
        this.$nextTick(() => {
          this.$refs[this.attrForm.attrValueList.length - 1].focus();
        });
      },
      //对input失去焦点或者回车，那么切换为查看模式
      toLook(row){
        //input在切换为span之前要判断数据合法性
        //1、失去焦点的时候需要判定数据中是否有属性值名称,如果没有值或者值不合法，不会变为span
        if(row.valueName.trim() === "" ){
          row.valueName = '';
          // this.$message.warning('属性值不合法!');
          return;
        }
        //2、除了自己以外，输入的数据是不是和其它的属性值名称重复
        let isRepeat = this.attrForm.attrValueList.some(item => {
          if(item !== row){
            return item.valueName === row.valueName;
          }
        })
        if(isRepeat){
          this.$message.warning('输入的属性值名称不能与已存在的属性值相同!')
          row.valueName = "";
          return;
        }
        row.isEdit = false;
      },
      //点击span,切换为查看模式
      toEdit(row,index){
        row.isEdit = true;
        //从span变为input我们需要自动获取焦点
        //直接写这一行，input标签其实还没有创建成功，所以报错this.$refs[index]是undefined
        this.$nextTick(() => {
          this.$refs[index].focus()
        });
      },
      //保存属性操作
      async saveAttr(){
        //1.获取参数
        let attr = this.attrForm
        //2.整理参数 
          //2.1 属性值名称如果为空串，从属性值列表当中去除
          //2.2 属性值当中去除isEdit属性,这个isEdit是我们后面自己添加用来标识查看模式和编辑模式的
        attr.attrValueList = attr.attrValueList.filter(item => {
          if(item.valueName.trim() !== ''){
            delete item.isEdit
            return true
          }
        })
        //3.属性值列表如果没有属性值，不发请求
        if(attr.attrValueList.length === 0){
          this.$message.info('属性值列表必须有值才能保存')
          return 
        }
        try {
          await this.$API.attr.addOrUpdate(attr)
          //提示成功
          this.$message.success('保存属性成功')
          //显示属性列表
          this.isShowList = true
          //重新发请求获取最新的属性列表
          this.getAttrList()
        } catch (error) {
          this.$message.error("保存属性失败" + error.message)
        }
      },
      //删除属性操作
      async deleteAttr(row){
        try {
          await this.$API.attr.deleteAttr(row.id)
          this.$message.success('删除属性成功')
          this.getAttrList()
        } catch (error) {
          this.$message.error("删除属性失败" + error.message)
        }
      }
    }
}
</script>

<style lang="scss" scoped>

</style>