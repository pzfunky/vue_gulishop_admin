<template>
  <div>
    <!-- 三级联动 -->
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowList="isShowList"></CategorySelector>
    </el-card>

    <!-- 属性列表 -->
    <el-card style="margin-top:20px">
      <div v-show="isShowList">
        <el-button type="primary" @click="showAddDiv" :disabled="!category3Id">添加属性</el-button>
        <el-table
          border
          style="width: 100%;margin:20px 0"
          :data="attrList"
        >
          <el-table-column
            type="index"
            label="序号 "
            width="80"
            align="center">
          </el-table-column>

          <el-table-column
            prop="attrName"
            label="属性值名称"
            width="150">
          </el-table-column>

          <el-table-column prop="attrValueList" label="属性值列表" width="width">
            <template slot-scope="{row,$index}">
              <el-tag 
                type="success" 
                v-for="attrValue in row.attrValueList" 
                :key="attrValue.id"
              >{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="attrValueList" label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton type="waring" icon="el-icon-edit" size="mini" title="修改" @click="showUpdateDiv(row)"></HintButton>              
              <el-popconfirm 
                :title="`确定删除${row.attrName}这个属性值吗?`" 
                @onConfirm="deleteAttr(row)"
              >
                <HintButton slot="reference" type="danger" icon="el-icon-delete" size="mini" title="删除"></HintButton>
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
          border
          style="width: 100%;margin:20px 0"
          :data="attrForm.attrValueList"
        >
          <el-table-column
            type="index"
            label="序号 "
            width="80"
            align="center">
          </el-table-column>

          <el-table-column
            prop="prop"
            label="属性值名称"
            width="width">
            <template slot-scope="{row,$index}">
              <el-input 
                v-if="row.isEdit" 
                placeholder="请输入属性值名称" 
                v-model="row.valueName"
                size="mini"
                :ref="$index"
                style="display:block;width:100%;height:100%"
                @blur="toLook(row)"
                @keyup.enter="toLook(row)"></el-input>              
              <span v-else @click="toEdit(row,$index)" style="display:block;width:100%;height:100%">{{row.valueName}}</span>
            </template>
          </el-table-column>

          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm 
                :title="`确定删除${row.valueName}这个属性值吗?`" 
                @onConfirm="attrForm.attrValueList.splice($index,1)"
              >
                <!-- 点击确认会触发一个事件,叫onConfirm,官网写错了 -->
                <HintButton 
                  slot="reference"
                  type="danger" 
                  icon="el-icon-delete" 
                  title="删除属性值" 
                  size="mini" ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" icon="el-icon-edit" @click="save" :disabled="attrForm.attrValueList.length === 0">保存</el-button>
        <el-button @click="isShowList = true" >取消</el-button>
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
      attrList:[],

      isShowList:true,

      attrForm:{
        attrName:'',  //属性名称
        attrValueList:[],
        categoryId:0, //data中不能使用this来获取data中的另一个值 data在初始化时谁先谁后不一定
        categoryLevel:3
      }
    }
  },
  methods:{
    handlerCategory({categoryId,level}){
      if(level === 1){
        this.category1Id = categoryId
        //子组件重新选择一级,清空二三级id和属性列表
        this.category2Id = ''
        this.category3Id = ''
        this.attrList = []
      }else if(level === 2){
        this.category2Id = categoryId
        //子组件重新选择二级,清空三级id和属性列表
        this.category3Id = ''
        this.attrList = []
      }else if(level === 3){
        this.category3Id = categoryId
        //发请求拿平台属性的列表数据
        this.getAttrList()
      }
      // this.isShowList = true
    },
    //请求获取属性
    async getAttrList(){
      let {category1Id,category2Id,category3Id} = this
      let result = await this.$API.attr.getList(category1Id,category2Id,category3Id)
      if(result.code === 200){
        this.attrList = result.data
      }
    },
    //点击添加按钮显示添加的页面
    showAddDiv(){
      this.isShowList = false
      this.resetAttrForm()
    },
    //点击修改按钮
    showUpdateDiv(row){
      this.isShowList = false
      // this.attrForm = {...row}
      // 这次这里不能使用浅拷贝，因为attrList数组内部的元素是一个对象类型，浅拷拷的还是每一项元素的地址
      // 拷贝的每一项元素中的attrValueList数组用的还是同一个
      this.attrForm = cloneDeep(row)
      
      // 这里代表修改属性,修改属性时,已存在的属性值也要添加显示模式
      // 这样添加的属性不是响应式属性
      // this.attrForm.attrValueList.forEach(item => item.isEdit = false)

      // 需要这样添加
      this.attrForm.attrValueList.forEach(item => this.$set(item,'isEdit',false))
    },

    //点击添加属性值
    addAttrValue(){
      this.attrForm.attrValueList.push({
        valueName:'',
        id:'',    // 暂时没有id
        attrId:this.attrForm.id,  //这个id是标记该属性值是哪个属性的
        isEdit:true   // 这个属性值标识这个属性的模式是编辑模式还是查看
      })
      //新添加的属性值,input需要自动获取焦点
      //新添加的永远是最后一个
      this.$nextTick(() => {
        this.$refs[this.attrForm.attrValueList.length - 1].focus()
      })
      
    },
    //点击取消重置attrForm
    resetAttrForm(){
      this.attrForm = {
        attrName:'',  //属性名称
        attrValueList:[],
        categoryId:this.category3Id,
        categoryLevel:3
      }
    },
    //对input失去焦点或者回车,切换为查看模式
    toLook(row){
      // 失去焦点时要判断有没有内容,如果没有值或者值不合法那么不会变为span
      if(row.valueName.trim() === ''){
        row.valueName = '' 
        return
      }
      //判断与其他属性值是否重复,如果重复提示重复 不能变为span
      let isRepeat = this.attrForm.attrValueList.some(item => {
        if(item !== row){
          return item.valueName === row.valueName
        }
      })

      if(isRepeat){
        this.$message.info('输入的属性值名称不能重复')
        row.valueName = ''
        return 
      }
      row.isEdit = false
    },
    //对span进行点击的时候,切换为编辑模式
    toEdit(row,index){
      row.isEdit = true

      //从span变为input,需要自动获取焦点
      //this.$nextTick(()=>{})等待最近一次页面更新完成以后才会执行
      this.$nextTick(() => {
        this.$refs[index].focus()
      })
    },
    //保存属性
    async save(){
      // 1.获取参数
      let attr = this.attrForm
      // 2.整理参数 去除空串 去除isEdit
      attr.attrValueList = attr.attrValueList.filter(item => {
        if(item.valueName !== ''){
          delete item.isEdit
          return true
        }
      })
      // 3.属性值列表如果没有属性值 不发请求
      if(attr.attrValueList.length === 0){
        this.$message.info('属性值列表必须有属性值才能保存')
        return
      }
      // 4.发请求保存
      try {
        await this.$API.attr.addOrUpdate(attr)
        this.$message.success('保存成功')
        this.isShowList = true
        //发请求重新拿平台属性的列表数据
        this.getAttrList()
      } catch (error) {
        this.$message.error('保存失败')
      }
    },
    //删除属性
    async deleteAttr(row){
      try {
        await this.$API.attr.deleteAttr(row.id)
        this.$message.success('删除成功')
        //发请求重新拿平台属性的列表数据
        this.getAttrList()
      } catch (error) {
        this.$message.success('删除失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>