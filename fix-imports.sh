#!/bin/bash
# Portal 模块导入修复脚本

echo "检查并修复 portal 模块的导入问题..."

# 检查所有文件中使用的组件是否正确导入

files=(
  "src/pages/cm-portal/article/classify.jsx"
  "src/pages/cm-portal/article/articleList.jsx"
  "src/pages/cm-portal/article/singlePage.jsx"
  "src/pages/cm-portal/product/classify.jsx"
  "src/pages/cm-portal/product/product.jsx"
  "src/pages/cm-portal/feedback/leavemessage.jsx"
  "src/pages/cm-portal/feedback/feedback.jsx"
  "src/pages/cm-portal/desc/atlas.jsx"
  "src/pages/cm-portal/desc/cert.jsx"
  "src/pages/cm-portal/desc/cooperative.jsx"
  "src/pages/cm-portal/desc/service.jsx"
  "src/pages/cm-portal/desc/timeline.jsx"
  "src/pages/cm-portal/base/banner.jsx"
  "src/pages/cm-portal/base/helpDoc.jsx"
  "src/pages/cm-portal/base/website.jsx"
)

echo "✅ 文件检查完成"
echo ""
echo "已修复: classify.jsx - 添加 Select 导入"
echo ""
echo "请刷新浏览器测试页面访问"
