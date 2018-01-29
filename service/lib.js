/*
 * @Author: Lienren 
 * @Date: 2018-01-26 16:46:58 
 * @Last Modified by: Lienren
 * @Last Modified time: 2018-01-26 17:04:41
 */
('use strict');
const fs = require('fs');
const path = require('path');
const source_mysql_config = require('./configs/source_mysql_config');
const new_mysql_config = require('./configs/new_mysql_config');
const source_sqlhelper = require('mysql-helper-simple')(source_mysql_config);
const new_sqlhelper = require('mysql-helper-simple')(new_mysql_config);
const squel = require('squel');

function libs() {
  this.logs_dir = path.join(__dirname, 'logs');
  this.now_unixtime = 0;
  this.now_unixtime_filename = 'unixtime.log';
  this.now_unixtime_filepath = path.join(this.logs_dir, this.now_unixtime_filename);
}

libs.prototype.init = function() {
  if (!fs.existsSync(this.logs_dir)) {
    fs.mkdirSync(this.logs_dir);
  }
};
libs.prototype.setunixtimelog = function(unixtime) {
  let sql = squel
    .update()
    .table('sys_unixtime')
    .setFields({
      unixtime: unixtime,
      'count = count + 1': undefined
    })
    .where('id = ?', 1)
    .toParam();

  new_sqlhelper
    .update({
      sql: sql.text,
      values: sql.values
    })
    .then(result => {
      let log_data = {
        unixtime: unixtime
      };

      fs.writeFileSync(
        this.now_unixtime_filepath,
        JSON.stringify(log_data),
        { flag: 'w', encoding: 'utf-8', mode: '0666' },
        err => {
          if (err) {
            console.log('fs.err:', err);
          }
        }
      );
    });
};
libs.prototype.setdatalog = function(unixtime, data) {
  let sql = squel
    .insert()
    .into('sys_datalog')
    .set('data', JSON.stringify(data))
    .set('addtime', unixtime)
    .toParam();

  new_sqlhelper
    .create({
      sql: sql.text,
      values: sql.values
    })
    .then(reslut => {
      let now_data_filename = unixtime + '.log';
      let now_data_dir1 = path.join(this.logs_dir, unixtime.toString().substring(0, 3));
      let now_data_dir2 = path.join(now_data_dir1, unixtime.toString().substring(0, 6));
      let now_data_filepath = path.join(now_data_dir2, now_data_filename);

      if (!fs.existsSync(now_data_dir1)) {
        fs.mkdirSync(now_data_dir1);
      }

      if (!fs.existsSync(now_data_dir2)) {
        fs.mkdirSync(now_data_dir2);
      }

      fs.writeFileSync(now_data_filepath, JSON.stringify(data), { flag: 'w', encoding: 'utf-8', mode: '0666' }, err => {
        if (err) {
          console.log('fs.err:', err);
        }
      });
    });
};
libs.prototype.getdata = function(timestamp, callback) {
  let sql = squel
    .select({ autoQuoteFieldNames: true })
    .from('ims_ewei_shop_order', 'o')
    .field('o.id')
    .field('o.uniacid')
    .field('o.openid')
    .field('o.ordersn')
    .field('o.price')
    .field('o.goodsprice')
    .field('o.discountprice')
    .field('o.status')
    .field('o.paytype')
    .field('o.remark')
    .field('o.addressid')
    .field('o.address', 'addressbig')
    .field('o.createtime')
    .field('o.finishtime')
    .field('o.paytime')
    .field('addr.realname')
    .field('addr.mobile')
    .field('addr.province')
    .field('addr.city')
    .field('addr.area')
    .field('addr.address')
    .join('ims_ewei_shop_member_address', 'addr', 'addr.id = o.addressid')
    .where('status = ? and paytime >= ?', 1, timestamp)
    .toParam();

  source_sqlhelper
    .query({
      sql: sql.text,
      values: sql.values
    })
    .then(result => {
      if (typeof callback === 'function') {
        callback(result);
      }
    });
};
libs.prototype.setdata = function(data, callback) {
  let sql_query = squel
    .select()
    .from('print_order')
    .where('id = ?', data.id)
    .toParam();

  let sql_insert = squel.insert().into('print_order');
  for (var key in data) {
    sql_insert.set(key, data[key]);
  }
  sql_insert = sql_insert.toParam();

  // 查询数据是否存在
  new_sqlhelper
    .query({
      sql: sql_query.text,
      values: sql_query.values
    })
    .then(result => {
      if (result && result.length === 0) {
        // 数据不存在时，插入
        new_sqlhelper
          .create({
            sql: sql_insert.text,
            values: sql_insert.values
          })
          .then(result => {
            if (typeof callback === 'function') {
              callback(result);
            }
          });
      }
    });
};

module.exports = () => {
  return new libs();
};
