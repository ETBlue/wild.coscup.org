$(function() {
  //開始載入資料
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

  //資料載入完畢時開始程式
  $.when.apply($, loadActionList).done(function() {
    //移除loading UI
    $('#loader').remove();
    //倒數計時
    var $countDown = $('[data-countdown-html][data-use-schdule]');
    var countDown = function() {
      var now = moment();
      $countDown.filter(':visible').each(function() {
        var $thisCountDown = $(this);
        var useSchdule = $thisCountDown.attr('data-use-schdule');
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
    };
    //開始倒數計時
    countDown();
    setInterval(countDown, 1000);
  });
});

//轉譯來自API的排程資料為系統使用的資料格式
function parseScheduleData(scheduleData) {
  var result = _.clone(scheduleData);
  //以moment轉譯時間
  result.activeTime = moment(scheduleData.activeTime + ' ' + CONFIG.timezone, CONFIG.timeformat + ' ZZ');
  result.expireTime = moment(scheduleData.expireTime + ' ' + CONFIG.timezone, CONFIG.timeformat + ' ZZ');
  return result;
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