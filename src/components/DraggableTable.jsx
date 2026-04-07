import React, { useState } from 'react';
import { Table, Tag, Space, Button } from 'antd';
import { 
  DragDropContext, 
  Droppable, 
  Draggable 
} from '@hello-pangea/dnd';
import { 
  MenuOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import DataForm from './DataForm';

const DraggableTable = ({
  columns = [],
  dataSource = [],
  onEdit,
  onDelete,
  onDragEnd,
  ...rest
}) => {
  const [draggingId, setDraggingId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // 添加拖拽相关列
  const dragColumns = [
    {
      title: '排序',
      dataIndex: 'sort',
      width: 60,
      className: 'drag-visible',
      render: () => <MenuOutlined style={{ cursor: 'move' }} />,
    },
    ...columns,
  ];

  // 添加操作列
  const actionColumn = {
    title: '操作',
    key: 'action',
    width: 150,
    render: (_, record) => (
      <Space size="middle">
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            setEditingRecord(record);
            setFormVisible(true);
          }}
        >
          编辑
        </Button>
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onDelete && onDelete(record)}
        >
          删除
        </Button>
      </Space>
    ),
  };

  dragColumns.push(actionColumn);

  const handleDragEnd = (result) => {
    setDraggingId(null);
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    if (onDragEnd) {
      onDragEnd(result);
    }
  };

  const onDragStart = (initial) => {
    setDraggingId(initial.draggableId);
  };

  const DraggableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
    const Component = restProps.component;
    delete restProps.component;
    
    // 确保使用正确的key，优先使用数据项的id，备选用index
    const rowKey = restProps['data-row-key'];
    const draggableId = rowKey ? rowKey.toString() : index.toString();
    
    return (
      <Draggable 
        key={draggableId} 
        draggableId={draggableId} 
        index={index}
      >
        {(provided, snapshot) => (
          <tr
            ref={provided.innerRef}
            {...restProps}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...style,
              ...provided.draggableProps.style,
            }}
            className={`${className} ${snapshot.isDragging ? 'dragging' : ''}`}
          />
        )}
      </Draggable>
    );
  };

  const DraggableContainer = (props) => (
    <Droppable droppableId="table">
      {(provided) => (
        <tbody 
          {...provided.droppableProps} 
          ref={provided.innerRef} 
          {...props} 
        />
      )}
    </Droppable>
  );

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={onDragStart}>
        <Table
          {...rest}
          columns={dragColumns}
          dataSource={dataSource}
          rowKey="id"  // 添加rowKey属性，指定使用id作为唯一标识
          components={{
            body: {
              wrapper: DraggableContainer,
              row: DraggableBodyRow,
            },
          }}
          pagination={false}
        />
      </DragDropContext>

      <DataForm
        visible={formVisible}
        title={editingRecord ? '编辑' : '新增'}
        fields={[]} // 根据实际需求配置字段
        initialValues={editingRecord || {}}
        onCancel={() => {
          setFormVisible(false);
          setEditingRecord(null);
        }}
        onSubmit={(values) => {
          console.log('提交数据:', values);
          setFormVisible(false);
          setEditingRecord(null);
        }}
      />
    </>
  );
};

export default DraggableTable;