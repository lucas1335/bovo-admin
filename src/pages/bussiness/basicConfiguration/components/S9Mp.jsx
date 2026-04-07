import React, { useState, useEffect } from 'react';
import { Button, message, Card, Form, Upload, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getSettingConfig, saveSettingConfigWithBio } from '@api';
import { getToken } from '@utils/auth';

/**
 * S9Mp - 提示音配置组件
 */
const S9Mp = () => {
  const [form] = Form.useForm();
  const [rechargeVoice, setRechargeVoice] = useState('');
  const [withdrawalVoice, setWithdrawalVoice] = useState('');
  const [verifiedVoice, setVerifiedVoice] = useState('');
  const [loading, setLoading] = useState(false);

  const uploadUrl = '/api/system/common/upload/OSS';
  const headers = {
    Authorization: 'Bearer ' + getToken()
  };

  useEffect(() => {
    getMpConfig();
  }, []);

  const getMpConfig = async () => {
    try {
      const res = await getSettingConfig('WITHDRAWAL_RECHARGE_VOICE');
      if (res.code === 200) {
        const result = res.data || {};
        form.setFieldsValue(result);
        setRechargeVoice(result.rechargeVoiceUrl || '');
        setWithdrawalVoice(result.withdrawalVoiceUrl || '');
        setVerifiedVoice(result.verifiedVoiceUrl || '');
      }
    } catch (e) {
      console.error('请求失败', e);
    }
  };

  const handleUploadSuccess = (field, url) => {
    form.setFieldValue(field, url);
    if (field === 'rechargeVoiceUrl') setRechargeVoice(url);
    if (field === 'withdrawalVoiceUrl') setWithdrawalVoice(url);
    if (field === 'verifiedVoiceUrl') setVerifiedVoice(url);
  };

  const submitForm = async () => {
    try {
      const values = form.getFieldsValue();
      setLoading(true);
      const res = await saveSettingConfigWithBio('WITHDRAWAL_RECHARGE_VOICE', JSON.stringify(values));
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

  const uploadProps = (field) => ({
    name: 'file',
    action: uploadUrl,
    headers: headers,
    accept: '.mp3',
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      const isAudio = file.name.endsWith('.mp3');
      if (!isAudio) {
        message.error('只能上传MP3格式文件!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('文件大小不能超过5MB!');
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        handleUploadSuccess(field, info.file.response?.url || '');
      }
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>提示音配置</h3>
        <Button type="primary" onClick={submitForm} loading={loading}>保存</Button>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Card title="充值提醒" style={{ flex: 1, minWidth: 300 }}>
          <Form.Item label="">
            <Upload {...uploadProps('rechargeVoiceUrl')}>
              <Button icon={<UploadOutlined />}>上传</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#999' }}>不超过5MB，MP3格式</div>
          </Form.Item>
          {rechargeVoice && (
            <audio controls style={{ width: '100%' }} src={rechargeVoice} />
          )}
        </Card>

        <Card title="提现提醒" style={{ flex: 1, minWidth: 300 }}>
          <Form.Item label="">
            <Upload {...uploadProps('withdrawalVoiceUrl')}>
              <Button icon={<UploadOutlined />}>上传</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#999' }}>不超过5MB，MP3格式</div>
          </Form.Item>
          {withdrawalVoice && (
            <audio controls style={{ width: '100%' }} src={withdrawalVoice} />
          )}
        </Card>

        <Card title="实名认证" style={{ flex: 1, minWidth: 300 }}>
          <Form.Item label="">
            <Upload {...uploadProps('verifiedVoiceUrl')}>
              <Button icon={<UploadOutlined />}>上传</Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#999' }}>不超过5MB，MP3格式</div>
          </Form.Item>
          {verifiedVoice && (
            <audio controls style={{ width: '100%' }} src={verifiedVoice} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default S9Mp;
