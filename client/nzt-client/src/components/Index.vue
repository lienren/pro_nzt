<template>
  <div class="nzt-main">
    <el-container style="width:100%;height:100%;">
      <el-aside class="nzt-side-menu" width="200px">
        <div class="nzt-side-title">
          <div>NZT Print System</div>
        </div>
        <div>
          <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            @select="handleMenuSelect"
            background-color="#20222a"
            text-color="rgba(255,255,255,.7)"
            active-text-color="#fff">
            <el-menu-item index="1">
              <i class="el-icon-printer"></i>
              <span slot="title">未打印订单</span>
            </el-menu-item>
            <el-menu-item index="2">
              <i class="el-icon-circle-check-outline"></i>
              <span slot="title">已打印订单</span>
            </el-menu-item>
            <el-menu-item index="3">
              <i class="el-icon-setting"></i>
              <span slot="title">系统配置</span>
            </el-menu-item>
            <el-menu-item index="999">
              <i class="el-icon-circle-close-outline"></i>
              <span slot="title">退出</span>
            </el-menu-item>
          </el-menu>
        </div>
        <div class="nzt-server-status">
          <div>服务状态<span v-if="sysStatus===1" class="succ">正常</span><span v-if="sysStatus!==1" class="error">异常</span></div>
          <div>运行次数<span v-if="sysStatus===1" class="succ">{{sysCount}}</span><span v-if="sysStatus!==1" class="error">{{sysCount}}</span></div>
          <div><i class="el-icon-time" style="margin-right:2px;"></i>{{sysLastTime}}</div>
        </div>
        <div class="nzt-version">
          <div>PRESENTED BY Ler. R&D TEAM 2018.</div>
        </div>
      </el-aside>
      <el-main>
        <h3 style="margin-bottom:0;">{{menuNameList[menuIndex]}}</h3>
        <el-collapse-transition>
          <div v-show="menuIndex===1">
            <el-table :height="tabHeight" :data="menuTableData1" style="width: 100%" stripe>
              <el-table-column prop="date" label="支付日期" width="150"></el-table-column>
              <el-table-column prop="ordersn" label="订单号" width="180"></el-table-column>
              <el-table-column label="用户信息" width="120">
                <template slot-scope="scope">
                  <div>{{ scope.row.realname }}</div>
                  <div>{{ scope.row.mobile }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="address" label="地址"></el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                  <el-button @click="handlePrintClick(scope.row)" type="text" size="medium" icon="el-icon-printer">立即打印</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div style="line-height:70px;text-align:center;">
              <el-button type="primary" round icon="el-icon-printer" @click="handlePrintAllClick">全部打印</el-button>
              <el-button type="warning" round icon="el-icon-search" @click="menuDialogFormVisible1=true">筛选订单</el-button>
              <el-button round icon="el-icon-refresh" @click="searchCondition1">刷新数据</el-button>
            </div>
          </div>
        </el-collapse-transition>
        <el-collapse-transition>
          <div v-show="menuIndex===2">
            <el-table :height="tabHeight" :data="menuTableData2" style="width: 100%" stripe>
              <el-table-column prop="date" label="支付日期" width="150"></el-table-column>
              <el-table-column prop="ordersn" label="订单号" width="180"></el-table-column>
              <el-table-column label="用户信息" width="120">
                <template slot-scope="scope">
                  <div>{{ scope.row.realname }}</div>
                  <div>{{ scope.row.mobile }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="address" label="地址"></el-table-column>
              <el-table-column prop="printtime" label="打印时间"  width="150"></el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                  <el-button @click="handlePrintClick(scope.row)" type="text" size="medium" icon="el-icon-printer">重新打印</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div style="line-height:70px;text-align:center;">
              <el-button type="warning" round icon="el-icon-search" @click="menuDialogFormVisible2=true">筛选订单</el-button>
              <el-button round icon="el-icon-refresh" @click="searchCondition2">刷新数据</el-button>
            </div>
          </div>
        </el-collapse-transition>
        <el-collapse-transition>
          <div v-show="menuIndex===3">
            <br />
            <el-form label-width="120px">
              <el-form-item label="选择打印机">
                <el-select v-model="menuPrintName" placeholder="请选择打印机（不选则默认）" clearable style="width:30%;">
                  <el-option v-for="(item, index) in printNameList" :key="index" :label="item" :value="item"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" round icon="el-icon-circle-check-outline" @click="saveSelectPrintName">立即保存</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-transition>
      </el-main>
    </el-container>

    <el-dialog title="筛选条件" :visible.sync="menuDialogFormVisible1">
      <el-form>
        <el-form-item label="订单号前缀" label-width="100px">
          <el-input v-model="menuDialogFormOrderPrefix1" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="订单号" label-width="100px">
          <el-input v-model="menuDialogFormOrderSn1" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" label-width="100px">
          <el-input v-model="menuDialogFormRealName1" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" label-width="100px">
          <el-input v-model="menuDialogFormMobile1" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="支付时间" label-width="100px">
          <el-date-picker
            v-model="menuDialogFormPaytime1"
            type="daterange"
            align="right"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="menuDialogFormPickerOptions">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="menuDialogFormVisible1=false" round icon="el-icon-close">关闭</el-button>
        <el-button type="warning" @click="clearSearchCondition1" round icon="el-icon-delete">清空条件</el-button>
        <el-button type="primary" @click="searchCondition1" round icon="el-icon-search">确定筛选</el-button>
      </div>
    </el-dialog>

    <el-dialog title="筛选条件" :visible.sync="menuDialogFormVisible2">
      <el-form>
        <el-form-item label="订单号前缀" label-width="100px">
          <el-input v-model="menuDialogFormOrderPrefix2" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="订单号" label-width="100px">
          <el-input v-model="menuDialogFormOrderSn2" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" label-width="100px">
          <el-input v-model="menuDialogFormRealName2" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" label-width="100px">
          <el-input v-model="menuDialogFormMobile2" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="支付时间" label-width="100px">
          <el-date-picker
            v-model="menuDialogFormPaytime2"
            type="daterange"
            align="right"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="menuDialogFormPickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="打印时间" label-width="100px">
          <el-date-picker
            v-model="menuDialogFormPrinttime2"
            type="daterange"
            align="right"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="menuDialogFormPickerOptions">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="menuDialogFormVisible2=false" round icon="el-icon-close">关闭</el-button>
        <el-button type="warning" @click="clearSearchCondition2" round icon="el-icon-delete">清空条件</el-button>
        <el-button type="primary" @click="searchCondition2" round icon="el-icon-search">确定筛选</el-button>
      </div>
    </el-dialog>

    <el-dialog title="正在打印订单" :show-close="false" :close-on-click-modal="false" :visible.sync="menuDialogPrintVisible">
      <el-progress :text-inside="true" :stroke-width="18" :percentage="printPercentage"></el-progress>
      <div v-if="menuDialogPrintVisible" style="text-align:center;margin:20px 0 5px;font-size:12px;">正在打印 <span style="font-weight:bold;font-size:14px;">{{menuTableData1[printNowIndex].ordersn}} {{menuTableData1[printNowIndex].realname}}</span> 的订单</div>
      <div style="text-align:center;margin:5px 0;font-size:12px;">共{{printSum}}个/剩{{printSum-printOver}}个</div>
      <div style="text-align:center;margin:5px 0 0;font-size:14px;color:#ff0000;">正在打印，请勿关闭或刷新</div>
    </el-dialog>
  </div>
</template>
<script>
import http from '../http'
import _ from 'lodash'
import moment from 'moment'

// eslint-disable-next-line
var printNames = []
// eslint-disable-next-line
var localPrintName = ''
// eslint-disable-next-line
window.getPrintNameList = function () {
  for (let i = 0, j = arguments.length; i < j; i++) {
    printNames.push(arguments[i])
  }
}
// eslint-disable-next-line
window.setPrintName = function() {
  localPrintName = arguments[0]
}

export default {
  name: 'Index',
  data () {
    return {
      menuIndex: 1,
      menuNameList: { 1: '未打印订单', 2: '已打印订单', 3: '系统配置' },
      tabHeight: 500,
      menuDialogFormPickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick (picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      menuDialogFormVisible1: false,
      menuDialogFormOrderPrefix1: '',
      menuDialogFormOrderSn1: '',
      menuDialogFormRealName1: '',
      menuDialogFormMobile1: '',
      menuDialogFormPaytime1: '',
      menuDialogFormVisible2: false,
      menuDialogFormOrderPrefix2: '',
      menuDialogFormOrderSn2: '',
      menuDialogFormRealName2: '',
      menuDialogFormMobile2: '',
      menuDialogFormPaytime2: '',
      menuDialogFormPrinttime2: '',
      menuTableData1: [],
      menuTableData2: [],
      menuPrintName: '',
      menuDialogPrintVisible: false,
      printSum: 0,
      printNowIndex: 0,
      printOver: 0,
      printPercentage: 0,
      printNameList: [],
      sysStatus: 0,
      sysCount: 0,
      sysLastTime: '正在获取...'
    }
  },
  created () {},
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
    const that = this
    window.onresize = () => {
      return (() => {
        that.initWH()
      })()
    }
  },
  methods: {
    init () {
      this.initWH()
      this.getOrders({callback: (result) => {
        this.loadMenuTableData1(result)
      }})

      // 获取服务器状态
      this.getServerStatus()
      setInterval(() => {
        this.getServerStatus()
      }, 60 * 1000)
    },
    initWH () {
      let wh = this.getWH()
      this.tabHeight = wh.height - 40 - 27 - 60
    },
    getOrders ({pstatue = [0], lordersn = '', ordersn = '', realname = '', mobile = '', paystime = 0, payetime = 253402271999, printstime = 0, printetime = 253402271999, callback = (result) => {}}) {
      const loading = this.$loading({
        lock: true,
        text: '加载中...',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.7)'
      })

      http.post('/getprintorders', {
        pstatue: pstatue,
        lordersn: lordersn,
        ordersn: ordersn,
        realname: realname,
        mobile: mobile,
        paystime: paystime,
        payetime: payetime,
        pstime: printstime,
        petime: printetime
      }).then(result => {
        callback(result)
        setTimeout(function () {
          loading.close()
        }, 500)
      })
    },
    handleMenuSelect (index, indexPath) {
      if (parseInt(index) === 999) {
        this.$confirm('即将退出系统, 是否继续?', '提示', {
          confirmButtonText: '确定退出',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.$loading({
              lock: true,
              text: '正在关闭系统',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            setTimeout(function () {
              // eslint-disable-next-line
              window.boundEvent.raiseEvent('formclose')
            }, 500)
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: '取消退出!'
            })
          })
      } else {
        this.menuIndex = parseInt(index)

        switch (this.menuIndex) {
          case 1:
            this.getOrders({callback: (result) => {
              this.loadMenuTableData1(result)
            }})
            this.clearSearchCondition2()
            break
          case 2:
            this.getOrders({
              pstatue: [1],
              callback: (result) => {
                this.loadMenuTableData2(result)
              }})
            this.clearSearchCondition1()
            break
          case 3:
            this.printNameList = printNames
            this.menuPrintName = this.menuPrintName === '' ? localPrintName : this.menuPrintName
            break
        }
      }
    },
    clearSearchCondition1 () {
      this.menuDialogFormOrderPrefix1 = ''
      this.menuDialogFormOrderSn1 = ''
      this.menuDialogFormRealName1 = ''
      this.menuDialogFormMobile1 = ''
      this.menuDialogFormPaytime1 = ''
    },
    clearSearchCondition2 () {
      this.menuDialogFormOrderPrefix2 = ''
      this.menuDialogFormOrderSn2 = ''
      this.menuDialogFormRealName2 = ''
      this.menuDialogFormMobile2 = ''
      this.menuDialogFormPaytime2 = ''
      this.menuDialogFormPrinttime2 = ''
    },
    searchCondition1 () {
      let paystime = 0
      let payetime = 253402271999
      if (this.menuDialogFormPaytime1 !== '') {
        paystime = moment(this.menuDialogFormPaytime1[0]).unix()
        payetime = moment(this.menuDialogFormPaytime1[1]).unix()
      }
      this.getOrders({
        lordersn: this.menuDialogFormOrderPrefix1,
        ordersn: this.menuDialogFormOrderSn1,
        realname: this.menuDialogFormRealName1,
        mobile: this.menuDialogFormMobile1,
        paystime: paystime,
        payetime: payetime,
        callback: (result) => {
          this.loadMenuTableData1(result)
        }})
      this.menuDialogFormVisible1 = false
    },
    searchCondition2 () {
      let paystime = 0
      let payetime = 253402271999
      let printstime = 0
      let printetime = 253402271999
      if (this.menuDialogFormPaytime2 !== '') {
        paystime = moment(this.menuDialogFormPaytime2[0]).unix()
        payetime = moment(this.menuDialogFormPaytime2[1]).unix()
      }
      if (this.menuDialogFormPrinttime2 !== '') {
        printstime = moment(this.menuDialogFormPrinttime2[0]).unix()
        printetime = moment(this.menuDialogFormPrinttime2[1]).unix()
      }
      this.getOrders({
        pstatue: [1],
        lordersn: this.menuDialogFormOrderPrefix2,
        ordersn: this.menuDialogFormOrderSn2,
        realname: this.menuDialogFormRealName2,
        mobile: this.menuDialogFormMobile2,
        paystime: paystime,
        payetime: payetime,
        printstime: printstime,
        printetime: printetime,
        callback: (result) => {
          this.loadMenuTableData2(result)
        }})
      this.menuDialogFormVisible2 = false
    },
    loadMenuTableData1 (result) {
      this.menuTableData1 = []
      _.each(result.data, data => {
        this.menuTableData1.push({
          id: data.id,
          date: moment.unix(data.paytime).format('YYYY-MM-DD HH:mm:ss'),
          ordersn: data.ordersn,
          realname: data.realname,
          mobile: data.mobile,
          address: data.province + ' ' + data.city + ' ' + data.area + ' ' + data.address,
          printtime: 0,
          remark: data.remark
        })
      })
    },
    loadMenuTableData2 (result) {
      this.menuTableData2 = []
      _.each(result.data, data => {
        this.menuTableData2.push({
          id: data.id,
          date: moment.unix(data.paytime).format('YYYY-MM-DD HH:mm:ss'),
          ordersn: data.ordersn,
          realname: data.realname,
          mobile: data.mobile,
          address: data.province + ' ' + data.city + ' ' + data.area + ' ' + data.address,
          printtime: moment.unix(data.ptime).format('YYYY-MM-DD HH:mm:ss'),
          remark: data.remark
        })
      })
    },
    handlePrintClick (row) {
      this.printOrder({
        id: row.id,
        order: row,
        callback: (reslut) => {
          this.$message({
            message: '已成功提交打印！',
            type: 'success'
          })

          if (this.menuIndex === 1) {
            // 如果是未打印订单功能中，则需要刷新数据
            this.searchCondition1()
          }
        }
      })
    },
    handlePrintAllClick () {
      if (this.menuTableData1.length === 0) {
        this.$message.error('没有需要打印的订单！')
        return
      }
      this.$confirm('即将打印全部订单, 是否继续?', '提示', {
        confirmButtonText: '确定继续',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.printSum = this.menuTableData1.length
        this.printNowIndex = 0
        this.printOver = 0
        this.printPercentage = 0
        this.menuDialogPrintVisible = true
        this.printProcess()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消全部打印'
        })
      })
    },
    printProcess () {
      if (this.printNowIndex >= this.printSum) {
        // 打印结束
        this.menuDialogPrintVisible = false
        this.searchCondition1()
        this.$message({
          message: '已全部成功提交打印！',
          type: 'success'
        })
      } else {
        this.printOrder({
          id: this.menuTableData1[this.printNowIndex].id,
          order: this.menuTableData1[this.printNowIndex],
          isloading: false,
          callback: (reslut) => {
            this.printNowIndex++
            this.printOver++
            this.printPercentage = parseFloat((this.printOver / this.printSum * 100).toFixed(2))
            this.printProcess()
          }
        })
      }
    },
    printOrder ({id, order, isloading = true, callback = () => {}}) {
      let loading = null
      if (isloading) {
        loading = this.$loading({
          lock: true,
          text: '正在打印...',
          spinner: 'el-icon-loading',
          background: 'rgba(255, 255, 255, 0.7)'
        })
      }

      /*
      public string ordersn { get; set; }
        public string username { get; set; }
        public string userphone { get; set; }
        public string address { get; set; }
        public string storename { get; set; }
        public string storeemail { get; set; }
        public string storephone { get; set; }
        public DateTime addtime { get; set; }
        public List<QRPrintOrderProduct> products { get; set; }

        public string proname { get; set; }
        public string skuname { get; set; }
        public int count { get; set; }
      */

      // eslint-disable-next-line
      window.boundEvent.raiseEvent('printorder', JSON.stringify(
        {
          ordersn: order.ordersn,
          username: order.realname,
          userphone: order.mobile,
          address: order.address,
          storename: '',
          storeemail: '',
          storephone: '',
          addtime: moment().format('YYYY-MM-DD HH:mm:ss'),
          products: [],
          remark: order.remark
        }
      ))

      http.post('/setprintorder', {
        id: id
      }).then(result => {
        setTimeout(function () {
          if (loading) {
            loading.close()
          }
          callback(result)
        }, 1000)
      })
    },
    saveSelectPrintName () {
      if (this.menuPrintName === '') {
        this.$message.error('请选择一款打印机！')
        return
      }
      // eslint-disable-next-line
      window.boundEvent.raiseEvent('setprintname', this.menuPrintName)

      // 更新打印机名称
      localPrintName = this.menuPrintName

      this.$message({
        message: '保存成功！',
        type: 'success'
      })
    },
    getServerStatus () {
      http.post('/getsysinfo', {}).then(result => {
        this.sysStatus = result.data.status
        this.sysCount = result.data.count
        this.sysLastTime = moment.unix(result.data.lasttime).format('YYYY-MM-DD HH:mm:ss')
      })
    },
    getWH () {
      // eslint-disable-next-line
      let w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight
      return { width: x, height: y }
    }
  }
}
</script>
<style>
.el-menu {
  border: 0;
}
.el-table {
  font-size: 12px;
}
.el-table td {
  padding: 6px 0;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.el-main {
  padding: 0 15px;
}
.nzt-main {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.nzt-side-menu {
  position: relative;
  background-color: #20222a;
  color: #fff;
  width: 100%;
  overflow: hidden;
}
.nzt-side-title {
  text-align: center;
  line-height: 50px;
}
.nzt-side-title div {
  color: #fff;
  font-size: 16px;
}
.nzt-version {
  position: absolute;
  bottom: 10px;
}
.nzt-server-status {
  position: absolute;
  left:20px;
  bottom:30px;
}
.nzt-server-status div {
  margin-bottom:5px;
  color:rgba(255, 255, 255, 0.7);
  font-size:12px;
}
.nzt-server-status .succ {
  display: inline-block;
  background-color:#67C23A;
  color:#fff;
  padding:0 5px;
  border-radius: 20px;
  margin-left:5px;
  font-weight: bold;
}
.nzt-server-status .error {
  display: inline-block;
  background-color:#E6A23C;
  color:#fff;
  padding:0 5px;
  border-radius: 20px;
  margin-left:5px;
  font-weight: bold;
}
.nzt-version div {
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  white-space: nowrap;
  transform: scale(0.8, 0.8);
  -webkit-transform: scale(0.8, 0.8);
  -moz-transform: scale(0.8, 0.8);
}
</style>
