//这是trademark的接口请求函数
import request from '@/utils/request'

export default {    
    // DELETE /admin/product/baseTrademark/remove/{id}
    // 删除BaseTrademark
    delete(id){
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },

    // POST /admin/product/baseTrademark/save
    // 新增BaseTrademark
    // PUT /admin/product/baseTrademark/update
    // 修改BaseTrademark
    //这两个方法可以合并 都需要一个请求体参数
    addOrUpdate(trademark){
        //判断trademark的id是否存在
        if(trademark.id){
            //id存在代表为更新操作
            return request.put('/admin/product/baseTrademark/update',trademark)
        }else{
            //id不存在代表为新增操作
            return request.post('/admin/product/baseTrademark/save',trademark)
        }
    },

    // GET /admin/product/baseTrademark/{page}/{limit}
    // 分页列表
    getPageList(page,limit){
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    }    
}