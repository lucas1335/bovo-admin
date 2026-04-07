import React, { useState } from 'react';
import { message, Tag, Form, Input, Radio, InputNumber, Button } from 'antd';
import CmBasePage from '@components/CmBasePage';
import DataForm from '@components/DataForm';
import CmUpload from '@components/CmUpload';
import CmEditor from '@components/CmEditor';
import CmImage from '@components/CmImage';
import CmUploadMore from '@components/CmUploadMore';
import { saveQProductInfo, updateQProductInfo, deleteQProductInfo } from '@api';

const { TextArea } = Input;

/**
 * 产品列表子组件 - 用于在分类管理中显示指定分类的产品
 * @param {string} categoryId - 分类ID
 * @param {string} categoryName - 分类名称
 */
export const ProductListByCategory = ({ categoryId, categoryName }) => {
  const [productFormVisible, setProductFormVisible] = useState(false);
  const [productEditingRecord, setProductEditingRecord] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productViewMode, setProductViewMode] = useState(false);

  const handleProductAdd = () => {
    setProductEditingRecord(null);
    setProductViewMode(false);
    setProductFormVisible(true);
  };

  const handleProductEdit = (record) => {
    setProductEditingRecord(record);
    setProductViewMode(false);
    setProductFormVisible(true);
  };

  const handleProductView = (record) => {
    setProductEditingRecord(record);
    setProductViewMode(true);
    setProductFormVisible(true);
  };

  const handleProductDelete = async (record) => {
    try {
      const response = await deleteQProductInfo({ id: record.id });
      if (response.code === 0 || response.code === 200) {
        message.success('删除成功');
        // 刷新产品列表
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '删除失败');
      }
    } catch (error) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleProductSubmit = async (values) => {
    setProductLoading(true);
    try {
      // 强制设置当前分类ID
      const submitValues = {
        ...values,
        categoryId: categoryId
      };

      const response = productEditingRecord
        ? await updateQProductInfo(submitValues)
        : await saveQProductInfo(submitValues);

      if (response.code === 0 || response.code === 200) {
        message.success(productEditingRecord ? '更新成功' : '创建成功');
        setProductFormVisible(false);
        // 刷新产品列表
        document.querySelector('.ant-pro-table')?.parentNode?.dispatchEvent(
          new CustomEvent('reload')
        );
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setProductLoading(false);
    }
  };

  // 产品列表列定义
  const productColumns = [
    {
      title: '产品名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '封面图',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 120,
      render: (text) => <CmImage src={text} width={100} height={60} />,
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120,
    },
    {
      title: '设计压力',
      dataIndex: 'designPressure',
      key: 'designPressure',
      width: 120,
    },
    {
      title: '设计温度',
      dataIndex: 'designTemperature',
      key: 'designTemperature',
      width: 120,
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material',
      width: 120,
    },
    {
      title: '设备规格',
      dataIndex: 'deviceSpecification',
      key: 'deviceSpecification',
      width: 150,
    },
    {
      title: '阅读量',
      dataIndex: 'readNum',
      key: 'readNum',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (state) => {
        const stateMap = {
          '1': { text: '上架', color: 'success' },
          '0': { text: '下架', color: 'error' },
        };
        const s = stateMap[state] || { text: '未知', color: 'default' };
        return <Tag color={s.color}>{s.text}</Tag>;
      }
    },
    {
      title: '排序',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => handleProductEdit(record)}
            style={{ color: '#faad14' }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleProductView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleProductDelete(record)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  // 产品列表搜索字段
  const productSearchFieldList = [
    {
      title: '产品名称',
      dataIndex: 'title',
      key: 'SEARCH_LIKE_title',
      type: 'text',
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'SEARCH_EQ_state',
      type: 'select',
      options: [
        { label: '上架', value: '1' },
        { label: '下架', value: '0' }
      ]
    },
  ];

  return (
    <>
      <CmBasePage
        columns={productColumns}
        apiEndpoint="/qProductInfo/getList"
        apiMethod="get"
        searchFieldList={productSearchFieldList}
        onAdd={handleProductAdd}
        extraParams={{ SEARCH_EQ_category_id: categoryId }}
        rowKey="id"
      />

      {/* 产品表单 */}
      <DataForm
        visible={productFormVisible}
        title={productViewMode ? '查看产品' : (productEditingRecord ? '编辑产品' : '新增产品')}
        initialValues={productEditingRecord || { categoryId: categoryId, state: 1, orderNo: 0 }}
        extraValues={{ id: productEditingRecord?.id }}
        onCancel={() => setProductFormVisible(false)}
        onSubmit={handleProductSubmit}
        loading={productLoading}
        formType="drawer"
        width="80%"
        disabled={productViewMode}
        key={productEditingRecord ? `edit-${productEditingRecord.id}` : productFormVisible ? 'new' : 'closed'}
      >
        <Form.Item
          name="title"
          label="产品名称"
          rules={[{ required: true, message: '请输入产品名称' }]}
        >
          <Input placeholder="请输入产品名称" disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="coverImage"
          label="封面图"
        >
          <CmUpload disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="images"
          label="产品图片"
        >
          <CmUploadMore disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="deviceName"
          label="设备名称"
        >
          <Input placeholder="请输入设备名称" disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="designPressure"
          label="设计压力"
        >
          <Input placeholder="请输入设计压力" disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="designTemperature"
          label="设计温度"
        >
          <Input placeholder="请输入设计温度" disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="material"
          label="材质"
        >
          <Input placeholder="请输入材质" disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="deviceSpecification"
          label="设备规格"
        >
          <Input placeholder="请输入设备规格" disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="summary"
          label="产品摘要"
        >
          <TextArea rows={4} placeholder="请输入产品摘要" disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="content"
          label="产品详情"
        >
          <CmEditor disabled={productViewMode} />
        </Form.Item>

        <Form.Item
          name="state"
          label="状态"
        >
          <Radio.Group disabled={productViewMode}>
            <Radio value={1}>上架</Radio>
            <Radio value={0}>下架</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="orderNo"
          label="排序"
        >
          <InputNumber placeholder="请输入排序" style={{ width: '100%' }} disabled={productViewMode} />
        </Form.Item>
      </DataForm>
    </>
  );
};
