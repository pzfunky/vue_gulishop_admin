//这是获取三级分类的接口请求函数
import request from '@/utils/request'

export default {
    //获取一级分类列表
    getCategory1(){
        return request.get('/admin/product/getCategory1')
    },
    //根据一级分类id 获取二级分类列表
    getCategory2(category1Id){
        return request.get(`/admin/product/getCategory2/${category1Id}`)
    },
    //根据二级分类id 获取三级分类列表
    getCategory3(category2Id){
        return request.get(`/admin/product/getCategory3/${category2Id}/`)
    }
}