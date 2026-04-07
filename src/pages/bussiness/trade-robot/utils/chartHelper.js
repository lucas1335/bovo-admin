import { _add, _mul, _sub, _div } from './decimal';

/**
 * 获取一天时间 时间间隔列表
 * @param {Date|number} time - 开始时间
 * @param {number} timeInterval - 时间间隔（分钟）
 * @param {number} timeDiff - 时间差（分钟），可选
 * @returns {number[]} 时间戳数组
 */
export const generateTimeList = (time, timeInterval, timeDiff) => {
  const startTime = new Date(time).setSeconds(0, 0);
  let endTime = new Date(startTime).setDate(new Date(startTime).getDate() + 1);

  if (timeDiff) {
    endTime = new Date(startTime).getTime() + timeDiff * 60 * 1000;
  }

  const interval = timeInterval * 60 * 1000;
  const timeArray = Array.from(
    { length: Math.ceil((endTime - startTime) / interval) },
    (_, index) => startTime + index * interval
  );
  timeArray.push(endTime);

  return timeArray;
};

/**
 * 获取随机值列表
 * @param {number} count - 数量
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {Array} 随机值数组
 */
export const getRandomIntegers = (count, min, max) => {
  return Array.from({ length: count }, (_, index) => [
    index,
    Math.floor(Math.random() * (max - min + 1)) + min,
  ]);
};

/**
 * 获取分割数据
 * @param {number} totalMinutes - 总分钟数
 * @param {number} unit - 刻度单位
 * @returns {number[]} 时间列表
 */
export const distributeMinutes = (totalMinutes, unit) => {
  const timeList = [];
  const count = Math.floor(totalMinutes / unit);

  for (let i = 0; i <= count; i++) {
    timeList.push(i * unit);
  }
  return timeList;
};

/**
 * 随机涨跌
 * @returns {boolean}
 */
const randomUD = () => Math.random() >= 0.5;

/**
 * 随机K线数据
 * @param {number[]} xTimeScaleList - X轴时间列表
 * @param {number[]} klineYRandomList - K线Y轴随机列表
 * @param {number} pricePencent - 价格百分比
 * @returns {Object} K线配置对象
 */
export const getMockKLineOption = (xTimeScaleList, klineYRandomList, pricePencent) => {
  if (xTimeScaleList.length && klineYRandomList.length && pricePencent) {
    const klineMockYData = xTimeScaleList.map((_, index) => {
      const randClose = Math.ceil(Math.random() * pricePencent);
      const randHigh = Math.ceil(Math.random() * pricePencent);
      const randLow = Math.ceil(Math.random() * pricePencent);

      let currentKLineY = klineYRandomList[index];
      if (!Number(klineYRandomList[index])) {
        currentKLineY = 1;
      }

      const tempObj = {};

      if (index === 0) {
        tempObj.open = 0;
      } else {
        tempObj.open = klineYRandomList[index - 1];
      }

      // 随机涨跌
      if (randomUD()) {
        tempObj.close = _add(
          klineYRandomList[index],
          _mul(currentKLineY, randClose / 100)
        );
      } else {
        tempObj.close = _sub(
          klineYRandomList[index],
          _mul(currentKLineY, randClose / 100)
        );
      }

      if (tempObj.open > tempObj.close) {
        // 开盘价大于收盘价
        tempObj.high = _add(tempObj.open, _mul(tempObj.open, randHigh / 100));
        tempObj.low = _sub(tempObj.close, _mul(tempObj.close, randLow / 100));
      } else {
        // 开盘价小于收盘价
        tempObj.high = _add(tempObj.close, _mul(tempObj.close, randHigh / 100));
        tempObj.low = _sub(tempObj.open, _mul(tempObj.open, randLow / 100));
      }

      return [tempObj.open, tempObj.close, tempObj.high, tempObj.low];
    });

    return {
      xAxis: { data: xTimeScaleList },
      series: [{ data: klineMockYData }],
    };
  }

  return { xAxis: { data: [] }, series: [{ data: [] }] };
};

/**
 * 计算曲线坐标值
 * @param {number[]} xList - X轴列表
 * @param {Array} yList - Y轴列表
 * @returns {number[]} 计算后的Y轴列表
 */
export const getKLineYRandomList = (xList, yList) => {
  const tempKLineYRandomList = [];
  const precision = _div(xList.length - 1, yList.length - 1);

  yList.forEach((elem, i) => {
    const nextElem = yList[i + 1] || elem;
    for (let j = i * precision; j < (i + 1) * precision; j++) {
      const diff = _sub(elem[1], nextElem[1]);
      let result = 0;

      const diffDivided = _div(diff, precision);
      const relativeDistance = _sub(j, _mul(i, precision));
      const halfPiTimesRelativeDistance = _mul(_div(Math.PI, 2), relativeDistance);
      const sinValue = Math.sin(_div(halfPiTimesRelativeDistance, precision));
      result = _sub(elem[1], _mul(_mul(diffDivided, relativeDistance), sinValue));

      tempKLineYRandomList[j] = result;
    }
  });

  return tempKLineYRandomList;
};
