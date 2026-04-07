import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Modal, Drawer } from 'antd';
import { DownloadOutlined, CopyOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import './index.less';

const BuildPage = () => {
  const [drawingList, setDrawingList] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeData, setActiveData] = useState({});
  const [dialogVisible, setDialogVisible] = useState(false);
  const [showFileName, setShowFileName] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [operationType, setOperationType] = useState('');
  const [idGlobal, setIdGlobal] = useState(100);
  const copyNodeRef = useRef(null);

  // 组件配置
  const inputComponents = [
    { label: '单行文本', tagIcon: 'input', tag: 'el-input' },
    { label: '多行文本', tagIcon: 'textarea', tag: 'el-input[type="textarea"]' },
    { label: '数字输入', tagIcon: 'number', tag: 'el-input-number' },
  ];

  const selectComponents = [
    { label: '下拉选择', tagIcon: 'select', tag: 'el-select' },
    { label: '单选框', tagIcon: 'radio', tag: 'el-radio' },
    { label: '复选框', tagIcon: 'checkbox', tag: 'el-checkbox' },
  ];

  const layoutComponents = [
    { label: '行布局', tagIcon: 'row', layout: 'rowFormItem' },
  ];

  const formConf = {
    formRef: 'elForm',
    formModel: 'formData',
    size: 'medium',
    labelPosition: 'right',
    labelWidth: 100,
    formRules: 'rules',
    gutter: 15,
    disabled: false,
    span: 24,
    formBtns: true,
  };

  useEffect(() => {
    // 防止firefox下拖拽会新打开一个选项卡
    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
  }, []);

  const cloneComponent = (origin) => {
    const clone = JSON.parse(JSON.stringify(origin));
    setIdGlobal(prev => prev + 1);
    clone.formId = idGlobal + 1;
    clone.span = formConf.span;
    clone.renderKey = +new Date();
    if (!clone.layout) clone.layout = 'colFormItem';
    if (clone.layout === 'colFormItem') {
      clone.vModel = `field${idGlobal + 1}`;
      clone.placeholder !== undefined && (clone.placeholder += clone.label);
    } else if (clone.layout === 'rowFormItem') {
      delete clone.label;
      clone.componentName = `row${idGlobal + 1}`;
      clone.gutter = formConf.gutter;
    }
    return clone;
  };

  const addComponent = (item) => {
    const clone = cloneComponent(item);
    setDrawingList([...drawingList, clone]);
    setActiveFormItem(clone);
  };

  const activeFormItem = (element) => {
    setActiveData(element);
    setActiveId(element.formId);
  };

  const drawingItemCopy = (item, index) => {
    let clone = JSON.parse(JSON.stringify(item));
    clone = createIdAndKey(clone);
    const newList = [...drawingList];
    newList.splice(index + 1, 0, clone);
    setDrawingList(newList);
    activeFormItem(clone);
  };

  const drawingItemDelete = (index) => {
    const newList = drawingList.filter((_, i) => i !== index);
    setDrawingList(newList);
    if (newList.length > 0) {
      activeFormItem(newList[newList.length - 1]);
    }
  };

  const createIdAndKey = (item) => {
    setIdGlobal(prev => prev + 1);
    item.formId = idGlobal + 1;
    item.renderKey = +new Date();
    if (item.layout === 'colFormItem') {
      item.vModel = `field${idGlobal + 1}`;
    } else if (item.layout === 'rowFormItem') {
      item.componentName = `row${idGlobal + 1}`;
    }
    if (Array.isArray(item.children)) {
      item.children = item.children.map(childItem => createIdAndKey(childItem));
    }
    return item;
  };

  const empty = () => {
    Modal.confirm({
      title: '提示',
      content: '确定要清空所有组件吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setDrawingList([]);
      },
    });
  };

  const download = () => {
    setDialogVisible(true);
    setShowFileName(true);
    setOperationType('download');
  };

  const copy = () => {
    setDialogVisible(true);
    setShowFileName(false);
    setOperationType('copy');
  };

  const generate = (data) => {
    const func = execFunctions[operationType];
    func && func(data);
    setDialogVisible(false);
  };

  const execDownload = (data) => {
    // 实现下载逻辑
    message.success('代码已生成');
  };

  const execCopy = (data) => {
    // 实现复制逻辑
    if (copyNodeRef.current) {
      copyNodeRef.current.click();
    }
  };

  const execFunctions = {
    download: execDownload,
    copy: execCopy,
  };

  return (
    <div className="container">
      <div className="left-board">
        <div className="logo-wrapper">
          <div className="logo">
            <DragOutlined /> Form Generator
          </div>
        </div>
        <div className="left-scrollbar">
          <div className="components-list">
            <div className="components-title">输入型组件</div>
            <div className="components-draggable">
              {inputComponents.map((element, index) => (
                <div
                  key={index}
                  className="components-item"
                  onClick={() => addComponent(element)}
                >
                  <div className="components-body">
                    <span className="icon">{element.tagIcon}</span>
                    {element.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="components-title">选择型组件</div>
            <div className="components-draggable">
              {selectComponents.map((element, index) => (
                <div
                  key={index}
                  className="components-item"
                  onClick={() => addComponent(element)}
                >
                  <div className="components-body">
                    <span className="icon">{element.tagIcon}</span>
                    {element.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="components-title">布局型组件</div>
            <div className="components-draggable">
              {layoutComponents.map((element, index) => (
                <div
                  key={index}
                  className="components-item"
                  onClick={() => addComponent(element)}
                >
                  <div className="components-body">
                    <span className="icon">{element.tagIcon}</span>
                    {element.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="center-board">
        <div className="action-bar">
          <Button type="link" icon={<DownloadOutlined />} onClick={download}>
            导出vue文件
          </Button>
          <Button type="link" icon={<CopyOutlined />} onClick={copy}>
            复制代码
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={empty}>
            清空
          </Button>
        </div>
        <div className="center-scrollbar">
          <div className="drawing-board">
            {drawingList.length === 0 ? (
              <div className="empty-info">从左侧拖入或点选组件进行表单设计</div>
            ) : (
              drawingList.map((element, index) => (
                <div
                  key={element.renderKey}
                  className={`drawing-item ${activeId === element.formId ? 'active-from-item' : ''}`}
                  onClick={() => activeFormItem(element)}
                >
                  <div className="drawing-item-content">
                    <span>{element.label}</span>
                    <Button
                      type="text"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        drawingItemCopy(element, index);
                      }}
                    >
                      复制
                    </Button>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        drawingItemDelete(index);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Drawer
        title="组件配置"
        placement="right"
        width={350}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <div>
          <p>组件类型: {activeData.tag}</p>
          <p>组件标签: {activeData.label}</p>
        </div>
      </Drawer>

      <Modal
        title="选择生成类型"
        open={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        onOk={() => generate({ fileName: 'form.vue' })}
      >
        <p>{showFileName ? '请输入文件名' : '确认生成代码？'}</p>
      </Modal>

      <input
        ref={copyNodeRef}
        type="hidden"
        id="copyNode"
      />
    </div>
  );
};

export default BuildPage;
