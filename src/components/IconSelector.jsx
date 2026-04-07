import React, { useState, useEffect } from 'react';
import { Input, Modal } from 'antd';
import * as Icons from '@ant-design/icons';

// 图标列表
const ICON_NAMES = Object.keys(Icons).filter(key => key !== 'default' && key !== 'createFromIconfontCN' && typeof Icons[key] === 'object');

/**
 * 图标选择器组件
 * 用于在菜单管理中选择图标
 */
const IconSelector = ({ visible, onSelect, onCancel, selectedIcon }) => {
  const [searchText, setSearchText] = useState('');

  // 重置搜索
  useEffect(() => {
    if (visible) {
      setSearchText('');
    }
  }, [visible]);

  // 过滤图标
  const filteredIcons = ICON_NAMES.filter(iconName =>
    iconName.toLowerCase().includes(searchText.toLowerCase())
  );

  // 渲染图标
  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    if (!IconComponent) return null;

    return (
      <div
        key={iconName}
        className={`icon-item ${selectedIcon === iconName ? 'active' : ''}`}
        onClick={() => {
          onSelect(iconName);
          onCancel();
        }}
      >
        <IconComponent />
        <span className="icon-name">{iconName.replace(/Outlined|Filled|TwoTone/g, '')}</span>
      </div>
    );
  };

  return (
    <Modal
      title="选择图标"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      style={{ top: 20 }}
    >
      <div className="icon-selector">
        <Input
          placeholder="搜索图标名称"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ marginBottom: 16 }}
        />
        <div className="icon-list">
          {filteredIcons.map(iconName => renderIcon(iconName))}
        </div>
      </div>

      <style jsx>{`
        .icon-selector {
          padding: 8px 0;
        }
        .icon-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
        }
        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border: 1px solid #d9d9d9;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          padding: 8px;
        }
        .icon-item:hover {
          border-color: #1890ff;
          background-color: #e6f7ff;
        }
        .icon-item.active {
          border-color: #1890ff;
          background-color: #1890ff;
          color: white;
        }
        .icon-item .anticon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        .icon-name {
          font-size: 12px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
      `}</style>
    </Modal>
  );
};

export default IconSelector;

/**
 * 图标选择器输入框组件
 * 在表单中使用
 */
export const IconSelectInput = ({ value, onChange, placeholder = '点击选择图标' }) => {
  const [visible, setVisible] = useState(false);
  const IconComponent = value ? Icons[value] : null;

  return (
    <div className="icon-select-input">
      <Input
        value={value || ''}
        placeholder={placeholder}
        readOnly
        onClick={() => setVisible(true)}
        prefix={IconComponent ? <IconComponent style={{ fontSize: 16 }} /> : null}
        suffix={
          <span
            className="ant-input-suffix-icon"
            onClick={() => setVisible(true)}
            style={{ cursor: 'pointer' }}
          >
            🔍
          </span>
        }
      />
      <IconSelector
        visible={visible}
        selectedIcon={value}
        onSelect={(iconName) => {
          onChange?.(iconName);
        }}
        onCancel={() => setVisible(false)}
      />

      <style jsx>{`
        .icon-select-input :global(.ant-input-suffix-icon) {
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};
