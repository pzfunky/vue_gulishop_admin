import { login, logout, getInfo } from '@/api/acl/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { default as router, allAsyncRoutes, resetRouter, anyRoute, constantRoutes } from '@/router'
// import router from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),  //用户登陆成功的token
    name: '', //获取用户信息保存用户信息的名称
    avatar: '',  //获取用户信息保存用户信息的头像
    //和权限相关的数据
    buttons:[],  //按钮权限相关的数据
    roles:[],   //和用户角色相关的数据
    routes:[],   //和用户相关的所有路由配置数组,这个数组是后期用户形成的最终路由数组,里面是路由对象,不是字符串数据
    asyncRoutes:[]    //和用户相关的所有异步路由配置数组,这个数组也是路由数组
  }
}

//封装函数,用于根据用户返回的routes路由name组成的字符串过滤出用户真正的异步路由数组
function filterMyAsyncRoutes(allAsyncRoutes,routeNames){
  const myAsyncRoutes = allAsyncRoutes.filter(item => {
    if(routeNames.indexOf(item.name) !== -1){
      //继续判断二级路由,使用递归去操作
      if(item.children && item.children.length > 0){
        //递归查找符合条件的二级路由,然后把二级路由整体改为符合条件的二级路由
        item.children = filterMyAsyncRoutes(item.children,routeNames)
      }
      return true
    }
  })
  return myAsyncRoutes
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERINFO(state,userInfo){
    state.name = userInfo.name,
    state.avatar = userInfo.avatar,
    state.buttons = userInfo.buttons,
    state.roles = userInfo.roles
  },
  SET_ROUTES(state,myAsyncRoutes){
    state.asyncRoutes = myAsyncRoutes,  //把过滤出来的异步路由保存起来
    //使用常量路由和任意路由拼接异步路由,形成自己最终的所有路由数组
    state.routes = constantRoutes.concat(myAsyncRoutes,anyRoute)    
    //现在目前的路由当中只有常量路由,目前我们需要将路由器当中配的路由动态的改成我们最终的路由
    //动态往路由器中添加路由
    //目前我们的路由配置当中已经有了常量路由,我们需要把用户自己的异步路由和任意路由给动态添加
    //动态得把自己的异步路由和任意路由注册到路由器内部的路由数组
    router.addRoutes([...myAsyncRoutes,anyRoute])   
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        // const { name, avatar } = data

        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)
        commit('SET_USERINFO',data)

        //根据用户信息返回的routes,从所有的异步路由数组中过滤出用户自己的所有异步路由
        //data.routes是字符串,字符串都是由路由的name值组成
        commit('SET_ROUTES',filterMyAsyncRoutes(allAsyncRoutes,data.routes))
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

