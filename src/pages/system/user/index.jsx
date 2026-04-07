import React, { useState, useEffect, useRef } from 'react';
import { message, Tag, Form, Input, Select, Modal, Switch, Table, Button, Space } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import {
  getSysUserList,
  saveSysUser,
  updateSysUser,
  deleteSysUser,
  getSysRoleList,
  resetUserPassword,
  changeUserStatus,
  getAuthRole,
  updateAuthRole,
  getAdminUserList,
  getAppUserList,
  bindActing as bindActingApi,
  bindGameUser as bindGameUserApi,
  updateGoogleCode,
  getGoogleCode
} from '@api';

const { Option } = Select;
const { TextArea } = Input;

const SystemUserPage = () => {
  // 1. 状态管理（按固定顺序）
  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [allAssets, setAllAssets] = useState(0);

  // 绑定代理相关状态
  const [bindAgentVisible, setBindAgentVisible] = useState(false);
  const [bindAgentUserList, setBindAgentUserList] = useState([]);
  const [bindAgentSelectedIds, setBindAgentSelectedIds] = useState([]);
  const [bindAgentCurrentUserId, setBindAgentCurrentUserId] = useState(null);
  const [bindAgentTotal, setBindAgentTotal] = useState(0);
  const [bindAgentPageNum, setBindAgentPageNum] = useState(1);
  const [bindAgentPageSize, setBindAgentPageSize] = useState(10);

  // 绑定玩家相关状态
  const [bindPlayerVisible, setBindPlayerVisible] = useState(false);
  const [bindPlayerUserList, setBindPlayerUserList] = useState([]);
  const [bindPlayerSelectedIds, setBindPlayerSelectedIds] = useState([]);
  const [bindPlayerCurrentUserId, setBindPlayerCurrentUserId] = useState(null);
  const [bindPlayerTotal, setBindPlayerTotal] = useState(0);
  const [bindPlayerPageNum, setBindPlayerPageNum] = useState(1);
  const [bindPlayerPageSize, setBindPlayerPageSize] = useState(10);
  const [playerSearchUserId, setPlayerSearchUserId] = useState('');
  const [playerSearchLoginName, setPlayerSearchLoginName] = useState('');

  // Google Key 二维码相关
  const [googleCodeVisible, setGoogleCodeVisible] = useState(false);
  const [googleCodeUrl, setGoogleCodeUrl] = useState('');

  // 重置密码对话框
  const [resetPwdVisible, setResetPwdVisible] = useState(false);
  const [resetPwdUserId, setResetPwdUserId] = useState(null);
  const [resetPwdUserName, setResetPwdUserName] = useState('');
  const [passwordForm] = Form.useForm();

  // 使用 ref 存储最新值
  const bindAgentCurrentUserIdRef = useRef(null);
  const bindPlayerCurrentUserIdRef = useRef(null);

  // 同步更新 ref
  useEffect(() => {
    bindAgentCurrentUserIdRef.current = bindAgentCurrentUserId;
  }, [bindAgentCurrentUserId]);

  useEffect(() => {
    bindPlayerCurrentUserIdRef.current = bindPlayerCurrentUserId;
  }, [bindPlayerCurrentUserId]);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await getSysRoleList({ pageNum: 1, pageSize: 1000 });
      console.log('角色列表响应:', response);

      if (response.code === 0 || response.code === 200) {
        // 处理不同的数据结构
        let roleList = [];
        if (response.rows) {
          roleList = response.rows;
        } else if (response.data?.records) {
          roleList = response.data.records;
        } else if (response.data?.list) {
          roleList = response.data.list;
        } else if (response.data) {
          roleList = response.data;
        } else if (Array.isArray(response)) {
          roleList = response;
        }

        console.log('解析后的角色列表:', roleList);

        const options = roleList
          .filter(role => {
            // 兼容不同的状态值格式
            const status = role.status;
            return status === '0' || status === 0 || status === false;
          })
          .map(role => ({
            label: role.roleName,
            value: role.roleId
          }));

        console.log('角色选项:', options);
        setRoleOptions(options);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    }
  };

  // 获取部门树
  const fetchDeptTree = async () => {
    try {
      // 这里应该调用实际的API，暂时使用空数组
      setDeptOptions([]);
    } catch (error) {
      console.error('获取部门树失败:', error);
    }
  };

  // 当表单打开时获取角色列表和部门树
  useEffect(() => {
    if (formVisible) {
      fetchRoles();
      fetchDeptTree();
    }
  }, [formVisible]);

  // 2. 事件处理
  const handleAdd = () => {
    setEditingUser(null);
    setFormVisible(true);
  };

  const handleEdit = async (record) => {
    try {
      // 获取用户角色授权信息（包含所有角色列表和用户已有角色）
      const userId = record.userId || record.id;
      const roleResponse = await getAuthRole(userId);

      let roleIds = [];
      if (roleResponse.code === 0 || roleResponse.code === 200) {
        // 标准若依格式：{user: {...}, roles: [...]}
        const roles = roleResponse.data?.roles || roleResponse.roles || [];

        // 从角色列表中提取已分配的角色ID（通过flag字段判断）
        roleIds = roles
          .filter(role => role.flag === true || role.flag === '1')
          .map(role => role.roleId);

        // 如果没有flag字段，尝试使用roleIds字段
        if (roleIds.length === 0) {
          roleIds = roleResponse.data?.roleIds || roleResponse.roleIds || [];
        }
      }

      setEditingUser({ ...record, roleIds });
      setFormVisible(true);
    } catch (error) {
      console.error('获取用户角色失败:', error);
      setEditingUser({ ...record, roleIds: [] });
      setFormVisible(true);
    }
  };

  const handleDelete = async (record) => {
    try {
      const response = await deleteSysUser({ id: record.id || record.userId });
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

  // 状态切换
  const handleStatusChange = async (checked, record) => {
    const newStatus = checked ? '0' : '1';
    const statusText = checked ? '启用' : '停用';

    try {
      const response = await changeUserStatus({
        userId: record.userId || record.id,
        status: newStatus
      });

      if (response.code === 0 || response.code === 200) {
        message.success(`${statusText}成功`);
        refreshTable();
      } else {
        message.error(response.msg || `${statusText}失败`);
        // 恢复原状态
        refreshTable();
      }
    } catch (error) {
      message.error(`${statusText}失败: ` + error.message);
      refreshTable();
    }
  };

  // 重置密码
  const handleResetPwd = (record) => {
    setResetPwdUserId(record.userId || record.id);
    setResetPwdUserName(record.userName || record.username);
    passwordForm.resetFields();
    setResetPwdVisible(true);
  };

  // 确认重置密码
  const handleResetPwdOk = async () => {
    try {
      const values = await passwordForm.validateFields();
      const response = await resetUserPassword({
        userId: resetPwdUserId,
        password: values.password
      });
      if (response.code === 0 || response.code === 200) {
        message.success('密码重置成功，新密码是：' + values.password);
        setResetPwdVisible(false);
      } else {
        message.error(response.msg || '重置密码失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证失败
        return;
      }
      message.error('重置密码失败: ' + error.message);
    }
  };

  // 查看Google Key
  const handleViewGoogleCode = async (record) => {
    try {
      const response = await getGoogleCode({ userId: record.userId || record.id });
      if (response instanceof Blob) {
        const url = URL.createObjectURL(response);
        setGoogleCodeUrl(url);
        setGoogleCodeVisible(true);
      } else if (response.data) {
        setGoogleCodeUrl(response.data);
        setGoogleCodeVisible(true);
      } else {
        message.error('获取Google Key失败');
      }
    } catch (error) {
      message.error('获取Google Key失败: ' + error.message);
    }
  };

  // 更新Google Key
  const handleUpdateGoogleCode = async (record) => {
    try {
      const response = await updateGoogleCode({ userId: record.userId || record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('Google Key更新成功');
      } else {
        message.error(response.msg || '更新失败');
      }
    } catch (error) {
      message.error('更新失败: ' + error.message);
    }
  };

  // 绑定代理用户
  const handleBindAgent = (record) => {
    setBindAgentCurrentUserId(record.userId || record.id);
    setBindAgentVisible(true);
    setBindAgentPageNum(1);
    fetchBindAgentUsers(1, bindAgentPageSize);
  };

  // 获取可绑定的代理用户列表
  const fetchBindAgentUsers = async (pageNum, pageSize) => {
    try {
      const response = await getAdminUserList({
        pageNum,
        pageSize
      });
      if (response.code === 0 || response.code === 200) {
        setBindAgentUserList(response.rows || response.data?.records || []);
        setBindAgentTotal(response.total || 0);
      }
    } catch (error) {
      message.error('获取代理用户列表失败: ' + error.message);
    }
  };

  // 绑定代理用户确认
  const handleBindAgentOk = async () => {
    if (bindAgentSelectedIds.length === 0) {
      message.warning('请选择要绑定的代理用户');
      return;
    }

    try {
      const response = await bindActingApi({
        userId: bindAgentCurrentUserIdRef.current,
        adminUserIds: bindAgentSelectedIds.join(',')
      });
      if (response.code === 0 || response.code === 200) {
        message.success('绑定成功');
        setBindAgentVisible(false);
        setBindAgentSelectedIds([]);
        refreshTable();
      } else {
        message.error(response.msg || '绑定失败');
      }
    } catch (error) {
      message.error('绑定失败: ' + error.message);
    }
  };

  // 绑定玩家用户
  const handleBindPlayer = (record) => {
    setBindPlayerCurrentUserId(record.userId || record.id);
    setBindPlayerVisible(true);
    setBindPlayerPageNum(1);
    setPlayerSearchUserId('');
    setPlayerSearchLoginName('');
    fetchBindPlayerUsers(1, bindPlayerPageSize);
  };

  // 获取可绑定的玩家用户列表
  const fetchBindPlayerUsers = async (pageNum, pageSize) => {
    try {
      const response = await getAppUserList({
        pageNum,
        pageSize,
        userId: playerSearchUserId || undefined,
        loginName: playerSearchLoginName || undefined,
        adminParentIds: bindPlayerCurrentUserIdRef.current
      });
      if (response.code === 0 || response.code === 200) {
        setBindPlayerUserList(response.rows || response.data?.records || []);
        setBindPlayerTotal(response.total || 0);
      }
    } catch (error) {
      message.error('获取玩家用户列表失败: ' + error.message);
    }
  };

  // 绑定玩家用户确认
  const handleBindPlayerOk = async () => {
    if (bindPlayerSelectedIds.length === 0) {
      message.warning('请选择要绑定的玩家用户');
      return;
    }

    try {
      const response = await bindGameUserApi({
        userId: bindPlayerCurrentUserIdRef.current,
        appUserIds: bindPlayerSelectedIds.join(',')
      });
      if (response.code === 0 || response.code === 200) {
        message.success('绑定成功');
        setBindPlayerVisible(false);
        setBindPlayerSelectedIds([]);
        refreshTable();
      } else {
        message.error(response.msg || '绑定失败');
      }
    } catch (error) {
      message.error('绑定失败: ' + error.message);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
      };

      let response;
      let userId = editingUser?.userId || editingUser?.id;

      if (editingUser) {
        response = await updateSysUser(submitData);
      } else {
        response = await saveSysUser(submitData);
        // 新增用户后获取返回的用户ID
        if (response.data?.userId) {
          userId = response.data.userId;
        } else if (response.data?.id) {
          userId = response.data.id;
        }
      }

      if (response.code === 0 || response.code === 200) {
        // 保存/更新成功后，处理角色授权
        const roleIds = values.roleIds || [];
        if (userId && roleIds.length > 0) {
          try {
            await updateAuthRole({ userId, roleIds: roleIds.join(',') });
          } catch (roleError) {
            console.error('角色授权失败:', roleError);
            message.warning('用户保存成功，但角色授权失败');
          }
        } else if (userId) {
          // 即使没有选择角色，也要调用接口清除角色
          try {
            await updateAuthRole({ userId, roleIds: '' });
          } catch (roleError) {
            console.error('清除角色失败:', roleError);
          }
        }

        message.success(editingUser ? '更新成功' : '创建成功');
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

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  // 3. 列配置
  const columns = [
    {
      title: '用户编号',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      sorter: true,
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      sorter: true,
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      width: 120,
      sorter: true,
    },
    {
      title: '部门',
      dataIndex: ['dept', 'deptName'],
      key: 'deptName',
      width: 120,
    },
    {
      title: '手机号码',
      dataIndex: 'phonenumber',
      key: 'phonenumber',
      width: 130,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Switch
          checked={status === '0'}
          onChange={(checked) => handleStatusChange(checked, record)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: 'Google Key',
      key: 'googleKey',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button size="small" onClick={() => handleViewGoogleCode(record)}>查看</Button>
          <Button size="small" onClick={() => handleUpdateGoogleCode(record)}>更新</Button>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      sorter: true,
    },
    {
      title: '用户类型',
      dataIndex: 'userType',
      key: 'userType',
      width: 100,
      render: (userType) => {
        const typeMap = {
          '0': { color: 'default', text: '普通用户' },
          '1': { color: 'blue', text: '组长' },
          '2': { color: 'green', text: '代理' },
        };
        const type = typeMap[userType] || { color: 'default', text: '未知' };
        return <Tag color={type.color}>{type.text}</Tag>;
      },
    },
    {
      title: '绑定代理',
      key: 'bindAgent',
      width: 100,
      render: (_, record) => {
        if (record.userType == '1') {
          return <Button size="small" type="primary" onClick={() => handleBindAgent(record)}>添加</Button>;
        }
        return null;
      },
    },
    {
      title: '玩家用户',
      key: 'bindPlayer',
      width: 100,
      render: (_, record) => {
        if (record.userType == '1' || record.userType == '2') {
          return <Button size="small" type="primary" onClick={() => handleBindPlayer(record)}>添加</Button>;
        }
        return null;
      },
    },
    {
      title: '更多操作',
      key: 'moreActions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {(record.userId !== 1 && record.userId !== 2) && (
            <Button
              size="small"
              type="link"
              onClick={() => handleResetPwd(record)}
            >
              重置密码
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 4. 搜索字段配置
  const searchFieldList = [
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'SEARCH_LIKE_userName',
      type: 'text',
    },
    {
      title: '手机号码',
      dataIndex: 'phonenumber',
      key: 'SEARCH_LIKE_phonenumber',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'SEARCH_EQ_status',
      type: 'select',
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' }
      ]
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'SEARCH_GTE_createTime',
      type: 'date',
    },
  ];

  // 绑定代理表格列
  const bindAgentColumns = [
    {
      title: '用户编号',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      key: 'nickName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
  ];

  // 绑定玩家表格列
  const bindPlayerColumns = [
    {
      title: '用户编号',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '用户昵称',
      dataIndex: 'loginName',
      key: 'loginName',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 160,
    },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/user/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        rowKey="userId"
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        toolBarExtraButtons={[
          <Button key="allAssets" type="default" disabled style={{ marginRight: 8 }}>
            所有用户总资产: {allAssets}
          </Button>
        ]}
      />

      <DataForm
        visible={formVisible}
        title={editingUser ? '修改用户' : '添加用户'}
        initialValues={editingUser || {}}
        extraValues={{ userId: editingUser ? editingUser.userId : undefined }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={() => setEditingUser(null)}
        loading={loading}
        formType="drawer"
        width="600px"
      >
        <Form.Item
          name="nickName"
          label="用户昵称"
          rules={[{ required: true, message: '请输入用户昵称' }]}
        >
          <Input placeholder="请输入用户昵称" maxLength={30} />
        </Form.Item>

        <Form.Item
          name="phonenumber"
          label="手机号码"
          rules={[
            { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码' }
          ]}
        >
          <Input placeholder="请输入手机号码" maxLength={11} />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
        >
          <Input placeholder="请输入邮箱" maxLength={50} />
        </Form.Item>

        {!editingUser && (
          <>
            <Form.Item
              name="userName"
              label="用户名称"
              rules={[
                { required: true, message: '请输入用户名称' },
                { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间' }
              ]}
            >
              <Input placeholder="请输入用户名称" maxLength={30} />
            </Form.Item>

            <Form.Item
              name="password"
              label="用户密码"
              rules={[
                { required: true, message: '请输入用户密码' },
                { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间' }
              ]}
            >
              <Input.Password placeholder="请输入用户密码" maxLength={20} />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="sex"
          label="用户性别"
        >
          <Select placeholder="请选择性别">
            <Option value="0">男</Option>
            <Option value="1">女</Option>
            <Option value="2">未知</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="状态"
          initialValue="0"
        >
          <Select placeholder="请选择状态">
            <Option value="0">正常</Option>
            <Option value="1">停用</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="roleIds"
          label="角色"
          rules={[{ required: true, message: '请选择角色' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择角色"
            options={roleOptions}
          />
        </Form.Item>

        {editingUser && (
          <Form.Item
            name="thresholdPrice"
            label="阈值"
          >
            <Input type="number" placeholder="请输入阈值" />
          </Form.Item>
        )}

        <Form.Item
          name="userType"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <Select placeholder="请选择类型">
            <Option value="0">普通用户</Option>
            <Option value="1">组长</Option>
            <Option value="2">代理</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="withdrawalStatus"
          label="提现权限"
          initialValue="0"
        >
          <Select placeholder="请选择提现权限">
            <Option value="0">允许</Option>
            <Option value="1">禁止</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="playing"
          label="玩法配置"
          tooltip="1、输入顺序秒合约，币币交易和永续合约 2、1代表显示，2代表不显示 3、逗号分隔（例如1,1,2【秒合约和币币交易显示，合约交易不显示】）"
        >
          <Input placeholder="请输入内容" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea placeholder="请输入内容" rows={4} />
        </Form.Item>
      </DataForm>

      {/* 绑定代理对话框 */}
      <Modal
        title="绑定代理用户"
        open={bindAgentVisible}
        onOk={handleBindAgentOk}
        onCancel={() => {
          setBindAgentVisible(false);
          setBindAgentSelectedIds([]);
        }}
        width={1000}
        destroyOnClose
      >
        <Table
          rowKey="userId"
          columns={bindAgentColumns}
          dataSource={bindAgentUserList}
          rowSelection={{
            selectedRowKeys: bindAgentSelectedIds,
            onChange: (selectedRowKeys) => setBindAgentSelectedIds(selectedRowKeys),
          }}
          pagination={{
            current: bindAgentPageNum,
            pageSize: bindAgentPageSize,
            total: bindAgentTotal,
            onChange: (page, pageSize) => {
              setBindAgentPageNum(page);
              setBindAgentPageSize(pageSize);
              fetchBindAgentUsers(page, pageSize);
            },
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Modal>

      {/* 绑定玩家对话框 */}
      <Modal
        title="绑定玩家用户"
        open={bindPlayerVisible}
        onOk={handleBindPlayerOk}
        onCancel={() => {
          setBindPlayerVisible(false);
          setBindPlayerSelectedIds([]);
        }}
        width={1000}
        destroyOnClose
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="用户ID"
            value={playerSearchUserId}
            onChange={(e) => setPlayerSearchUserId(e.target.value)}
            style={{ width: 150 }}
          />
          <Input
            placeholder="用户名"
            value={playerSearchLoginName}
            onChange={(e) => setPlayerSearchLoginName(e.target.value)}
            style={{ width: 150 }}
          />
          <Button type="primary" onClick={() => fetchBindPlayerUsers(1, bindPlayerPageSize)}>
            搜索
          </Button>
          <Button onClick={() => {
            setPlayerSearchUserId('');
            setPlayerSearchLoginName('');
            fetchBindPlayerUsers(1, bindPlayerPageSize);
          }}>
            重置
          </Button>
        </Space>
        <Table
          rowKey="userId"
          columns={bindPlayerColumns}
          dataSource={bindPlayerUserList}
          rowSelection={{
            selectedRowKeys: bindPlayerSelectedIds,
            onChange: (selectedRowKeys) => setBindPlayerSelectedIds(selectedRowKeys),
          }}
          pagination={{
            current: bindPlayerPageNum,
            pageSize: bindPlayerPageSize,
            total: bindPlayerTotal,
            onChange: (page, pageSize) => {
              setBindPlayerPageNum(page);
              setBindPlayerPageSize(pageSize);
              fetchBindPlayerUsers(page, pageSize);
            },
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Modal>

      {/* Google Key 二维码预览 */}
      <Modal
        title="Google Key 二维码"
        open={googleCodeVisible}
        onCancel={() => {
          setGoogleCodeVisible(false);
          setGoogleCodeUrl('');
        }}
        footer={[
          <Button key="close" onClick={() => {
            setGoogleCodeVisible(false);
            setGoogleCodeUrl('');
          }}>
            关闭
          </Button>
        ]}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {googleCodeUrl ? (
            <img
              src={googleCodeUrl}
              alt="Google Key 二维码"
              style={{ maxWidth: '100%', maxHeight: '400px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          ) : (
            <div style={{ padding: '40px', color: '#999' }}>
              暂无图片数据
            </div>
          )}
        </div>
      </Modal>

      {/* 重置密码对话框 */}
      <Modal
        title={`重置"${resetPwdUserName}"的密码`}
        open={resetPwdVisible}
        onOk={handleResetPwdOk}
        onCancel={() => setResetPwdVisible(false)}
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 5, max: 20, message: '密码长度必须介于 5 和 20 之间' }
            ]}
          >
            <Input.Password placeholder="请输入新密码（5-20位字符）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemUserPage;
