/*
 * @Author: Lienren 
 * @Date: 2018-01-25 17:25:18 
 * @Last Modified by: Lienren
 * @Last Modified time: 2018-01-26 18:27:53
 */
'use strict';
const http = require('http');
const path = require('path');
const koa = require('koa');
const koastatic = require('koa-static');
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser');
const app = new koa();

const sys_config = require('./configs/sys_config');

// mysql数据库初始化
const new_mysql_config = require('./configs/new_mysql_config');
const new_sqlhelper = require('mysql-helper-simple')(new_mysql_config);
app.context.db = new_sqlhelper;

// mysql数据库初始化
const source_mysql_config = require('./configs/source_mysql_config');
const source_sqlhelper = require('mysql-helper-simple')(source_mysql_config);
app.context.source_db = source_sqlhelper;

// 静态存放地址
const staticPath = './static';
app.use(koastatic(path.join(__dirname, staticPath)));

// 配置跨域访问
app.use(cors());

// 使用koa-bodyparser中间件
app.use(bodyParser());

// 全局处理异常
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.body = {
      code: err.code,
      message: err.message
    };
    ctx.status = err.status || 500;
  }
});

// 使用路由
const router = require('./router');
app.use(router);

// 结构化返回参数
app.use(async (ctx, next) => {
  if (ctx.method === 'POST') {
    ctx.body = {
      code: '000000',
      msg: 'success',
      data: ctx.body
    };
  }

  await next();
});

// 绑定访问端口
http.createServer(app.callback()).listen(sys_config.port);
