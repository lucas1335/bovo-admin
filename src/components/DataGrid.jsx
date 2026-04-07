import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Select, Row, Col, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const DataGrid = ({
  title = '数据列表',
  columns = [],
  dataSource = [],
  loading = false,
  showSearch = true,
  showAdd = true,
  showEdit = true,
  showDelete = true,
  showRefresh = true,
  searchFields = [],
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
  onSearch,
  addButtonText = '新增',
  titleLevel = 4,
  rowKey = 'id',
  pagination = {
    total: 0,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  }
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchField, setSearchField] = useState(searchFields[0]?.value || '');

  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(searchField, value);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // 添加操作列
  const finalColumns = [...columns];
  if (showEdit || showDelete) {
    finalColumns.push({
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {showEdit && (
            <Button
              type="link"
              size="small"
              onClick={() => onEdit && onEdit(record)}
            >
              编辑
            </Button>
          )}
          {showDelete && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => onDelete && onDelete(record)}
            >
              删除
            </Button>
          )}
        </Space>
      ),
    });
  }

  return (
    <Card>
      {/* <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <Title level={titleLevel} style={{ margin: 0 }}>{title}</Title>
        </Col>
      </Row> */}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {showAdd && (
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAdd}
            >
              {addButtonText}
            </Button>
          </Col>
        )}
        
        {showRefresh && (
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </Col>
        )}

        {showSearch && searchFields.length > 0 && (
          <Col flex="auto">
            <Space>
              <Select
                value={searchField}
                onChange={setSearchField}
                style={{ width: 120 }}
              >
                {searchFields.map(field => (
                  <Option key={field.value} value={field.value}>
                    {field.label}
                  </Option>
                ))}
              </Select>
              <Search
                placeholder="请输入搜索关键词"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onSearch={handleSearch}
                style={{ width: 300 }}
                allowClear
              />
            </Space>
          </Col>
        )}
      </Row>

      <Table
        columns={finalColumns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
      />
    </Card>
  );
};

export default DataGrid; 