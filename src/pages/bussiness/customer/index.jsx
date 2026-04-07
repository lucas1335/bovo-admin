import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';
import { cloneDeep } from 'lodash';

/**
 * 客服设置页面
 */
const CustomerPage = () => {
  const [form] = Form.useForm();
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomerForm();
  }, []);

  /**
   * 获取客服设置
   */
  const getCustomerForm = async () => {
    try {
      const res = await getSettingConfig('SUPPORT_STAFF_SETTING');
      if (res.code === 200) {
        let result = res.data || [];
        for (let i = 0; i < result.length; i++) {
          for (let key in result[i]) {
            if (!result[i][key]) {
              result[i][key] = '';
            }
          }
        }
        setCustomerList(result);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  /**
   * 添加客服
   */
  const addBtn = () => {
    const newData = {
      url: '',
      imgUrl: '',
      status: '',
      name: '',
    };
    setCustomerList([...customerList, newData]);
  };

  /**
   * 删除客服
   */
  const deleteBtn = (index) => {
    const newList = [...customerList];
    newList.splice(index, 1);
    setCustomerList(newList);
  };

  /**
   * 审批客服
   */
  const auditBtn = (index) => {
    const newList = [...customerList];
    newList[index].status = '1';
    setCustomerList(newList);
    submitForm();
  };

  /**
   * 更新客服信息
   */
  const updateItem = (index, field, value) => {
    const newList = [...customerList];
    newList[index][field] = value;
    setCustomerList(newList);
  };

  /**
   * 提交表单
   */
  const submitForm = async () => {
    if (
      customerList.some(
        (val) => val.url === '' || val.imgUrl === '' || val.name === ''
      )
    ) {
      message.error('请填写完整内容');
      return;
    }

    setLoading(true);
    try {
      const res = await saveSettingConfigWithBio(
        'SUPPORT_STAFF_SETTING',
        JSON.stringify(customerList)
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
      <div style={{ marginBottom: '24px' }}>
        {customerList.length > 0 ? (
          customerList.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: '16px',
                padding: '16px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ marginRight: '8px' }}>名称：</span>
                <Input
                  maxLength={100}
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                  style={{ width: '150px', marginRight: '16px' }}
                  placeholder="请输入名称"
                />
                <span style={{ marginRight: '8px' }}>图标：</span>
                <Image
                  src={item.imgUrl}
                  width={60}
                  height={60}
                  style={{ marginRight: '16px' }}
                  placeholder="暂无图片"
                />
                <Input
                  value={item.imgUrl}
                  onChange={(e) => updateItem(index, 'imgUrl', e.target.value)}
                  style={{ width: '300px', marginRight: '16px' }}
                  placeholder="请输入图片URL"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>客服链接：</span>
                <Input
                  value={item.url}
                  onChange={(e) => updateItem(index, 'url', e.target.value)}
                  style={{ width: '300px', marginRight: '16px' }}
                  placeholder="请输入客服链接"
                />
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteBtn(index)}
                  style={{ marginRight: '8px' }}
                >
                  删除
                </Button>
                {customerList.length > 0 && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addBtn}
                  >
                    添加
                  </Button>
                )}
                {!item.status && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => auditBtn(index)}
                    style={{ marginLeft: '8px' }}
                  >
                    审批
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>暂无客服配置</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <Button type="primary" onClick={submitForm} loading={loading}>
          保存
        </Button>
        {customerList.length === 0 && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addBtn}
            style={{ marginLeft: '8px' }}
          >
            添加
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerPage;
