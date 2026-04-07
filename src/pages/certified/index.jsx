import React, { useState } from 'react';
import { message, Modal, Form, Input, Tag } from 'antd';
import CmBasePage from '@components/CmBasePage';
import CmImage from '@components/CmImage';
import { getKycCertificationList, approveCertification, rejectCertification, revokeCertification } from '@api';

/**
 * 认证管理页面
 * 功能：查看认证申请、审核通过/拒绝、驳回已通过认证
 */
const CertifiedPage = () => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [revokeModalVisible, setRevokeModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [currentType, setCurrentType] = useState(''); // 'primary' 或 'advanced'
  const [currentFlag, setCurrentFlag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  /**
   * 刷新表格
   */
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 审核通过
   * @param {Object} record - 认证记录
   * @param {number} flag - 1:初级认证通过, 3:高级认证通过
   * @param {string} type - 'primary' 或 'advanced'
   */
  const handleApprove = (record, flag, type) => {
    const typeName = type === 'primary' ? '初级' : '高级';
    Modal.confirm({
      title: '审核通过确认',
      content: `确定通过该用户的${typeName}认证吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true);
          const response = await approveCertification({
            userId: record.userId,
            flag: flag,
            id: record.id
          });
          if (response.code === 0 || response.code === 200) {
            message.success(`${typeName}认证审核通过`);
            refreshTable();
          } else {
            message.error(response.msg || '审核失败');
          }
        } catch (error) {
          message.error('审核失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  /**
   * 显示拒绝对话框
   * @param {Object} record - 认证记录
   * @param {string} type - 'primary' 或 'advanced'
   * @param {number} flag - 2:初级认证拒绝, 4:高级认证拒绝
   */
  const showRejectModal = (record, type, flag) => {
    setCurrentRecord(record);
    setCurrentType(type);
    setCurrentFlag(flag);
    form.setFieldsValue({ reason: '' });
    setRejectModalVisible(true);
  };

  /**
   * 确认拒绝
   */
  const handleRejectConfirm = async () => {
    try {
      const values = await form.validateFields();
      if (!values.reason || !values.reason.trim()) {
        message.warning('请输入拒绝理由');
        return;
      }

      setLoading(true);
      const typeName = currentType === 'primary' ? '初级' : '高级';
      const response = await rejectCertification({
        userId: currentRecord.userId,
        flag: currentFlag,
        id: currentRecord.id,
        reason: values.reason.trim()
      });

      if (response.code === 0 || response.code === 200) {
        message.success(`已拒绝${typeName}认证`);
        setRejectModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '拒绝失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('拒绝失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 显示驳回对话框（驳回已通过的认证）
   * @param {Object} record - 认证记录
   * @param {string} type - 'primary' 或 'advanced'
   */
  const showRevokeModal = (record, type) => {
    setCurrentRecord(record);
    setCurrentType(type);
    form.setFieldsValue({ reason: '' });
    setRevokeModalVisible(true);
  };

  /**
   * 确认驳回
   */
  const handleRevokeConfirm = async () => {
    try {
      const values = await form.validateFields();
      if (!values.reason || !values.reason.trim()) {
        message.warning('请输入驳回理由');
        return;
      }

      setLoading(true);
      const response = await revokeCertification({
        userId: currentRecord.userId,
        reason: values.reason.trim()
      });

      if (response.code === 0 || response.code === 200) {
        message.success(response.msg || '驳回成功');
        setRevokeModalVisible(false);
        refreshTable();
      } else {
        message.error(response.msg || '驳回失败');
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('驳回失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取消拒绝/驳回
   */
  const handleCancel = () => {
    setRejectModalVisible(false);
    setRevokeModalVisible(false);
    form.resetFields();
    setCurrentRecord(null);
    setCurrentType('');
    setCurrentFlag(null);
  };

  // 初级认证状态映射
  const primaryStatusMap = {
    1: { color: 'success', text: '已审核' },
    2: { color: 'error', text: '拒绝' },
    3: { color: 'default', text: '待审核' },
  };

  // 高级认证状态映射
  const advancedStatusMap = {
    1: { color: 'success', text: '已审核' },
    2: { color: 'error', text: '拒绝' },
    3: { color: 'default', text: '待审核' },
  };

  /**
   * 渲染认证状态标签
   */
  const renderStatusTag = (status, type) => {
    const statusMap = type === 'primary' ? primaryStatusMap : advancedStatusMap;
    const statusInfo = statusMap[status] || { color: 'default', text: '未知' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  /**
   * 渲染操作按钮
   */
  const renderActionButtons = (record) => {
    const buttons = [];

    // 初级认证操作（待审核状态）
    if (record.auditStatusPrimary === 3) {
      buttons.push(
        <div key="primary-actions" style={{ marginBottom: 8 }}>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>初级审核：</div>
          <div>
            <button
              style={{
                marginRight: 8,
                padding: '4px 12px',
                background: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => handleApprove(record, 1, 'primary')}
            >
              通过
            </button>
            <button
              style={{
                padding: '4px 12px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => showRejectModal(record, 'primary', 2)}
            >
              拒绝
            </button>
          </div>
        </div>
      );
    }

    // 高级认证操作（待审核状态）
    if (record.auditStatusAdvanced === 3) {
      buttons.push(
        <div key="advanced-actions" style={{ marginBottom: 8 }}>
          <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>高级审核：</div>
          <div>
            <button
              style={{
                marginRight: 8,
                padding: '4px 12px',
                background: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => handleApprove(record, 3, 'advanced')}
            >
              通过
            </button>
            <button
              style={{
                padding: '4px 12px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
              onClick={() => showRejectModal(record, 'advanced', 4)}
            >
              拒绝
            </button>
          </div>
        </div>
      );
    }

    // 驳回操作（已通过的高级认证）
    if (record.auditStatusAdvanced === 1) {
      buttons.push(
        <div key="revoke-actions">
          <button
            style={{
              padding: '4px 12px',
              background: '#faad14',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
            onClick={() => showRevokeModal(record, 'advanced')}
          >
            驳回
          </button>
        </div>
      );
    }

    return buttons.length > 0 ? <div>{buttons}</div> : null;
  };

  // 列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'realName',
      key: 'realName',
      width: 120,
    },
    {
      title: '证件号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 180,
      render: (text) => {
        if (!text) return '-';
        // 脱敏显示：显示前6位和后4位
        if (text.length > 10) {
          return text.substring(0, 6) + '********' + text.substring(text.length - 4);
        }
        return text;
      },
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 100,
      render: (text) => text || '暂无',
    },
    {
      title: '正面照片',
      dataIndex: 'frontUrl',
      key: 'frontUrl',
      width: 100,
      render: (text) => <CmImage src={text} width={60} height={60} />,
    },
    {
      title: '反面照片',
      dataIndex: 'backUrl',
      key: 'backUrl',
      width: 100,
      render: (text) => <CmImage src={text} width={60} height={60} />,
    },
    {
      title: '手持照片',
      dataIndex: 'handelUrl',
      key: 'handelUrl',
      width: 100,
      render: (text) => <CmImage src={text} width={60} height={60} />,
    },
    {
      title: '初级验证状态',
      dataIndex: 'auditStatusPrimary',
      key: 'auditStatusPrimary',
      width: 120,
      render: (status) => renderStatusTag(status, 'primary'),
    },
    {
      title: '高级验证状态',
      dataIndex: 'auditStatusAdvanced',
      key: 'auditStatusAdvanced',
      width: 120,
      render: (status) => renderStatusTag(status, 'advanced'),
    },
    {
      title: '审批理由',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => renderActionButtons(record),
    },
  ];

  // 搜索字段配置
  const searchFieldList = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'SEARCH_EQ_userId',
      type: 'text',
    },
    {
      title: '证件号',
      dataIndex: 'idCard',
      key: 'SEARCH_LIKE_idCard',
      type: 'text',
    },
    {
      title: '初级认证状态',
      dataIndex: 'auditStatusPrimary',
      key: 'SEARCH_EQ_auditStatusPrimary',
      type: 'select',
      options: [
        { label: '已审核', value: 1 },
        { label: '拒绝', value: 2 },
        { label: '待审核', value: 3 },
      ],
    },
    {
      title: '高级认证状态',
      dataIndex: 'auditStatusAdvanced',
      key: 'SEARCH_EQ_auditStatusAdvanced',
      type: 'select',
      options: [
        { label: '已审核', value: 1 },
        { label: '拒绝', value: 2 },
        { label: '待审核', value: 3 },
      ],
    },
  ];

  return (
    <div>
      {/* 认证列表 */}
      <CmBasePage
        columns={columns}
        apiEndpoint="/kycCertification/getList"
        apiMethod="get"
        searchFieldList={searchFieldList}
        actionButtons={{ view: false, edit: false, delete: false }}
        rowKey="id"
      />

      {/* 拒绝理由弹窗 */}
      <Modal
        title="拒绝理由"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="reason"
            label="拒绝理由"
            rules={[
              { required: true, message: '请输入拒绝理由' },
              { max: 200, message: '拒绝理由不能超过200字' }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入拒绝理由"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 驳回理由弹窗 */}
      <Modal
        title="驳回理由"
        open={revokeModalVisible}
        onOk={handleRevokeConfirm}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="reason"
            label="驳回理由"
            rules={[
              { required: true, message: '请输入驳回理由' },
              { max: 200, message: '驳回理由不能超过200字' }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入驳回理由"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CertifiedPage;
