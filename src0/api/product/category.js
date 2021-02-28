//这是获取三级联动分类列表的接口请求函数
import requset from '@/utils/request'

export default {
    // GET /admin/product/getCategory1
    getCategory1(){
        return requset.get('/admin/product/getCategory1')
    },

    // GET /admin/product/getCategory2/{category1Id}
    getCategory2(category1Id){
        return requset.get(`/admin/product/getCategory2/${category1Id}`)
    },

    // GET /admin/product/getCategory3/{category2Id}
    getCategory3(category2Id){
        return requset.get(`/admin/product/getCategory3/${category2Id}`)
    }

}