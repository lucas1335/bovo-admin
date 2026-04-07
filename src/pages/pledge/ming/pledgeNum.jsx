import React, { useState, useEffect } from 'react';
import { message, Tag, Form, Input, InputNumber, Select, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import { getPledgeUserList, getPledgeAvailableUsers, savePledgeUser, updatePledgeUser, deletePledgeUser } from '@api/modules/pledge';

const { Option } = Select;

/**
 * 质押限购管理页面
 * 功能：为特定产品设置用户限购次数
 */
const PledgeNumPage = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [productId, setProductId] = useState(null); // 从URL获取的产品ID
  const [showDisabled, setShowDisabled] = useState(false); // 是否显示禁用的用户输入框
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 从URL查询参数获取产品ID
  useEffect(() => {
    const id = searchParams.get('productId');
    if (id) {
      setProductId(parseInt(id));
    }
  }, [searchParams]);

  /**
   * 新增限购
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setUserOptions([]); // 清空用户选项
    setShowDisabled(false);
    setFormVisible(true);
    // 加载可设置限购的用户列表
    loadAvailableUsers();
  };

  /**
   * 编辑限购
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowDisabled(true);
    setFormVisible(true);
  };

  /**
   * 删除限购
   */
  const handleDelete = async (record) => {
    try {
      const response = await deletePledgeUser({ id: record.id });
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
   * 加载可设置限购的用户列表
   */
  const loadAvailableUsers = async () => {
    if (!productId) {
      message.warning('请先选择产品');
      return;
    }
    try {
      const response = await getPledgeAvailableUsers(productId);
      if (response.code === 0 || response.code === 200) {
        setUserOptions(response.rows || response.data || []);
      } else {
        message.error('加载用户列表失败');
      }
    } catch (error) {
      message.error('加载用户列表失败: ' + error.message);
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = {
        ...values,
        productId: productId,
      };

      // 新增
      if (!showDisabled) {
        const response = await savePledgeUser(formData);
        if (response.code === 0 || response.code === 200) {
          message.success('设置成功');
          setFormVisible(false);
          refreshTable();
        } else {
          message.error(response.msg || '操作失败');
        }
      } else {
        // 修改
        const response = await updatePledgeUser({
          ...formData,
          id: editingRecord?.id,
        });
        if (response.code === 0 || response.code === 200) {
          message.success('设置成功');
          setFormVisible(false);
          refreshTable();
        } else {
          message.error(response.msg || '操作失败');
        }
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新表格数据
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 返回产品列表
   */
  const handleBack = () => {
    navigate('/pledge/ming');
  };

  /**
   * 关闭表单时的回调
   */
  const handleFormClosed = () => {
    setEditingRecord(null);
    setShowDisabled(false);
    setUserOptions([]);
  };

  // 测试用户映射
  const testUserMap = {
    0: { color: 'green', text: '否' },
    1: { color: 'orange', text: '是' },
  };

  /**
   * 列配置定义
   */
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户ID',
      dataIndex: 'appUserId',
      key: 'appUserId',
      width: 80,
    },
    {
      title: '登录名',
      dataIndex: ['tappUser', 'loginName'],
      key: 'loginName',
      width: 150,
    },
    {
      title: '测试用户',
      key: 'isTest',
      width: 100,
      render: (_, record) => {
        const isTest = record.tappUser?.isTest;
        const userInfo = testUserMap[isTest] || { color: 'default', text: '未知' };
        return <Tag color={userInfo.color}>{userInfo.text}</Tag>;
      },
    },
    {
      title: '限购产品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
    },
    {
      title: '限购产品标题',
      dataIndex: 'title',
      key: 'title',
      width: 100,
    },
    {
      title: '限购次数',
      dataIndex: 'pledgeNum',
      key: 'pledgeNum',
      width: 100,
      render: (num) => `${num}次`,
    },
  ];

  /**
   * 搜索字段配置
   */
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'appUserId',
      key: 'SEARCH_EQ_appUserId',
      type: 'text',
    },
  ];

  // 编辑时显示用户信息
  const userDisplayInfo = editingRecord
    ? `id:${editingRecord.appUserId}   登录名：${editingRecord.tappUser?.loginName}`
    : '';

  return (
    <div>
      {/* 工具栏 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>限购设置</h2>
        <Button
          type="success"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          返回
        </Button>
      </div>

      {/* 限购列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/contract/productUser/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        extraParams={{ productId: productId }} // 固定筛选当前产品
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
        rowKey="id"
      />

      {/* 限购设置表单 */}
      <DataForm
        visible={formVisible}
        title="限购设置"
        initialValues={{
          pledgeNum: editingRecord?.pledgeNum || 0,
          appUserId: editingRecord?.appUserId,
        }}
        extraValues={{
          id: editingRecord?.id,
          productId: productId,
        }}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        onClosed={handleFormClosed}
        loading={loading}
        formType="modal"
        width="800px"
      >
        <Form.Item
          name="pledgeNum"
          label="限购次数"
          rules={[{ required: true, message: '限购次数不能为空' }]}
        >
          <InputNumber placeholder="请输入限购次数" min={0} style={{ width: '100%' }} />
        </Form.Item>

        {showDisabled ? (
          <Form.Item label="用户">
            <Input value={userDisplayInfo} disabled />
          </Form.Item>
        ) : (
          <Form.Item
            name="appUserId"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select
              placeholder="请选择用户或搜索用户id/名称"
              showSearch
              filterOption={(input, option) => {
                const label = option?.children || '';
                return label.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {userOptions.map((item) => (
                <Option
                  key={item.userId}
                  value={item.userId}
                >
                  id:{item.userId}   登录名：{item.loginName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </DataForm>
    </div>
  );
};

export default PledgeNumPage;
