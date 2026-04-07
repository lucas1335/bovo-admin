import React, { useState, useEffect } from 'react';
import { Tag, Form, Input, Select, DatePicker, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import CmBasePage from '@components/CmBasePage';
import { getType, getTotalMoney } from '@api/modules/record';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 账变信息页面
 */
const RecordPage = () => {
  // ==================== 状态管理 ====================
  const [typeList, setTypeList] = useState([]);
  const [totalMoney, setTotalMoney] = useState('0');
  const [pageTotalMoney, setPageTotalMoney] = useState('0');

  useEffect(() => {
    // 获取账变类型
    getType().then((res) => {
      if (res.code === 200 && res.data) {
        const arr = [];
        const obj = res.data;
        for (const index in obj) {
          arr.push({
            label: index,
            value: obj[index].key,
            text: obj[index].value,
          });
        }
        setTypeList(arr);
      }
    });

    // 获取总金额
    getTotalMoney().then((res) => {
      if (res.code === 200) {
        setTotalMoney(res.data.statisticsAmount || '0');
      }
    });
  }, []);

  // ==================== 列配置 ====================

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'isTest',
      width: 100,
      render: (isTest) => (
        <Tag color={isTest == 0 ? 'blue' : 'green'}>
          {isTest == 0 ? '正常用户' : '测试用户'}
        </Tag>
      ),
    },
    {
      title: '折合U',
      dataIndex: 'uamount',
      key: 'uamount',
      width: 120,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (text) => (text != null ? parseFloat(text).toFixed(6) : '-'),
    },
    {
      title: '前值',
      dataIndex: 'beforeAmount',
      key: 'beforeAmount',
      width: 120,
    },
    {
      title: '后值',
      dataIndex: 'afterAmount',
      key: 'afterAmount',
      width: 120,
    },
    {
      title: '账变类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => {
        const item = typeList.find(t => t.value == type);
        return item ? item.text : '-';
      },
    },
    {
      title: '币种',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
    },
  ];

  // ==================== 搜索配置 ====================

  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_LIKE_userId',
      type: 'text',
    },
    {
      title: '账变类型',
      dataIndex: 'type',
      key: 'SEARCH_EQ_type',
      type: 'select',
      options: typeList.map(item => ({ label: item.text, value: item.value })),
    },
    {
      title: '用户类型',
      dataIndex: 'isTest',
      key: 'SEARCH_EQ_isTest',
      type: 'select',
      options: [
        { label: '正常用户', value: '0' },
        { label: '测试用户', value: '1' },
      ],
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 24 }}>
        <div>当页金额: {pageTotalMoney}</div>
        <div>总计金额: {totalMoney}</div>
      </div>

      <CmBasePage
        columns={columns}
        apiEndpoint="/asset/appWalletRecord/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        rowKey="id"
        actionButtons={{
          edit: false,
          delete: false,
          view: false,
        }}
        showSummary={true}
        summaryField="amount"
        onPageSummaryChange={setPageTotalMoney}
      />
    </div>
  );
};

export default RecordPage;
