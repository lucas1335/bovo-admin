import React, { useEffect, useState } from 'react';
import { Button, message, Input, Space } from 'antd';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';

/**
 * S5IpControl - 后台IP控制组件
 */
const S5IpControl = ({ formRef }) => {
  const [ipList, setIpList] = useState([]);

  useEffect(() => {
    if (formRef) {
      formRef.current = { submit: submitiPControlForm };
    }
    getIPControlform();
  }, []);

  const getIPControlform = async () => {
    try {
      const res = await getSettingConfig('WHITE_IP_SETTING');
      if (res.code === 200) {
        let result = res.data || [];
        if (typeof result === 'string') {
          try {
            result = JSON.parse(result);
          } catch (e) {
            console.error('JSON解析失败:', e);
            result = [];
          }
        }
        for (let i = 0; i < result.length; i++) {
          for (let key in result[i]) {
            if (!result[i][key]) {
              result[i][key] = '';
            }
          }
        }
        setIpList(result);
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  const addIpBtn = () => {
    const newData = {
      ip: '',
      remark: '',
    };
    setIpList([...ipList, newData]);
  };

  const deleteIpBtn = (index) => {
    const newList = [...ipList];
    newList.splice(index, 1);
    setIpList(newList);
  };

  const updateIpItem = (index, field, value) => {
    const newList = [...ipList];
    newList[index][field] = value;
    setIpList(newList);
  };

  const submitiPControlForm = async () => {
    if (ipList.some((val) => val.ip === '' || val.remark === '')) {
      message.error('请填写完整内容');
      return;
    }

    try {
      const res = await saveSettingConfigWithBio('WHITE_IP_SETTING', ipList);
      if (res.code === 200) {
        message.success('保存成功');
      } else {
        message.error(res.msg || '保存失败');
      }
    } catch (error) {
      message.error('保存失败: ' + error.message);
    }
  };

  return (
    <div>
      {ipList.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: '12px',
            padding: '12px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
          }}
        >
          <Space>
            <span>IP：</span>
            <Input
              maxLength={100}
              value={item.ip}
              onChange={(e) => updateIpItem(index, 'ip', e.target.value)}
              style={{ width: '150px' }}
              placeholder="请输入IP"
            />
            <span>备注：</span>
            <Input
              value={item.remark}
              onChange={(e) => updateIpItem(index, 'remark', e.target.value)}
              style={{ width: '150px' }}
              placeholder="请输入备注"
            />
            <Button type="primary" danger onClick={() => deleteIpBtn(index)}>
              删除
            </Button>
          </Space>
        </div>
      ))}
      <div style={{ marginTop: '16px' }}>
        <Button type="primary" onClick={submitiPControlForm}>
          保存
        </Button>
        <Button
          type="primary"
          onClick={addIpBtn}
          style={{ marginLeft: '8px' }}
        >
          添加
        </Button>
      </div>
    </div>
  );
};

export default S5IpControl;
