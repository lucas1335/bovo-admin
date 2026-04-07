import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Tabs, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

const { Option } = Select;

/**
 * 充值上架页面
 */
const ChargingPutupPage = () => {
  const [activeTab, setActiveTab] = useState('second');
  const [currencyList, setCurrencyList] = useState([]);
  const [channelList, setChannelList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleClick();
  }, []);

  /**
   * 切换标签
   */
  const handleClick = (key = activeTab) => {
    if (key === 'second') {
      getCurrency();
    } else if (key === 'fourth') {
      getWithdrawaChannel();
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    handleClick(key);
  };

  /**
   * 获取充值通道配置
   */
  const getCurrency = async () => {
    try {
      const res = await getSettingConfig('ASSET_COIN');
      if (res.code === 200) {
        let result = res.data || [];
        for (let i = 0; i < result.length; i++) {
          for (let key in result[i]) {
            if (!result[i][key]) {
              result[i][key] = '';
            }
          }
        }
        setCurrencyList(result);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 添加充值通道
   */
  const addCurrencyBtn = () => {
    const newData = {
      coinName: '',
      coin: '',
      rechargeMax: '',
      rechargeMin: '',
      coinAddress: '',
      rechargeNum: '',
    };
    setCurrencyList([...currencyList, newData]);
  };

  /**
   * 删除充值通道
   */
  const deleteCurrencyBtn = (index) => {
    const newList = [...currencyList];
    newList.splice(index, 1);
    setCurrencyList(newList);
  };

  /**
   * 更新充值通道
   */
  const updateCurrencyItem = (index, field, value) => {
    const newList = [...currencyList];
    newList[index][field] = value;
    setCurrencyList(newList);
  };

  /**
   * 保存充值通道
   */
  const saveCurrencyBtn = async () => {
    if (
      currencyList.some(
        (val) =>
          val.coinName === '' ||
          val.coin === '' ||
          val.rechargeMax === '' ||
          val.rechargeMin === '' ||
          val.coinAddress === '' ||
          val.rechargeNum === ''
      )
    ) {
      message.error('请填写完整内容');
      return;
    }

    setLoading(true);
    try {
      const res = await saveSettingConfigWithBio(
        'ASSET_COIN',
        JSON.stringify(currencyList)
      );
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取提现通道配置
   */
  const getWithdrawaChannel = async () => {
    try {
      const res = await getSettingConfig('WITHDRAWAL_CHANNEL_SETTING');
      if (res.code === 200) {
        let result = res.data || [];
        for (let i = 0; i < result.length; i++) {
          for (let key in result[i]) {
            if (!result[i][key]) {
              result[i][key] = '';
            }
          }
        }
        setChannelList(result);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 添加提现通道
   */
  const addChannelBtn = () => {
    const newData = {
      status: '',
      rechargeName: '',
      rechargeType: '',
      type: '',
      ratio: '',
      dayWithdrawalNum: '',
      freeNum: '',
      withdrawalMax: '',
      withdrawalMix: '',
    };
    setChannelList([...channelList, newData]);
  };

  /**
   * 删除提现通道
   */
  const deleteChannelBtn = (index) => {
    const newList = [...channelList];
    newList.splice(index, 1);
    setChannelList(newList);
  };

  /**
   * 更新提现通道
   */
  const updateChannelItem = (index, field, value) => {
    const newList = [...channelList];
    newList[index][field] = value;
    setChannelList(newList);
  };

  /**
   * 保存提现通道
   */
  const saveChannelBtn = async () => {
    if (
      channelList.some(
        (val) =>
          val.rechargeType === '' ||
          val.rechargeName === '' ||
          val.status === '' ||
          val.type === '' ||
          val.ratio === '' ||
          val.dayWithdrawalNum === '' ||
          val.freeNum === '' ||
          val.withdrawalMax === '' ||
          val.withdrawalMix === ''
      )
    ) {
      message.error('请填写完整内容');
      return;
    }

    setLoading(true);
    try {
      const res = await saveSettingConfigWithBio(
        'WITHDRAWAL_CHANNEL_SETTING',
        JSON.stringify(channelList)
      );
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== 渲染 ====================

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'second',
            label: '充值通道配置',
            children: (
              <div>
                {currencyList.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '16px',
                      padding: '16px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <Space>
                        <span>币种名称：</span>
                        <Input
                          maxLength={100}
                          value={item.coinName}
                          onChange={(e) => updateCurrencyItem(index, 'coinName', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入币种名称"
                        />
                        <span>币种类型：</span>
                        <Input
                          value={item.coin}
                          onChange={(e) => updateCurrencyItem(index, 'coin', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入币种类型"
                        />
                        <span>充值最大额：</span>
                        <Input
                          maxLength={20}
                          value={item.rechargeMax}
                          onChange={(e) => updateCurrencyItem(index, 'rechargeMax', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入充值最大额"
                        />
                        <span>充值最低额：</span>
                        <Input
                          maxLength={20}
                          value={item.rechargeMin}
                          onChange={(e) => updateCurrencyItem(index, 'rechargeMin', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入充值最低额"
                        />
                      </Space>
                    </div>
                    <div>
                      <Space>
                        <span>充值地址：</span>
                        <Input
                          value={item.coinAddress}
                          onChange={(e) => updateCurrencyItem(index, 'coinAddress', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入充值地址"
                        />
                        <span>充值次数：</span>
                        <Input
                          value={item.rechargeNum}
                          onChange={(e) => updateCurrencyItem(index, 'rechargeNum', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入充值次数"
                        />
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteCurrencyBtn(index)}
                        >
                          删除
                        </Button>
                        {currencyList.length > 0 && (
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={addCurrencyBtn}
                          >
                            添加
                          </Button>
                        )}
                      </Space>
                    </div>
                  </div>
                ))}
                {currencyList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>暂无充值通道配置</p>
                  </div>
                )}
                <div style={{ marginTop: '24px' }}>
                  <Button type="primary" onClick={saveCurrencyBtn} loading={loading}>
                    保存
                  </Button>
                  {currencyList.length === 0 && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={addCurrencyBtn}
                      style={{ marginLeft: '8px' }}
                    >
                      添加
                    </Button>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'fourth',
            label: '提现通道配置',
            children: (
              <div>
                {channelList.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '16px',
                      padding: '16px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <Space wrap>
                        <span>提现币种：</span>
                        <Input
                          maxLength={100}
                          value={item.rechargeType}
                          onChange={(e) => updateChannelItem(index, 'rechargeType', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入提现币种"
                        />
                        <span>展示名称：</span>
                        <Input
                          value={item.rechargeName}
                          onChange={(e) => updateChannelItem(index, 'rechargeName', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入展示名称"
                        />
                        <span>提现状态：</span>
                        <Select
                          value={item.status}
                          onChange={(value) => updateChannelItem(index, 'status', value)}
                          style={{ width: '150px' }}
                          placeholder="请选择提现状态"
                        >
                          <Option value="1">开启</Option>
                          <Option value="0">关闭</Option>
                        </Select>
                        <span>提现类型：</span>
                        <Select
                          value={item.type}
                          onChange={(value) => updateChannelItem(index, 'type', value)}
                          style={{ width: '150px' }}
                          placeholder="请选择提现类型"
                        >
                          <Option value="1">银行卡</Option>
                          <Option value="0">数字货币</Option>
                        </Select>
                        <span>手续费：</span>
                        <Input
                          maxLength={20}
                          value={item.ratio}
                          onChange={(e) => updateChannelItem(index, 'ratio', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入手续费"
                        />
                      </Space>
                    </div>
                    <div>
                      <Space wrap>
                        <span>每日提现次数限制：</span>
                        <Input
                          maxLength={5}
                          value={item.dayWithdrawalNum}
                          onChange={(e) => updateChannelItem(index, 'dayWithdrawalNum', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入每日提现次数限制"
                        />
                        <span>系统免费提现次数：</span>
                        <Input
                          maxLength={5}
                          value={item.freeNum}
                          onChange={(e) => updateChannelItem(index, 'freeNum', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入系统免费提现次数"
                        />
                        <span>最大限制：</span>
                        <Input
                          maxLength={20}
                          value={item.withdrawalMax}
                          onChange={(e) => updateChannelItem(index, 'withdrawalMax', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入最大限制"
                        />
                        <span>最小限制：</span>
                        <Input
                          maxLength={20}
                          value={item.withdrawalMix}
                          onChange={(e) => updateChannelItem(index, 'withdrawalMix', e.target.value)}
                          style={{ width: '150px' }}
                          placeholder="请输入最小限制"
                        />
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteChannelBtn(index)}
                        >
                          删除
                        </Button>
                        {channelList.length > 0 && (
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={addChannelBtn}
                          >
                            添加
                          </Button>
                        )}
                      </Space>
                    </div>
                  </div>
                ))}
                {channelList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>暂无提现通道配置</p>
                  </div>
                )}
                <div style={{ marginTop: '24px' }}>
                  <Button type="primary" onClick={saveChannelBtn} loading={loading}>
                    保存
                  </Button>
                  {channelList.length === 0 && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={addChannelBtn}
                      style={{ marginLeft: '8px' }}
                    >
                      添加
                    </Button>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ChargingPutupPage;
