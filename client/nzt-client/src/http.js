/*
 * @Author: Lienren
 * @Date: 2018-01-28 14:46:19
 * @Last Modified by: Lienren
 * @Last Modified time: 2018-01-28 23:36:28
 */
import axios from 'axios'
import config from '../config'
import codes from './httpcodes'

function successParse (res, validator) {
  const obj = res.data
  // 业务成功处理
  if (validator(obj)) {
    return Promise.resolve(obj)
  } else {
    return Promise.reject(obj)
  }
}

function errorParse (error, exceptionHandling) {
  return Promise.reject(error)
}

function requestUrl (url) {
  if (process.env.NODE_ENV === 'development') {
    // 测试环境
    url = '/testApi' + url
  } else {
    // 生产环境
    url = config.build.apiUrl + url
  }
  return url
}

function send (url, method, body, options, validator, errorHandling, exceptionHandling) {
  // 生成请求url
  url = requestUrl(url)
  const opts = { ...options }
  opts.headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
  switch (method) {
    case 'get':
      return axios
        .get(url, opts)
        .then(res => successParse(res, validator, errorHandling))
        .catch(error => errorParse(error, exceptionHandling))
    case 'post':
      return axios
        .post(url, body, opts)
        .then(res => successParse(res, validator, errorHandling))
        .catch(error => errorParse(error, exceptionHandling))
  }
}

export default {
  post (
    url,
    body,
    {
      options = null,
      validator = res => res.code === codes.SUCCESS,
      errorHandling = false,
      exceptionHandling = false
    } = {}
  ) {
    return send(url, 'post', body, options, validator, errorHandling, exceptionHandling)
  }
}
