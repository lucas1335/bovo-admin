import React, { useState } from 'react';
import { Tabs } from 'antd';

// 导入所有配置子组件
import S1Sidebar from './components/S1Sidebar';
import S2LoginRegister from './components/S2LoginRegister';
import S3Code from './components/S3Code';
import S4Timezone from './components/S4Timezone';
import S5IpControl from './components/S5IpControl';
import S6WhitePaper from './components/S6WhitePaper';
import S7TabBar from './components/S7TabBar';
import S8JinGang from './components/S8JinGang';
import S9Mp from './components/S9Mp';
import S10Trade from './components/S10Trade';
import S11Logo from './components/S11Logo';
import S12Coin from './components/S12Coin';
import S13Download from './components/S13Download';
import S14Vip from './components/S14Vip';
import S15VipShow from './components/S15VipShow';
import S16Mosaic from './components/S16Mosaic';
import S17TabSetting from './components/S17TabSetting';
import S18AuthAddress from './components/S18AuthAddress';
import S19Other from './components/S19Other';
import S20Withdrawal from './components/S20Withdrawal';

/**
 * 基础配置页面
 * 包含所有20个配置子组件
 */
const BasicConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState('first');

  const tabItems = [
    {
      key: 'first',
      label: '侧边栏配置',
      children: <S1Sidebar />
    },
    {
      key: 'second',
      label: '登录注册配置',
      children: <S2LoginRegister />
    },
    {
      key: 'third',
      label: '验证码设置',
      children: <S3Code />
    },
    {
      key: 'fourth',
      label: '时区设置',
      children: <S4Timezone />
    },
    {
      key: 'fifth',
      label: '后台IP控制',
      children: <S5IpControl />
    },
    {
      key: 'sixth',
      label: '白皮书配置',
      children: <S6WhitePaper />
    },
    {
      key: 'seventh',
      label: '底部栏设置',
      children: <S7TabBar />
    },
    {
      key: 'eighth',
      label: '金刚区设置',
      children: <S8JinGang />
    },
    {
      key: 'ninth',
      label: '提示音配置',
      children: <S9Mp />
    },
    {
      key: 'tenth',
      label: '玩法配置',
      children: <S10Trade />
    },
    {
      key: 'eleventh',
      label: '平台logo设置',
      children: <S11Logo />
    },
    {
      key: 'twelfth',
      label: '首页币种设置',
      children: <S12Coin />
    },
    {
      key: 'thirteenth',
      label: '下载地址配置',
      children: <S13Download />
    },
    {
      key: 'fourteenth',
      label: 'VIP等级设置',
      children: <S14Vip />
    },
    {
      key: 'fifteenth',
      label: 'VIP说明',
      children: <S15VipShow />
    },
    {
      key: 'sixteenth',
      label: '打码配置',
      children: <S16Mosaic />
    },
    {
      key: 'seventeenth',
      label: '标签设置',
      children: <S17TabSetting />
    },
    {
      key: 'eighteenth',
      label: '授权地址设置',
      children: <S18AuthAddress />
    },
    {
      key: 'nineteenth',
      label: '其他设置',
      children: <S19Other />
    },
    {
      key: 'twentieth',
      label: '提现配置',
      children: <S20Withdrawal />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </div>
  );
};

export default BasicConfigurationPage;
