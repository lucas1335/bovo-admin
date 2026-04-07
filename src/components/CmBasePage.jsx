import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Button, Space, Tag, Popconfirm, message } from 'antd';
import { ProTable } from '@ant-design/pro-table';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import apiService from '@api/base';

const CmBasePage = ({
  columns = [],
  dataSource = [],
  loading: externalLoading = false,
  onLoadData,
  onAdd,
  onEdit,
  onDelete,
  onView,
  // 新增API相关属性
  apiEndpoint,
  apiMethod = 'get',             // API 请求方法：'get' 或 'post'
  onSave,
  onUpdate,
  extraParams = {},              // 额外的固定参数（用于过滤等）
  // 搜索配置
  searchVisible = true,          // 是否显示搜索区域
  searchFieldList = [],          // 搜索字段配置列表
  // 操作按钮配置
  actionButtons = {
    view: true,                  // 是否显示查看按钮
    edit: true,                  // 是否显示编辑按钮
    delete: true,                // 是否显示删除按钮
  },
  // 工具栏自定义按钮
  toolBarExtraButtons = [],      // 额外的工具栏按钮
  actionRef: externalActionRef,  // 外部传入的 actionRef
  // 树形表格配置 (使用 expandable 属性)
  expandable,                    // expandable 配置对象
  ...rest
}) => {
  // 内部 loading 状态
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;
  // 动态生成操作列配置
  const actionColumnConfig = useMemo(() => {
    const buttons = [];

    // 查看按钮
    if (actionButtons.view) {
      buttons.push(
        <Button
          type="link"
          key="view"
          icon={<EyeOutlined />}
          onClick={() => console.log('View', 'record')}
        >
          查看
        </Button>
      );
    }

    // 编辑按钮
    if (actionButtons.edit) {
      buttons.push(
        <Button
          type="link"
          key="edit"
          icon={<EditOutlined />}
          onClick={() => onEdit && onEdit('record')}
        >
          编辑
        </Button>
      );
    }

    // 删除按钮
    if (actionButtons.delete) {
      buttons.push(
        <Popconfirm
          key="delete"
          title="删除确认"
          description="确定要删除这条数据吗？"
          onConfirm={() => onDelete && onDelete('record')}
          okText="确定"
          cancelText="取消"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Popconfirm>
      );
    }

    // 计算操作列宽度
    const buttonCount = buttons.length;
    const width = buttonCount * 80;

    return {
      title: (
        <div style={{ textAlign: 'center' }}>
          操作
        </div>
      ),
      key: 'action',
      valueType: 'option',
      fixed: 'right',
      width: width,
      render: (_, record) => {
        // 根据配置动态渲染按钮
        const renderedButtons = [];

        if (actionButtons.view) {
          renderedButtons.push(
            <Button
              type="link"
              key="view"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView && onView(record)}
            >
              查看
            </Button>
          );
        }

        if (actionButtons.edit) {
          renderedButtons.push(
            <Button
              type="link"
              key="edit"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit && onEdit(record)}
              style={{ color: '#faad14' }}
            >
              编辑
            </Button>
          );
        }

        if (actionButtons.delete) {
          renderedButtons.push(
            <Popconfirm
              key="delete"
              title="删除确认"
              description="确定要删除这条数据吗？"
              onConfirm={() => onDelete && onDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          );
        }

        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Space size="small">{renderedButtons}</Space>
          </div>
        );
      },
    };
  }, [actionButtons, onEdit, onDelete]);

  // 使用外部传入的 actionRef 或创建内部的
  const internalActionRef = useRef();
  const actionRef = externalActionRef || internalActionRef;

  // 添加刷新事件监听
  useEffect(() => {
    const handleReload = () => {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    };

    const tableContainer = document.querySelector('.ant-pro-table')?.parentNode;
    if (tableContainer) {
      tableContainer.addEventListener('reload', handleReload);
    }

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener('reload', handleReload);
      }
    };
  }, []);

  // 处理列配置，添加排序功能和对齐方式
  const processColumns = (cols) => {
    return cols.map(column => {
      // 操作列不处理排序
      if (column.key === 'action') {
        return {
          ...column,
          align: 'center', // 操作列始终居中
        };
      }

      // 处理普通列
      const align = column.align || 'center'; // 默认居中

      return {
        ...column,
        // 默认不排序，只有在 column 中明确设置 sorter: true 时才启用排序
        sorter: column.sorter || false,
        // 列内容的对齐方式
        align: align,
        // 表头始终居中（如果设置了自定义 align）
        ...(align !== 'center' && column.title && typeof column.title === 'string' ? {
          title: <div style={{ textAlign: 'center', width: '100%' }}>{column.title}</div>
        } : {}),
      };
    });
  };

  // 获取用于筛选的列配置
  const getSearchColumns = () => {
    if (!searchVisible || !searchFieldList || searchFieldList.length === 0) {
      return [];
    }

    return searchFieldList.map(field => {
      const { type, key, options, title, dataIndex } = field;
      let valueType = 'text';
      let fieldProps = {};

      // 根据类型设置valueType和fieldProps
      switch (type) {
        case 'date':
          valueType = 'date';
          break;
        case 'dateTime':
          valueType = 'dateTime';
          break;
        case 'select':
          valueType = 'select';
          fieldProps = { options: options || [] };
          break;
        case 'digit':
          valueType = 'digit';
          break;
        case 'text':
        default:
          valueType = 'text';
          break;
      }

      return {
        title: title || dataIndex,
        // 使用 key 作为表单字段名（例如 SEARCH_LIKE_roleName）
        dataIndex: key || dataIndex,
        valueType,
        fieldProps,
        key: key || dataIndex,
      };
    });
  };

  // 如果没有传入操作列，则添加默认操作列
  const tableColumns = processColumns(columns);
  const searchColumns = getSearchColumns();
  if (!columns.some(col => col.key === 'action')) {
    tableColumns.push(actionColumnConfig);
  }

  // 清理树形数据中的空 children 字段（避免显示无用的展开按钮）
  const cleanTreeData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
      const newItem = { ...item };
      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        newItem.children = cleanTreeData(item.children);
      } else {
        // 移除空的 children 属性，这样 Ant Design 不会显示展开按钮
        delete newItem.children;
      }
      return newItem;
    });
  };

  // 处理从API获取数据
  const handleRequest = async (params, sorter, filter) => {
    console.log('Table request params:', params);
    console.log('Table sorter:', sorter);
    console.log('Table filter:', filter);

    // 如果提供了onLoadData回调，则使用它
    if (onLoadData) {
      setInternalLoading(true);
      try {
        const result = await onLoadData(params, sorter, filter);
        setInternalLoading(false);

        // 如果是树形表格，清理空的 children 字段
        if (expandable && result.data) {
          return {
            ...result,
            data: cleanTreeData(result.data)
          };
        }
        return result;
      } catch (error) {
        setInternalLoading(false);
        throw error;
      }
    }

    // 如果提供了apiEndpoint，则使用API获取数据
    if (apiEndpoint) {
      setInternalLoading(true);
      try {
        // 处理排序参数
        let orderParam = {};
        if (sorter && Object.keys(sorter).length > 0) {
          Object.keys(sorter).forEach(sortField => {
            const sortOrder = sorter[sortField];
            if (sortOrder) {
              // 转换排序顺序：ascend -> true(升序), descend -> false(降序)
              orderParam[sortField] = sortOrder === 'ascend';
            }
          });
        }

        // 处理搜索参数 - 构建 searchParam 对象
        const searchParam = {};

        // 先合并 extraParams（固定参数，如分类ID等）
        if (extraParams && Object.keys(extraParams).length > 0) {
          Object.assign(searchParam, extraParams);
        }

        // 再合并用户搜索的参数
        if (searchFieldList && searchFieldList.length > 0) {
          searchFieldList.forEach(field => {
            const { key, dataIndex } = field;
            // 使用 key 作为表单字段名（例如 SEARCH_LIKE_roleName）
            const fieldName = key || dataIndex;
            const searchKey = field.searchKey || key || fieldName;

            // 如果params中有对应的字段值且不为空，则添加到 searchParam 中
            if (params[fieldName] !== undefined && params[fieldName] !== null && params[fieldName] !== '') {
              searchParam[searchKey] = params[fieldName];
            }
          });
        }

        // 构造请求参数
        const requestParams = {
          pageNum: params.current || 1,
          pageSize: params.pageSize || 10,
          searchParam: JSON.stringify(searchParam),
          ...orderParam
        };

        console.log('Fetching data from API:', apiEndpoint, requestParams, 'Method:', apiMethod);

        let response;
        // 根据 apiMethod 选择请求方法
        if (apiMethod === 'post') {
          // POST 请求：参数直接作为 data 传递（会被自动转换为 form-data）
          response = await apiService.post(apiEndpoint, requestParams);
        } else {
          // GET 请求：参数通过 params 传递（作为 query string）
          response = await apiService.get(apiEndpoint, { params: requestParams });
        }

        console.log('API Response:', response);

        setInternalLoading(false);

        if (response.code === 0 || response.code === 200) {
          // 后端返回格式：{ total: 260, rows: [], code: 200, msg: "查询成功" }
          // data字段在根级别，不是response.data
          return {
            data: response.rows || response.data?.records || response.data?.list || response.data?.content || response.data || [],
            success: true,
            total: response.total || response.data?.total || response.data?.length || 0
          };
        } else {
          message.error(response.msg || response.message || '获取数据失败');
          return {
            data: [],
            success: false,
            total: 0
          };
        }
      } catch (error) {
        setInternalLoading(false);
        message.error('获取数据失败: ' + error.message);
        return {
          data: [],
          success: false,
          total: 0
        };
      }
    }

    // 默认返回
    return {
      data: dataSource,
      success: true,
      total: dataSource.length
    };
  };

  return (
    <ProTable
      actionRef={actionRef}
      columns={tableColumns}
      request={handleRequest}
      loading={loading}
      rowKey="id"
      search={searchVisible ? {
        labelWidth: 'auto',
        // 使用 searchFieldList 配置的搜索字段
        columns: searchColumns,
        // 自定义搜索表单操作按钮
        optionRender: (_searchConfig, _formProps, dom) => [
          ...dom.map((btn, index) => {
            // ProTable 默认：第一个是重置，第二个是查询
            // 我们需要交换顺序并调整样式
            if (index ===1) {
              // 第一个是重置按钮 -> 改为查询按钮
              return React.cloneElement(btn, {
                key: 'search',
                type: 'primary',
                icon: <SearchOutlined />,
                children: '查询'
              });
            } else if (index === 0) {
              // 第二个是查询按钮 -> 改为重置按钮
              return React.cloneElement(btn, {
                key: 'reset',
                icon: <ReloadOutlined />,
                children: '重置'
              });
            }
            return btn;
          }).reverse(), // 反转数组，查询在前，重置在后
        ],
      } : false}
      pagination={{
        defaultPageSize: 10,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
      }}
      tableLayout="fixed"
      scroll={{ x: 'max-content' }}
      dateFormatter="string"
      headerTitle="数据列表"
      toolBarRender={() => {
        const buttons = [];

        // 新增按钮（默认）
        if (onAdd) {
          buttons.push(
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={onAdd}
            >
              新增
            </Button>
          );
        }

        // 自定义工具栏按钮
        if (toolBarExtraButtons && toolBarExtraButtons.length > 0) {
          buttons.push(...toolBarExtraButtons);
        }

        return buttons;
      }}
      options={{
        density: true,
        fullScreen: true,
        setting: true,
      }}
      // 树形表格支持
      expandable={expandable}
      {...rest}
    />
  );
};

export default CmBasePage;