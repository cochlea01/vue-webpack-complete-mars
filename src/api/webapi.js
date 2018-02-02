// 配置API接口地址
var root = 'http://101.132.96.90:8080/yemaoServer/';
    // root = 'http://192.168.10.104:8080/yemaoServer/';
// 引用axios
var axios = require('axios')
// 自定义判断元素类型JS
function toType (obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
// 参数过滤函数
function filterNull (o) {
  for (var key in o) {
    if (o[key] === null) {
      delete o[key]
    }
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o
}
/*
 接口处理函数
 这个函数每个项目都是不一样的，我现在调整的是适用于
 <a rel="nofollow" href="https://cnodejs.org/api/v1" target="_blank">https://cnodejs.org/api/v1</a> 的接口，如果是其他接口
 需要根据接口的参数进行调整。参考说明文档地址：
 <a rel="nofollow" href="https://cnodejs.org/topic/5378720ed6e2d16149fa16bd" target="_blank">https://cnodejs.org/topic/5378720ed6e2d16149fa16bd</a>
 主要是，不同的接口的成功标识和失败提示是不一致的。
 另外，不同的项目的处理方法也是不一致的，这里出错就是简单的alert
*/

/************************************************/
// 解决后台接收参数错误问题：
// import Qs from 'qs'
// var params = Qs.stringify({ "img":imgData})
/************************************************/

function apiAxios (method, url, params, success, failure) {
  // if (params) {
  //   params = filterNull(params)
  // }
  axios({
    method: method,
    url: url,
    data: method === 'POST' || method === 'PUT' ? params : null,
    params: method === 'GET' || method === 'DELETE' ? params : null,
    baseURL: root,
    withCredentials: false,
    // 解决跨域问题
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(function (res) {
    console.log("status:"+res.status)
    if (res.status === 200) {
      if (success) {
        success(res.data)
      }
    } else {
      if (failure) {
        failure(res.data)
      } else {
        console.log('请求失败！')
        // window.alert('error: ' + JSON.stringify(res.data))
      }
    }
  })
  .catch(function (err) {
    let res = err.response
    if (err) {
      console.log('err: ' + JSON.stringify(err))
      // console.log('api error, HTTP CODE: ' + res.status)
      // window.alert('api error, HTTP CODE: ' + res.status)
    }
  })
}

// 返回在vue模板中的调用接口
export default {
  get: function (url, params, success, failure) {
    return apiAxios('GET', url, params, success, failure)
  },
  post: function (url, params, success, failure) {
    return apiAxios('POST', url, params, success, failure)
  },
  put: function (url, params, success, failure) {
    return apiAxios('PUT', url, params, success, failure)
  },
  delete: function (url, params, success, failure) {
    return apiAxios('DELETE', url, params, success, failure)
  }
}
