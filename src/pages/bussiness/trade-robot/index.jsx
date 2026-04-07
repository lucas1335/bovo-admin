import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Card,
  message,
  Space,
  Tooltip,
  Radio,
} from 'antd';
import { InfoCircleOutlined, CheckOutlined, EditOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import {
  getSymbolList,
  saveTradeRobot,
  getTradeRobotDetail,
  updateTradeRobot,
} from '@api/modules/tradeRobot';
import {
  generateTimeList,
  getMockKLineOption,
  distributeMinutes,
  getKLineYRandomList,
} from './utils/chartHelper';
import { _toFixed, _div, _mul } from './utils/decimal';

const { Option } = Select;
const RadioButtons = Radio.Button;

/**
 * 控盘机器人页面
 * 功能：控盘参数设置、趋势图表绘制、K线预览
 */
const TradeRobotPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const lineChartRef = useRef(null);
  const kLineChartRef = useRef(null);
  const lineChartInstance = useRef(null);
  const kLineChartInstance = useRef(null);

  const [loading, setLoading] = useState(false);
  const [symbolList, setSymbolList] = useState([]);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [id, setId] = useState(null);
  const [type, setType] = useState(null); // 'priview' | 'update'

  // 状态数据
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [granularity, setGranularity] = useState(15);
  const [xTimeScaleList, setXTimeScaleList] = useState([]);
  const [yRandomList, setYRandomList] = useState([]);
  const [klineYRandomList, setKlineYRandomList] = useState([]);
  const [klineMockYData, setKlineMockYData] = useState([]);

  // 控盘策略列表
  const modelList = [
    { value: 0, label: '跟随型趋势' },
    { value: 2, label: '秒杀型趋势' },
  ];

  // 控制粒度列表
  const granularityList = form.getFieldValue('model') === 2
    ? [
        { value: 1, label: '1分钟' },
        { value: 5, label: '5分钟' },
        { value: 10, label: '10分钟' },
        { value: 15, label: '15分钟' },
      ]
    : [
        { value: 15, label: '15分钟' },
        { value: 30, label: '30分钟' },
        { value: 60, label: '1小时' },
        { value: 120, label: '2小时' },
        { value: 240, label: '4小时' },
      ];

  /**
   * 判断是否为预览模式
   */
  const isPreview = type === 'priview';

  /**
   * 判断是否为修改模式
   */
  const isUpdate = type === 'update';

  /**
   * 获取币种列表
   */
  const fetchSymbolList = async () => {
    try {
      const response = await getSymbolList();
      if (response.code === 200) {
        const list = response.rows || response.data || [];
        setSymbolList(list);
        form.setFieldValue('symbol', list?.[0]?.symbol || '');
      }
    } catch (error) {
      message.error('获取币种列表失败: ' + error.message);
    }
  };

  /**
   * 获取详情
   */
  const fetchDetail = async (detailId) => {
    try {
      const response = await getTradeRobotDetail(detailId);
      if (response.code === 200) {
        const data = response.data;
        setCurrentDetail(data);

        // 检查币种是否存在
        const symbolExists = symbolList.some((item) => item.symbol === data.symbol);
        form.setFieldsValue({
          symbol: symbolExists ? data.symbol : '',
          model: data.model,
          time: dayjs(data.beginTime),
          increase: data.increase,
          decline: data.decline,
          granularity: data.granularity,
          pricePencent: data.pricePencent,
          conPrice: data.conPrice,
        });

        // 处理K线数据
        const mockYData = (data.botInfoList || []).map((elem) => {
          klineYRandomList[elem.x] = elem.y;
          return [elem.open, elem.close, elem.high, elem.low];
        });
        setKlineMockYData(mockYData);

        if (data.model === 2) {
          setTotalMinutes(60);
          const timeList = generateTimeList(data.beginTime, data.granularity, 60);
          setXTimeScaleList(timeList);
        }

        setYRandomList(JSON.parse(data.lineChartData || '[]'));
        setGranularity(granularityList[0]?.value || 15);

        // 绘制图表
        setTimeout(() => {
          drawLine();
          drawKLine();
          kLinePreview({
            series: [{ data: mockYData }],
            xAxis: timeList,
          });
        }, 100);
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  /**
   * 重置表单
   */
  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({
      model: 2,
      time: dayjs(),
      increase: 5,
      decline: 5,
      granularity: 15,
      conPrice: 0,
      pricePencent: 5,
    });
    setId(null);
    setType(null);
    setCurrentDetail(null);
    setTotalMinutes(24 * 60);
    setGranularity(15);
    setXTimeScaleList([]);
    setYRandomList([]);
    setKlineYRandomList([]);
    setKlineMockYData([]);

    // 销毁图表
    if (lineChartInstance.current) {
      lineChartInstance.current.dispose();
      lineChartInstance.current = null;
    }
    if (kLineChartInstance.current) {
      kLineChartInstance.current.dispose();
      kLineChartInstance.current = null;
    }
  };

  /**
   * 策略变化
   */
  const handleModelChange = (value) => {
    if ([1, 2].includes(value)) {
      setGranularity(granularityList[0]?.value || 15);
      form.setFieldValue('granularity', granularityList[0]?.value || 15);
    }

    if (value === 2) {
      setTotalMinutes(60);
      const time = form.getFieldValue('time');
      const timeList = generateTimeList(time, granularity, 60);
      setXTimeScaleList(timeList);
      setTimeout(() => {
        drawLine();
        drawKLine();
        kLinePreview();
      }, 100);
    } else if (value === 1) {
      setTotalMinutes(24 * 60);
      const time = form.getFieldValue('time');
      const timeList = generateTimeList(time, granularity);
      setXTimeScaleList(timeList);
      setTimeout(() => {
        drawLine();
        drawKLine();
        kLinePreview();
      }, 100);
    } else if (value === 0) {
      resetForm();
      form.setFieldValue('model', value);
    }
  };

  /**
   * 绘制折线图
   */
  const drawLine = () => {
    if (!lineChartRef.current) return;

    if (lineChartInstance.current) {
      lineChartInstance.current.dispose();
    }

    lineChartInstance.current = echarts.init(lineChartRef.current);

    // 生成数据
    if (!type || currentDetail?.granularity !== form.getFieldValue('granularity')) {
      const xList = distributeMinutes(totalMinutes, form.getFieldValue('granularity'));
      const yList = xList.map((elem, index) => [xList[index] / granularity, 0]);
      setYRandomList(yList);

      const klineYList = getKLineYRandomList(xTimeScaleList, yList).slice(0, xTimeScaleList.length);
      setKlineYRandomList(klineYList);
    }

    const option = {
      backgroundColor: '#fff',
      grid: {
        left: 30,
        right: 50,
        top: 10,
        bottom: 30,
        containLabel: false,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            formatter: (params) => {
              if (params.axisDimension === 'x') {
                return dayjs(Number(params.value)).format('YYYY-MM-DD HH:mm');
              } else if (params.axisDimension === 'y') {
                return _toFixed(params.value, 4);
              }
            },
          },
          lineStyle: {
            color: '#3B91FF',
          },
        },
      },
      xAxis: {
        type: 'category',
        name: '时间',
        boundaryGap: false,
        axisLabel: {
          fontSize: 8,
          formatter: (params) => dayjs(Number(params)).format('HH:mm'),
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#CCC'],
            width: 1,
            type: 'dashed',
          },
        },
        data: xTimeScaleList,
      },
      yAxis: {
        min: 0 - form.getFieldValue('decline'),
        max: form.getFieldValue('increase'),
        name: '价格',
        type: 'value',
        axisLabel: { fontSize: 8 },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#CCC'],
            width: 1,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          data: yRandomList,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          showSymbol: true,
          symbolSize: 12,
          itemStyle: { color: '#3B91FF' },
          lineStyle: { color: '#3B91FF' },
        },
      ],
    };

    lineChartInstance.current.setOption(option);
  };

  /**
   * 绘制K线图
   */
  const drawKLine = () => {
    if (!kLineChartRef.current) return;

    if (!kLineChartInstance.current) {
      kLineChartInstance.current = echarts.init(kLineChartRef.current);
    }

    const option = {
      grid: {
        left: 30,
        right: 50,
        top: 10,
        bottom: 30,
      },
      xAxis: {
        type: 'category',
        name: '时间',
        boundaryGap: false,
        axisLabel: {
          fontSize: 8,
          formatter: (params) => dayjs(Number(params)).format('HH:mm'),
        },
        data: xTimeScaleList,
      },
      yAxis: {
        name: '价格',
        type: 'value',
        axisLine: { onZero: false },
        axisLabel: { fontSize: 8 },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#CCC'],
            width: 1,
            type: 'dashed',
          },
        },
      },
      series: [
        {
          type: 'candlestick',
          itemStyle: {
            color: '#4bbd83',
            color0: '#d62548',
            borderColor: '#4bbd83',
            borderColor0: '#d62548',
            borderColorDoji: null,
            borderWidth: '1',
          },
          data: [],
        },
      ],
    };

    kLineChartInstance.current.setOption(option);
  };

  /**
   * K线预览
   */
  const kLinePreview = (option) => {
    if (!option) {
      option = getMockKLineOption(
        xTimeScaleList,
        klineYRandomList,
        form.getFieldValue('pricePencent')
      );
    }

    setKlineMockYData(option.series[0]?.data || []);
    kLineChartInstance.current?.setOption(option);
  };

  /**
   * 提交
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      let tempBotInfoList = [];
      const time = values.time.valueOf();
      const nowDate = dayjs().startOf('minute').valueOf();

      if ([1, 2].includes(values.model)) {
        tempBotInfoList = Object.keys(klineYRandomList).map((elem, index) => ({
          x: elem,
          y: String(klineYRandomList[index]),
          dateTime: time + elem * values.granularity * 60 * 1000,
          open: klineMockYData[index]?.[0] || 0,
          close: klineMockYData[index]?.[1] || 0,
          high: klineMockYData[index]?.[2] || 0,
          low: klineMockYData[index]?.[3] || 0,
        }));
      }

      const params = {
        decline: values.model === 0 ? values.pricePencent : values.decline,
        increase: values.model === 0 ? values.pricePencent : values.increase,
        granularity: [1, 2].includes(values.model) ? values.granularity : '',
        model: values.model,
        conPrice: values.conPrice,
        pricePencent: values.pricePencent,
        symbol: values.symbol,
        beginTime: time,
        endTime: '',
        botInfoList: [
          {
            close: 0,
            dateTime: time,
            high: 0,
            low: 0,
            open: 0,
            x: '0',
            y: '0',
          },
        ],
        lineChartData: '[]',
      };

      if ([1, 2].includes(values.model)) {
        params.granularity = values.granularity;
        params.beginTime = tempBotInfoList[0]?.dateTime || time;
        params.endTime = tempBotInfoList[tempBotInfoList.length - 1]?.dateTime || time;
        params.botInfoList = tempBotInfoList;
        params.lineChartData = JSON.stringify(yRandomList);
      }

      if (!values.symbol) {
        message.error('交易对不能为空');
        return;
      }

      setLoading(true);
      let response;
      if (id) {
        params.id = id;
        response = await updateTradeRobot(params);
      } else {
        response = await saveTradeRobot(params);
      }

      if (response.code === 200) {
        message.success(response.msg || '保存成功');
        if (values.model === 0) {
          form.setFieldValue('conPrice', '');
        } else {
          resetForm();
        }
      } else {
        message.error(response.msg || '保存失败');
      }
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 绘制和预览按钮点击
   */
  const handleDrawAndPreview = () => {
    drawLine();
    kLinePreview();
  };

  /**
   * 浮动比例变化
   */
  const handlePricePencentChange = () => {
    kLinePreview();
  };

  // 初始化
  useEffect(() => {
    fetchSymbolList();

    const stateId = location.state?.id;
    const stateType = location.state?.type;

    if (stateId) {
      setId(stateId);
      setType(stateType);
      fetchDetail(stateId);
    } else {
      resetForm();
    }

    // 窗口大小变化监听
    const handleResize = () => {
      lineChartInstance.current?.resize();
      kLineChartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      lineChartInstance.current?.dispose();
      kLineChartInstance.current?.dispose();
    };
  }, []);

  const currentModel = form.getFieldValue('model');

  return (
    <div style={{ padding: '8px 12px' }}>
      <Card title="参数设置" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          disabled={isPreview}
          initialValues={{
            model: 2,
            time: dayjs(),
            increase: 5,
            decline: 5,
            granularity: 15,
            conPrice: 0,
            pricePencent: 5,
          }}
        >
          <Form.Item
            label="交易对"
            name="symbol"
            rules={[{ required: true, message: '请选择交易对' }]}
          >
            <Select
              placeholder="请选择交易对"
              showSearch
              allowClear
              style={{ width: 200 }}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {symbolList.map((item, index) => (
                <Option key={index} value={item.symbol || item.coin}>
                  {item.showSymbol || item.symbol || item.coin}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="控盘策略"
            name="model"
          >
            <Radio.Group onChange={(e) => handleModelChange(e.target.value)}>
              {modelList.map((item) => (
                <RadioButtons key={item.label} value={item.value}>
                  {item.label}
                </RadioButtons>
              ))}
            </Radio.Group>
          </Form.Item>

          {currentModel !== 0 && (
            <>
              <Form.Item
                label="控盘时间"
                name="time"
                rules={[{ required: true, message: '请选择控盘时间' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="选择控盘时间"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item
                label="最大涨幅"
                name="increase"
                rules={[{ required: true, message: '请输入最大涨幅' }]}
              >
                <InputNumber
                  min={0.001}
                  placeholder="请输入最大涨幅"
                  addonAfter="%"
                  style={{ width: 200 }}
                />
              </Form.Item>

              <Form.Item
                label="最大跌幅"
                name="decline"
                rules={[{ required: true, message: '请输入最大跌幅' }]}
              >
                <InputNumber
                  min={0.001}
                  placeholder="请输入最大跌幅"
                  addonAfter="%"
                  style={{ width: 200 }}
                />
              </Form.Item>

              <Form.Item
                label="浮动比例"
                name="pricePencent"
                rules={[{ required: true, message: '请输入价格浮动比例' }]}
              >
                <InputNumber
                  min={0.001}
                  max={100}
                  placeholder="请输入价格浮动比例"
                  addonAfter="%"
                  onChange={handlePricePencentChange}
                  style={{ width: 200 }}
                />
              </Form.Item>

              {(isPreview || isUpdate) && (
                <Form.Item label="参考价格" name="conPrice">
                  <InputNumber
                    disabled={form.getFieldValue('conPrice') > 0}
                    min={0.001}
                    placeholder="请输入价格"
                    style={{ width: 200 }}
                  />
                </Form.Item>
              )}

              <Form.Item>
                <Space>
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={handleDrawAndPreview}
                  >
                    绘制
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={handleSubmit}
                    disabled={isPreview}
                    loading={loading}
                  >
                    保存
                  </Button>
                </Space>
              </Form.Item>
            </>
          )}
        </Form>
      </Card>

      {currentModel === 0 ? (
        <Card title={modelList.find((item) => item.value === 0)?.label}>
          <Form disabled={isPreview}>
            <Form.Item label="浮动价格">
              <Tooltip title="当前币种价格 + 浮动价格">
                <InfoCircleOutlined style={{ marginRight: 8 }} />
              </Tooltip>
              <InputNumber
                min={0}
                placeholder="请输入浮动价格"
                addonAfter="USDT"
                style={{ width: 200 }}
              />
            </Form.Item>
          </Form>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleSubmit}
            disabled={isPreview}
            loading={loading}
          >
            保存
          </Button>
        </Card>
      ) : (
        <>
          <Card
            title={modelList.find((item) => item.value === currentModel)?.label}
            style={{ marginBottom: 16 }}
          >
            <div
              ref={lineChartRef}
              style={{ height: '400px' }}
            />
          </Card>

          <Card title="趋势预览">
            <div
              ref={kLineChartRef}
              style={{ height: '400px' }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default TradeRobotPage;
