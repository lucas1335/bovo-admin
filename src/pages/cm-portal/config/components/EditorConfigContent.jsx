import React, { useState, useEffect } from 'react';
import { Card, Button, message, Spin } from 'antd';
import CmEditor from '@components/CmEditor';
import { savePModuleConfig, updatePModuleConfig, getPModuleConfigList } from '@api';

/**
 * SINGLE_PAGE/RICH_TEXT 类型配置内容组件
 * 富文本编辑器
 */
const EditorConfigContent = ({ ruleConfig }) => {
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [recordId, setRecordId] = useState(null); // 保存记录ID，用于判断是新增还是更新

  // 加载已保存的配置数据
  useEffect(() => {
    const loadConfigData = async () => {
      if (!ruleConfig?.id) return;

      console.log('[EditorConfigContent] ===== 加载配置数据 ===== 规则ID:', ruleConfig.id);
      setLoading(true);

      try {
        const response = await getPModuleConfigList({
          pageNum: 1,
          pageSize: 1,
          searchParam: JSON.stringify({ SEARCH_EQ_configId: ruleConfig.id })
        });

        if ((response.code === 0 || response.code === 200) && response.data) {
          const list = response.data?.records || response.data?.list || response.data || [];
          if (list.length > 0) {
            console.log('[EditorConfigContent] 从接口获取到数据:', list[0]);
            setContent(list[0].content || '');
            setRecordId(list[0].id); // 保存记录ID
          } else {
            console.log('[EditorConfigContent] 接口未返回数据，使用空内容');
            setContent('');
            setRecordId(null);
          }
        } else {
          console.log('[EditorConfigContent] 接口调用失败');
          setContent('');
          setRecordId(null);
        }
      } catch (error) {
        console.error('[EditorConfigContent] 加载配置数据失败:', error);
        message.error('加载配置数据失败，请刷新重试');
        setContent('');
        setRecordId(null);
      } finally {
        setLoading(false);
      }
    };

    loadConfigData();
  }, [ruleConfig?.id]);

  // 处理内容变化
  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  // 提交保存
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let response;
      // 判断是新增还是更新
      if (recordId) {
        // 已有记录ID，调用更新接口
        console.log('[EditorConfigContent] 更新配置，记录ID:', recordId);
        response = await updatePModuleConfig({
          id: recordId,
          configId: ruleConfig.id,
          configCode: ruleConfig.code,
          content,
        });
      } else {
        // 没有记录ID，调用新增接口
        console.log('[EditorConfigContent] 新增配置');
        response = await savePModuleConfig({
          configId: ruleConfig.id,
          configCode: ruleConfig.code,
          content,
          state: 1,
        });
        // 保存成功后记录ID，下次就是更新操作
        if (response.code === 0 || response.code === 200) {
          setRecordId(response.data?.id || response.data);
        }
      }

      if (response.code === 0 || response.code === 200) {
        message.success(recordId ? '更新成功' : '保存成功');
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('保存失败: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={ruleConfig?.name || '内容编辑'}
      loading={loading}
      extra={
        <Button type="primary" onClick={handleSubmit} loading={submitting}>
          保存内容
        </Button>
      }
    >
      <Spin spinning={loading} tip="加载配置数据...">
        <CmEditor
          value={content}
          onChange={handleContentChange}
          height={600}
        />
      </Spin>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button type="primary" onClick={handleSubmit} loading={submitting}>
          保存内容
        </Button>
      </div>
    </Card>
  );
};

export default EditorConfigContent;
