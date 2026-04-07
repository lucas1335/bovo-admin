import React, { useState } from 'react';
import { message, Form, Input, Modal, Image } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import CmBasePage from '@components/CmBasePage';
import CmUpload from '@components/CmUpload';
import {
  getCommunityList,
  getCommunityDetail,
  addCommunity,
  updateCommunity,
  deleteCommunity,
} from '@api/modules/community';

const { confirm } = Modal;
const { TextArea } = Input;

/**
 * 社区管理页面
 * 功能：社区内容列表展示、新增、修改、删除
 */
const CommunityPage = () => {
  // 状态管理
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  // 刷新表格
  const refreshTable = () => {
    document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
      new CustomEvent('reload')
    );
  };

  /**
   * 打开新增对话框
   */
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setFormVisible(true);
  };

  /**
   * 打开编辑对话框
   */
  const handleEdit = async (record) => {
    setEditingRecord(record);

    const response = await getCommunityDetail(record.id);

    if (response.code === 0 || response.code === 200) {
      const data = response.data;
      // 处理图片字段（可能是逗号分隔的字符串）
      const pictureArray = data.picture
        ? (typeof data.picture === 'string' ? data.picture.split(',') : data.picture)
        : [];

      form.setFieldsValue({
        ...data,
        picture: pictureArray
      });
      setFormVisible(true);
    } else {
      message.error(response.msg || '获取详情失败');
    }
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 处理图片字段：转换为逗号分隔的字符串
      const submitData = {
        username: values.username,
        avatar: values.avatar,
        content: values.content,
        picture: Array.isArray(values.picture) ? values.picture.join(',') : values.picture,
        id: editingRecord?.id
      };

      const response = editingRecord?.id
        ? await updateCommunity(submitData)
        : await addCommunity(submitData);

      if (response.code === 0 || response.code === 200) {
        message.success(editingRecord?.id ? '修改成功' : '新增成功');
        setFormVisible(false);
        form.resetFields();
        refreshTable();
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning('请填写必填项');
      } else {
        message.error('操作失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除社区内容
   */
  const handleDelete = (record) => {
    confirm({
      title: '确认删除?',
      icon: <ExclamationCircleOutlined />,
      content: `是否确认删除社区编号为"${record.id}"的数据项？`,
      onOk: async () => {
        try {
          setLoading(true);
          const response = await deleteCommunity(record.id);

          if (response.code === 0 || response.code === 200) {
            message.success('删除成功');
            refreshTable();
          } else {
            message.error(response.msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败: ' + error.message);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 列配置
  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名称',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 100,
      render: (avatar) => avatar ? (
        <Image src={avatar} width={50} height={50} style={{ borderRadius: '50%' }} />
      ) : '-',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 200,
      ellipsis: true,
    },
    {
      title: '图片',
      dataIndex: 'picture',
      key: 'picture',
      width: 150,
      render: (picture) => {
        if (!picture) return '-';

        const pictures = typeof picture === 'string' ? picture.split(',') : picture;

        if (pictures.length > 1) {
          return (
            <div style={{ display: 'flex', gap: '5px', maxWidth: '110px', overflowX: 'auto' }}>
              {pictures.map((pic, index) => (
                <Image key={index} src={pic} width={50} height={50} />
              ))}
            </div>
          );
        }

        return <Image src={pictures[0]} width={50} height={50} />;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
  ];

  // 搜索配置
  const searchFieldList = [
    {
      title: '用户名称',
      dataIndex: 'username',
      key: 'SEARCH_LIKE_username',
      type: 'text',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'SEARCH_LIKE_content',
      type: 'text',
    },
  ];

  return (
    <>
      <CmBasePage
        columns={columns}
        apiEndpoint="/system/news/list"
        apiMethod="get"
        searchFieldList={searchFieldList}
        rowKey="id"
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        actionButtons={{
          view: false,
          edit: true,
          delete: true,
        }}
      />

      {/* 新增/编辑对话框 */}
      <Modal
        title={editingRecord?.id ? '修改社区' : '新增社区'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="username"
            label="用户名称"
            rules={[{ required: true, message: '用户名称不能为空' }]}
          >
            <Input placeholder="请输入用户名称" />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="头像"
            rules={[{ required: true, message: '用户头像不能为空' }]}
          >
            <CmUpload limit={1} />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '内容不能为空' }]}
          >
            <TextArea placeholder="请输入内容" rows={4} />
          </Form.Item>

          <Form.Item
            name="picture"
            label="图片"
          >
            <CmUpload limit={9} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CommunityPage;
