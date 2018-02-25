/*
 * @Author: Lienren 
 * @Date: 2018-01-25 17:25:23 
 * @Last Modified by: Lienren
 * @Last Modified time: 2018-02-09 14:18:39
 */
('use strict');
const squel = require('squel');
const moment = require('moment');
const Router = require('koa-router');
const router = new Router();

router
  .get('/', async (ctx, next) => {
    ctx.body = `weclome to niuzaitu web site`;
  })
  .post('/order/:ordersn', async (ctx, next) => {
    if (ctx.params.ordersn) {
      let sql = squel
        .select()
        .from('print_order')
        .where('right(ordersn,9) = ?', ctx.params.ordersn)
        .toParam();

      let result = await ctx.db.query({
        sql: sql.text,
        values: sql.values
      });

      if (result.length > 0) {
        ctx.body = {
          ordersn: result[0].ordersn,
          realname: result[0].realname,
          mobile: result[0].mobile,
          province: result[0].province,
          city: result[0].city,
          area: result[0].area,
          address: result[0].address
        };
      } else {
        ctx.body = {};
      }
    }

    next();
  })
  .post('/getprintorders', async (ctx, next) => {
    let pstime = ctx.request.body.pstime || 0;
    let petime = ctx.request.body.petime || 253402271999;
    let paystime = ctx.request.body.paystime || 0;
    let payetime = ctx.request.body.payetime || 253402271999;
    let cstime = ctx.request.body.cstime || 0;
    let cetime = ctx.request.body.cetime || 253402271999;
    let pstatue = ctx.request.body.pstatue || [0];
    let ordersn = ctx.request.body.ordersn || '';
    let lordersn = ctx.request.body.lordersn || '';
    let realname = ctx.request.body.realname || '';
    let mobile = ctx.request.body.mobile || '';
    let sql = squel
      .select()
      .from('print_order')
      .where('pstatue in ?', pstatue)
      .where('ptime between ? and ?', pstime, petime)
      .where('addtime between ? and ?', cstime, cetime)
      .where('paytime between ? and ?', paystime, payetime);

    if (ordersn !== '') {
      sql.where('ordersn = ?', ordersn);
    }

    if (lordersn !== '') {
      sql.where("ordersn like '" + lordersn + "%'");
    }

    if (realname !== '') {
      sql.where('realname = ?', realname);
    }

    if (mobile !== '') {
      sql.where('mobile = ?', mobile);
    }

    sql = sql.toParam();

    let result = await ctx.db.query({
      sql: sql.text,
      values: sql.values
    });

    ctx.body = result;

    next();
  })
  .post('/setprintorder', async (ctx, next) => {
    let id = ctx.request.body.id || 0;
    let opname = ctx.request.body.opname || '';
    let unixtime = moment().unix();

    // 更新打印表数据
    let sql = squel
      .update()
      .table('print_order')
      .setFields({
        opname: opname,
        optime: unixtime,
        pstatue: 1,
        ptime: unixtime,
        updatetime: unixtime
      })
      .where('id = ? and pstatue = ?', id, 0)
      .toParam();

    let result = await ctx.db.update({
      sql: sql.text,
      values: sql.values
    });

    if (result.rows && result.rows > 0) {
      // 更新原订单数据
      sql = squel
        .update()
        .table('ims_ewei_shop_order')
        .setFields({
          status: 2,
          sendtime: unixtime
        })
        .where('id = ? and status = ?', id, 1)
        .toParam();

      result = await ctx.source_db.update({
        sql: sql.text,
        values: sql.values
      });

      ctx.body = {
        result: 1
      };
    } else {
      ctx.body = {
        result: 0
      };
    }

    next();
  })
  .post('/getsysinfo', async (ctx, next) => {
    let sql = squel
      .select()
      .from('sys_unixtime')
      .where('id = ?', 1)
      .toParam();

    let result = await ctx.db.query({
      sql: sql.text,
      values: sql.values
    });

    if (result && result.length > 0) {
      // 当前时间与数据时间小于360，则正常
      ctx.body = {
        status: moment().unix() - result[0].unixtime <= 360 ? 1 : 0,
        lasttime: result[0].unixtime,
        count: result[0].count
      };
    } else {
      ctx.body = {
        status: 0,
        lasttime: 0,
        count: 0
      };
    }

    next();
  });

module.exports = router.routes();
