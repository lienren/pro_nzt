/*
 * @Author: Lienren 
 * @Date: 2018-01-25 18:02:45 
 * @Last Modified by: Lienren
 * @Last Modified time: 2018-01-29 21:16:27
 */
('use strict');
const _ = require('lodash');
const timing = require('timing-simple');
const lib = require('./lib');

const timespan = 10 * 1000;

(function() {
  // 初始化
  lib().init();

  // 获取数据，插入数据
  let t = timing()
    .init(timespan)
    .run((count, time, unixtime) => {
      lib().getdata(unixtime - timespan * 2 / 1000, result => {
        console.log('count:%s,unixtime:%s,result:%s', count, unixtime, result.length);
        // 记录插入的数据
        lib().setdatalog(unixtime, result);

        // 开始插入
        _.each(result, data => {
          lib().setdata({
            ...data,
            ...{
              addtime: unixtime,
              updatetime: 0,
              opname: '',
              optime: 0,
              pstatue: 0,
              ptime: 0
            }
          });
        });

        // 设置最后一次获取数据时间
        lib().setunixtimelog(unixtime);
      });
      return true;
    });
})();
