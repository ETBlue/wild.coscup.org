
//儲存倒數計時html jQuery物件快取
var $countDown;
$(function() {
  //開始快取需要用到的jQuery物件
  $countDown = $('[data-countdown-html][data-use-schedule]');
  //載入排程資料
  loadSchduleData().done(function() {
    //移除loading UI
    $('#loader').remove();
    //綁定schedule相關事件
    bindScheduleEvent();
    //啟動倒數計時
    activeCountDown();
  });
});

//載入排程資料
function loadSchduleData() {
  var loadActionList = {};
  _.each(CONFIG.schedule, function(scheduleSetting, scheduleType) {
    //宣告deferred物件
    var loadingAction = new $.Deferred();
    loadActionList[ scheduleType ] = loadingAction;
    //使用table top載入資料
    Tabletop.init({
      key: scheduleSetting.url,
      simpleSheet: true,
      callback: function(scheduleLists) {
        //重置data屬性
        scheduleSetting.data = {};
        _.each(scheduleLists, function(scheduleData) {
          //轉譯來自API的排程資料為系統使用的資料格式
          scheduleData = parseScheduleData(scheduleData);
          //存入scheduleSetting的data中
          scheduleSetting.data[ scheduleData.id ] = scheduleData;
          //依據此排程開始時間決定是否修改活動開始時間
          if (!scheduleSetting.startTime || scheduleData.activeTime.diff(scheduleSetting.startTime) < 0) {
            scheduleSetting.startTime = scheduleData.activeTime;
          }
          //依據此排程結束時間決定是否修改活動結束時間
          if (!scheduleSetting.endTime || scheduleData.expireTime.diff(scheduleSetting.endTime) > 0) {
            scheduleSetting.endTime = scheduleData.expireTime;
          }
        });
        //結束載入動作
        loadingAction.resolve(scheduleLists);
      }
    });
  });
  loadActionList = _.toArray(loadActionList);
  return $.when.apply($, loadActionList);
}

//轉譯來自API的排程資料為系統使用的資料格式
function parseScheduleData(scheduleData) {
  var result = _.clone(scheduleData);
  //以moment轉譯時間
  result.activeTime = moment(scheduleData.activeTime + ' ' + CONFIG.timezone, CONFIG.timeformat + ' ZZ');
  result.expireTime = moment(scheduleData.expireTime + ' ' + CONFIG.timezone, CONFIG.timeformat + ' ZZ');
  return result;
}

//綁定排程相關事件
function bindScheduleEvent() {
  var nowActiveSchedule;
  //當啟動的排程類別變更時執行
  var changeActiveScheduleTo = function(scheduleType) {
    nowActiveSchedule = scheduleType;
    //將啟動排程的link加上active class，其他移除
    $('[data-change-schedule]')
      .removeClass('active')
      .filter('[data-change-schedule="' + nowActiveSchedule + '"]')
        .addClass('active');
    //隱藏非啟動的排程，顯示啟動的排程
    $('[data-use-schedule]')
      .hide()
      .filter('[data-use-schedule="' + nowActiveSchedule + '"]')
        .show();
    //立刻執行倒數計時
    countDown();
  };
  //使用者切換瀏覽排程類別事件
  $('body').on("click", '[data-change-schedule]', function() {
    changeActiveScheduleTo( $(this).attr('data-change-schedule') );
  });
  //初始化後啟動預設的schedule
  changeActiveScheduleTo(CONFIG.defaultSchedule);
}

//啟動倒數計時
function activeCountDown() {
  //開始倒數計時
  countDown();
  setInterval(countDown, 1000);
}

//顯示倒數計時結果的函數
function countDown() {
  var now = moment();
  $countDown.filter(':visible').each(function() {
    var $thisCountDown = $(this);
    var useSchdule = $thisCountDown.attr('data-use-schedule');
    var scheduleSetting = CONFIG.schedule[useSchdule];
    var scheduleData = scheduleSetting.data || {};
    var htmlResult;
    var processingSchedule;
    var nextSchedule;
    //若活動未開始
    if (scheduleSetting.startTime.diff(now) >= 0) {
      htmlResult = '籌備中！距離活動開始還有' + generateCountDownHtml(now, scheduleSetting.startTime);
      $thisCountDown.html( htmlResult );
    }
    //若活動已開始未結束
    else if (scheduleSetting.endTime.diff(now) >= 0) {
      //判斷是否排程進行中
      _.some(scheduleData, function(data) {
        //判斷是否為進行中的排程
        if (data.activeTime.diff(now) <= 0 && data.expireTime.diff(now) >= 0) {
          processingSchedule = data;
          return true;
        }
        //若為未開始排程
        if (data.activeTime.diff(now) >= 0) {
          //判斷是否為最接近開始的排程
          if (!nextSchedule || nextSchedule.activeTime.diff(data.activeTime) < 0) {
            nextSchedule = data;
          }
        }
        else {
          nextSchedule = data;
        }
        return false;
      });
      //有排程進行中時，顯示此排程的結束時間倒數計時
      if (processingSchedule) {
        htmlResult = '議程進行中！距離休息時間還有' + generateCountDownHtml(now, processingSchedule.expireTime);
        $thisCountDown.html( htmlResult );
      }
      //沒有排程進行中時，顯示距離下一個排程的開始時間倒數計時
      else {
        htmlResult = '休息中！距離議程開始時間還有' + generateCountDownHtml(now, nextSchedule.activeTime);
        $thisCountDown.html( htmlResult );
      }
    }
    else {
      $thisCountDown.remove();
    }
  });
}

//根據現在時間與目標時間，產生倒數計時html
function generateCountDownHtml(nowTime, nextTime) {
  var htmlResult = '';
  if (nextTime.diff(nowTime, 'days') > 0) {
    htmlResult += '<span class="number">' + nextTime.diff(nowTime, 'days') + '</span>天';
  }
  if (nextTime.diff(nowTime, 'hours') > 0) {
    htmlResult += '<span class="number">' + nextTime.diff(nowTime, 'hours') + '</span>小時';
  }
  if (nextTime.diff(nowTime, 'minutes') > 0) {
    htmlResult += '<span class="number">' + nextTime.diff(nowTime, 'minutes') + '</span>分鐘';
  }
  if (nextTime.diff(nowTime, 'seconds') > 0) {
    htmlResult += '<span class="number">' + (nextTime.diff(nowTime, 'seconds') % 60) + '</span>秒';
  }
  return htmlResult;
}