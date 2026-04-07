/**
 * 新币发行管理页面
 *
 * 功能：管理新币发行配置
 *
 * @author System
 * @date 2026-04-02
 */

import React, { useState, useEffect } from 'react';
import { message, Form, Input, InputNumber, Select, Switch, DatePicker, Tag, Popconfirm, Modal } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmEditor from '@components/CmEditor';
import {
  getNewCoinList,
  getNewCoinDetail,
  saveNewCoin,
  updateNewCoin,
  deleteNewCoin,
  publishNewCoin,
  releaseNewCoin
} from '@api/modules/newcoin';
import { getSysDictDataByType } from '@api/modules/system';
import dayjs from 'dayjs';

const { Option } = Select;

/** 新币发行管理页面 */
const IssueCoinsPage = () => {
  const [form] = Form.useForm();

  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [coinList, setCoinList] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [currentMarket, setCurrentMarket] = useState({});
  const [publishType, setPublishType] = useState('1');

  // 获取字典数据
  useEffect(() => {
    const fetchDictData = async () => {
      try {
        const response = await getSysDictDataByType('own_coin_publish_type');
        if (response.code === 200) {
          setTypeOptions(response.data || []);
        }
      } catch (error) {
        console.error('获取字典数据失败:', error);
      }
    };
    fetchDictData();
  }, []);

  // 获取币种列表
  const fetchCoinList = async () => {
    try {
      // 这里调用获取币种列表的API
      // 根据旧项目应该调用 getSelectList
      // 暂时使用空数组，实际需要根据API调整
      setCoinList([]);
    } catch (error) {
      console.error('获取币种列表失败:', error);
    }
  };

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 新增按钮
  const handleAdd = () => {
    setEditingRecord(null);
    setIsEditMode(true);
    setPublishType('1');
    form.resetFields();
    form.setFieldsValue({ publishType: '1', placingFlag: false });
    fetchCoinList();
    setCurrentMarket({});
    setFormVisible(true);
  };

  // 编辑按钮
  const handleEdit = async (record) => {
    try {
      const response = await getNewCoinDetail(record.id);
      if (response.code === 0 || response.code === 200) {
        const data = response.data;
        setEditingRecord(data);
        setIsEditMode(false);
        setPublishType(data.publishType || '1');

        const formValues = {
          ...data,
          beginTime: data.beginTime ? dayjs(data.beginTime) : null,
          endTime: data.endTime ? dayjs(data.endTime) : null,
          placingFlag: data.placingFlag === 1,
        };
        form.setFieldsValue(formValues);
        setFormVisible(true);
      } else {
        message.error(response.msg || '获取详情失败');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  // 删除按钮
  const handleDelete = async (record) => {
    try {
      const response = await deleteNewCoin(record.id);
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        refreshTable();
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  // 发布按钮
  const handlePublish = async (record) => {
    try {
      let response;
      if (record.status === '1') {
        // 待发布币种
        response = await publishNewCoin(record.id);
      } else if (record.status === '2') {
        // 进行中币种
        response = await releaseNewCoin(record.id);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(response.msg || '发布成功');
        refreshTable();
      } else {
        message.error(response.msg || '发布失败');
      }
    } catch (error) {
      message.error('发布失败: ' + error.message);
    }
  };

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        beginTime: values.beginTime ? dayjs(values.beginTime).format('YYYY-MM-DD') : null,
        endTime: values.endTime ? dayjs(values.endTime).format('YYYY-MM-DD') : null,
        placingFlag: values.placingFlag ? 1 : 0,
      };

      let response;
      if (editingRecord && editingRecord.id) {
        response = await updateNewCoin({ ...submitData, id: editingRecord.id });
      } else {
        const marketData = currentMarket;
        submitData.referMarket = marketData?.market;
        response = await saveNewCoin(submitData);
      }

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '修改成功' : '新增成功');
        setFormVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 状态映射
  const statusMap = {
    '0': { color: 'default', text: '待发布' },
    '1': { color: 'warning', text: '待发布' },
    '2': { color: 'processing', text: '进行中' },
    '3': { color: 'success', text: '已结束' },
  };

  // 表格列配置
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '图标',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      align: 'center',
      render: (logo) => logo ? (
        <img src={logo} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
      ) : '-',
    },
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'coin',
      width: 100,
      align: 'center',
    },
    {
      title: '参考币',
      dataIndex: 'referCoin',
      key: 'referCoin',
      width: 100,
      align: 'center',
    },
    {
      title: '参考币交易所',
      dataIndex: 'referMarket',
      key: 'referMarket',
      width: 140,
      align: 'center',
    },
    {
      title: '展示名称',
      dataIndex: 'showSymbol',
      key: 'showSymbol',
      width: 120,
      align: 'center',
    },
    {
      title: '初始价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'center',
    },
    {
      title: '私募发行量',
      dataIndex: 'raisingAmount',
      key: 'raisingAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '总发行量',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '预购上限',
      dataIndex: 'purchaseLimit',
      key: 'purchaseLimit',
      width: 120,
      align: 'center',
    },
    {
      title: '已筹集额度',
      dataIndex: 'raisedAmount',
      key: 'raisedAmount',
      width: 120,
      align: 'center',
    },
    {
      title: '参与人数',
      dataIndex: 'participantsNum',
      key: 'participantsNum',
      width: 100,
      align: 'center',
    },
    {
      title: '开始时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 110,
      align: 'center',
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 110,
      align: 'center',
      render: (time) => (time ? dayjs(time).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) => {
        const info = statusMap[status];
        return info ? <Tag color={info.color}>{info.text}</Tag> : '-';
      },
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '币种',
      dataIndex: 'coin',
      key: 'SEARCH_LIKE_coin',
      type: 'text',
    },
    {
      title: '参考币',
      dataIndex: 'referCoin',
      key: 'SEARCH_LIKE_referCoin',
      type: 'text',
    },
    {
      title: '开始时间',
      dataIndex: 'beginTime',
      key: 'SEARCH_GTE_beginTime',
      type: 'date',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'SEARCH_LTE_endTime',
      type: 'date',
    },
  ];

  return (
    <div>
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/ownCoin/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="id"
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        renderAction={(record) => (
          <>
            {record.status !== '3' && (
              <Popconfirm
                title="确认发布"
                description={`是否发布${record.coin}币种?`}
                onConfirm={() => handlePublish(record)}
                okText="确认"
                cancelText="取消"
              >
                <button style={{ border: 'none', background: 'none', color: '#52c41a', cursor: 'pointer' }}>
                  发布
                </button>
              </Popconfirm>
            )}
          </>
        )}
      />

      <DataForm
        visible={formVisible}
        title={editingRecord ? '修改发币' : '添加发币'}
        form={form}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => {
          setEditingRecord(null);
          form.resetFields();
        }}
        loading={loading}
        formType="modal"
        width="800px"
      >
        <Form.Item
          name="coin"
          label="币种"
          rules={[{ required: true, message: '币种不能为空' }]}
        >
          <Input placeholder="请输入币种" disabled={!isEditMode} />
        </Form.Item>

        <Form.Item
          name="referCoin"
          label="参考币"
          rules={[{ required: true, message: '参考币不能为空' }]}
        >
          {isEditMode ? (
            <Select
              placeholder="请选择参考币"
              allowClear
              showSearch
              onChange={(value) => {
                const market = coinList.find(c => c.coin === value);
                setCurrentMarket(market || {});
                form.setFieldsValue({
                  referMarket: market?.market || '',
                  price: market?.price || 0,
                });
              }}
            >
              {coinList.map((item) => (
                <Option key={item.coin} value={item.coin}>
                  {item.label}
                </Option>
              ))}
            </Select>
          ) : (
            <Input disabled />
          )}
        </Form.Item>

        <Form.Item
          name="referMarket"
          label="参考币交易所"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="showSymbol"
          label="展示名称"
          rules={[{ required: true, message: '展示名称不能为空' }]}
        >
          <Input placeholder="请输入展示名称" />
        </Form.Item>

        <Form.Item
          name="logo"
          label="图标"
          rules={[{ required: true, message: '图标不能为空' }]}
        >
          <CmUpload />
        </Form.Item>

        <Form.Item
          name="price"
          label="初始价格"
          rules={[{ required: true, message: '初始价格不能为空' }]}
        >
          <Input disabled style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="totalAmount"
          label="总发行量"
          rules={[{ required: true, message: '总发行量不能为空' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入总发行量" />
        </Form.Item>

        <Form.Item
          name="purchaseLimit"
          label="预购上限"
          rules={[{ required: true, message: '预购上限不能为空' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入预购上限" />
        </Form.Item>

        <Form.Item
          name="raisingAmount"
          label="私募发行量"
          rules={[{ required: true, message: '私募发行量不能为空' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入私募发行量" />
        </Form.Item>

        <Form.Item
          name="raisedAmount"
          label="已筹集额度"
          rules={[
            { required: true, message: '已筹集额度不能为空' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const raisingAmount = getFieldValue('raisingAmount');
                if (value && raisingAmount && Number(value) >= Number(raisingAmount)) {
                  return Promise.reject(new Error('已筹集额度不大于私募发行量'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入已筹集额度" />
        </Form.Item>

        <Form.Item
          name="participantsNum"
          label="参与人数"
          rules={[{ required: true, message: '参与人数不能为空' }]}
        >
          <InputNumber style={{ width: '100%' }} placeholder="请输入参与人数" />
        </Form.Item>

        <Form.Item
          name="beginTime"
          label="开始时间"
          rules={[{ required: true, message: '开始时间不能为空' }]}
        >
          <DatePicker placeholder="请选择开始时间" format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="endTime"
          label="结束时间"
          rules={[
            { required: true, message: '结束时间不能为空' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const beginTime = getFieldValue('beginTime');
                if (value && beginTime && dayjs(value).isBefore(dayjs(beginTime))) {
                  return Promise.reject(new Error('结束时间需大于开始时间'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker placeholder="请选择结束时间" format="YYYY-MM-DD" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="publishType"
          label="发布类型"
          initialValue="1"
        >
          <Select onChange={(value) => setPublishType(value)}>
            {typeOptions.map((item) => (
              <Option key={item.dictValue} value={item.dictValue}>
                {item.dictLabel}
              </Option>
            ))}
          </Select>
          <p style={{ fontSize: 12, color: 'red', margin: 0, lineHeight: 2 }}>
            *客户购买配售类型的新币时，无需后台审核即可中签
          </p>
        </Form.Item>

        {publishType === '2' && (
          <Form.Item
            name="placingFlag"
            label="是否可以认购"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}

        <Form.Item
          name="introduce"
          label="介绍说明"
        >
          <CmEditor height={200} />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </DataForm>
    </div>
  );
};

export default IssueCoinsPage;
