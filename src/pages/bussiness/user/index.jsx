import React, { useState } from 'react';
import { message, Tag, Form, Input, Select, Switch, Modal, Tabs, Table } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  setUserBlack,
} from '@api';

const { Option } = Select;
const { TextArea } = Input;

/**
 * 用户管理页面
 */
const UserPage = () => {
  // ==================== 状态管理 ====================
  const [formVisible, setFormVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [userDetail, setUserDetail] = useState({});
  const [assetList, setAssetList] = useState([]);
  const [activeTab, setActiveTab] = useState('0');

  // ==================== 事件处理函数 ====================

  /**
   * 新增用户
   */
  const handleAdd = () => {
    setAddFormVisible(true);
  };

  /**
   * 编辑用户
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormVisible(true);
  };

  /**
   * 删除用户
   */
  const handleDelete = async (record) => {
    try {
      const response = await delUser({ userId: record.userId });
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

  /**
   * 提交表单（新增或编辑用户）
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        status: values.status ? 1 : 0,
        whiteFlag: values.whiteFlag ? '1' : '2',
      };

      const response = editingRecord
        ? await updateAgencyUser(submitData)
        : await addAgencyUser(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord ? '更新成功' : '新增成功');
        setFormVisible(false);
        setAddFormVisible(false);
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

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 设置黑名单
   */
  const handleSetBlack = async (record) => {
    try {
      const params = {
        userId: record.userId,
        isBlack: record.isBlack === 2 ? 1 : 2
      };
      const response = await setUserBlack(params);
      if (response.code === 200) {
        message.success('设置成功');
        refreshTable();
      } else {
        message.error(response.msg || '设置失败');
      }
    } catch (error) {
      message.error('设置失败: ' + error.message);
    }
  };

  /**
   * 查看详情
   */
  const handleViewDetail = async (record) => {
    try {
      const response = await getUser({ userId: record.userId });
      if (response.code === 200) {
        setUserDetail(response.data.user || record);
        setDetailVisible(true);
        setActiveTab('0');
      }
    } catch (error) {
      message.error('获取详情失败: ' + error.message);
    }
  };

  // ==================== 数据映射配置 ====================

  // 用户类型映射
  const userTypeMap = {
    0: { color: 'blue', text: '正常用户' },
    1: { color: 'green', text: '测试用户' },
  };

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
      render: (isTest) => {
        const status = userTypeMap[isTest] || { color: 'default', text: '未知' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '登录名',
      dataIndex: 'loginName',
      key: 'loginName',
      width: 150,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 180,
      render: (text) => text || '-',
    },
    // {
    //   title: '直属下级',
    //   dataIndex: 'appParentIds',
    //   key: 'appParentIds',
    //   width: 250,
    //   ellipsis: true,
    // },
    {
      title: '账号金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
    },
    {
      title: '充值金额',
      dataIndex: 'rechargeAmount',
      key: 'rechargeAmount',
      width: 130,
      render: (text) => text || 0,
    },
    {
      title: '提现金额',
      dataIndex: 'withdrawAmount',
      key: 'withdrawAmount',
      width: 130,
      render: (text) => text || 0,
    },
    {
      title: '盈亏',
      dataIndex: 'totalEarn',
      key: 'totalEarn',
      width: 130,
    },
    {
      title: '等级',
      dataIndex: 'invitLevel',
      key: 'invitLevel',
      width: 100,
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 160,
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
      title: '登录名',
      dataIndex: 'loginName',
      key: 'SEARCH_LIKE_loginName',
      type: 'text',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'SEARCH_LIKE_phone',
      type: 'text',
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
    {
      title: '地址',
      dataIndex: 'address',
      key: 'SEARCH_LIKE_address',
      type: 'text',
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div>
      {/* 主列表页面 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/asset/appUser/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="userId"
        actionButtons={{
          edit: true,
          delete: true,
        }}
      />

      {/* 编辑用户表单弹窗 */}
      <DataForm
        visible={formVisible}
        title="编辑用户"
        initialValues={{
          status: false,
          whiteFlag: false,
          ...editingRecord,
        }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingRecord(null)}
        loading={loading}
        formType="drawer"
        width="70%"
      >
        <Form.Item
          name="userId"
          label="用户ID"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="loginName"
          label="登录名"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="address"
          label="地址"
        >
          <Input placeholder="请输入地址" />
        </Form.Item>

        <Form.Item
          name="walletType"
          label="地址类型"
          rules={[{ required: true, message: '请选择地址类型' }]}
        >
          <Select placeholder="请选择地址类型">
            <Option value="TRC20">TRC20</Option>
            <Option value="ERC20">ERC20</Option>
            <Option value="OMNI">OMNI</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="isTest"
          label="用户类型"
          rules={[{ required: true, message: '请选择用户类型' }]}
        >
          <Select placeholder="请选择用户类型">
            <Option value={0}>正常用户</Option>
            <Option value={1}>测试用户</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="是否冻结"
          valuePropName="checked"
        >
          <Switch checkedChildren="冻结" unCheckedChildren="正常" />
        </Form.Item>

        <Form.Item
          name="whiteFlag"
          label="白名单"
          valuePropName="checked"
        >
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注" />
        </Form.Item>
      </DataForm>

      {/* 新增用户表单弹窗 */}
      <DataForm
        visible={addFormVisible}
        title="新增用户"
        initialValues={{
          userType: 1,
          status: false,
          isTest: 0,
          miningFlag: '0',
          buff: 0,
        }}
        onCancel={() => setAddFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setAddFormVisible(false)}
        loading={loading}
        formType="drawer"
        width="70%"
      >
        <Form.Item
          name="userType"
          label="账号类型"
          rules={[{ required: true, message: '请选择账号类型' }]}
        >
          <Select placeholder="请选择账号类型">
            <Option value={1}>普通</Option>
            <Option value={2}>邮箱</Option>
            <Option value={3}>手机</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="loginName"
          label="登录名"
          rules={[{ required: true, message: '请输入登录名' }]}
        >
          <Input placeholder="请输入登录名" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
        >
          <Input placeholder="请输入邮箱" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>

        <Form.Item
          name="loginPassword"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item
          name="walletType"
          label="地址类型"
          rules={[{ required: true, message: '请选择地址类型' }]}
        >
          <Select placeholder="请选择地址类型">
            <Option value="TRC20">TRC20</Option>
            <Option value="ERC20">ERC20</Option>
            <Option value="OMNI">OMNI</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="isTest"
          label="用户类型"
          rules={[{ required: true, message: '请选择用户类型' }]}
        >
          <Select placeholder="请选择用户类型">
            <Option value={0}>正常用户</Option>
            <Option value={1}>测试用户</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="是否冻结"
          valuePropName="checked"
        >
          <Switch checkedChildren="冻结" unCheckedChildren="正常" />
        </Form.Item>
      </DataForm>

      {/* 用户详情弹窗 */}
      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={900}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '0',
              label: '用户详情',
              children: (
                <div style={{ padding: '20px' }}>
                  <p><strong>用户名ID:</strong> {userDetail.userId}</p>
                  <p><strong>手机号:</strong> {userDetail.phone}</p>
                  <p><strong>登录名:</strong> {userDetail.loginName}</p>
                  <p><strong>邮箱:</strong> {userDetail.email}</p>
                  <p><strong>注册IP:</strong> {userDetail.registerIp}</p>
                  <p><strong>地址类型:</strong> {userDetail.walletType}</p>
                  <p><strong>注册域名:</strong> {userDetail.host}</p>
                  <p><strong>上级ID:</strong> {userDetail.appParentIds}</p>
                  <p><strong>用户类型:</strong> {userDetail.isTest == 0 ? '正常用户' : '测试用户'}</p>
                  <p><strong>冻结状态:</strong> {userDetail.status ? '冻结' : '正常'}</p>
                  <p><strong>后台代理:</strong> {userDetail.adminParentIds}</p>
                  <p><strong>地址:</strong> {userDetail.address}</p>
                </div>
              ),
            },
            {
              key: '1',
              label: '资产详情',
              children: (
                <Table
                  dataSource={assetList}
                  loading={loading}
                  rowKey="symbol"
                  pagination={false}
                  columns={[
                    {
                      title: '资产',
                      dataIndex: 'symbol',
                      key: 'symbol',
                    },
                    {
                      title: '资产总额',
                      dataIndex: 'amout',
                      key: 'amout',
                    },
                    {
                      title: '占用金额',
                      dataIndex: 'occupiedAmount',
                      key: 'occupiedAmount',
                    },
                    {
                      title: '可用金额',
                      dataIndex: 'availableAmount',
                      key: 'availableAmount',
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default UserPage;
