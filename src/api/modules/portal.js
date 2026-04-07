import apiService from '../base';

// ==================== 基础模块 - Banner轮播 ====================

/**
 * 获取Banner列表
 */
export const getPBannerInfoList = (params) => apiService.get('/pBannerInfo/getList', { params });

/**
 * 新增Banner
 */
export const savePBannerInfo = (data) => apiService.post('/pBannerInfo/save', data);

/**
 * 更新Banner
 */
export const updatePBannerInfo = (data) => apiService.post('/pBannerInfo/update', data);

/**
 * 删除Banner
 */
export const deletePBannerInfo = (params) => apiService.post('/pBannerInfo/delete', params);

// ==================== 基础模块 - 帮助文档/新闻资讯 ====================

/**
 * 获取帮助文档列表
 */
export const getPHelpDocList = (params) => apiService.get('/pHelpDoc/getList', { params });

/**
 * 新增帮助文档
 */
export const savePHelpDoc = (data) => apiService.post('/pHelpDoc/save', data);

/**
 * 更新帮助文档
 */
export const updatePHelpDoc = (data) => apiService.post('/pHelpDoc/update', data);

/**
 * 删除帮助文档
 */
export const deletePHelpDoc = (params) => apiService.post('/pHelpDoc/delete', params);

// ==================== 基础模块 - 网站信息 ====================

/**
 * 获取网站信息列表
 */
export const getPWebsiteInfoList = (params) => apiService.get('/pWebsiteInfo/getList', { params });

/**
 * 新增网站信息
 */
export const savePWebsiteInfo = (data) => apiService.post('/pWebsiteInfo/save', data);

/**
 * 更新网站信息
 */
export const updatePWebsiteInfo = (data) => apiService.post('/pWebsiteInfo/update', data);

/**
 * 删除网站信息
 */
export const deletePWebsiteInfo = (params) => apiService.post('/pWebsiteInfo/delete', params);

// ==================== 文章模块 - 文章分类 ====================

/**
 * 获取文章分类列表（树形）
 */
export const getPArticleCategoryList = (params) => apiService.get('/pArticleCategory/getList', { params });

/**
 * 新增文章分类
 */
export const savePArticleCategory = (data) => apiService.post('/pArticleCategory/save', data);

/**
 * 更新文章分类
 */
export const updatePArticleCategory = (data) => apiService.post('/pArticleCategory/update', data);

/**
 * 删除文章分类
 */
export const deletePArticleCategory = (params) => apiService.post('/pArticleCategory/delete', params);

// ==================== 文章模块 - 新闻资讯 ====================

/**
 * 获取新闻资讯列表
 */
export const getPArticleInfoList = (params) => apiService.get('/pArticleInfo/getList', { params });

/**
 * 新增新闻资讯
 */
export const savePArticleInfo = (data) => apiService.post('/pArticleInfo/save', data);

/**
 * 更新新闻资讯
 */
export const updatePArticleInfo = (data) => apiService.post('/pArticleInfo/update', data);

/**
 * 删除新闻资讯
 */
export const deletePArticleInfo = (params) => apiService.post('/pArticleInfo/delete', params);

// ==================== 文章模块 - 单页文章 ====================

/**
 * 获取单页文章列表
 */
export const getPSingleArticleList = (params) => apiService.get('/pSingleArticle/getList', { params });

/**
 * 新增单页文章
 */
export const savePSingleArticle = (data) => apiService.post('/pSingleArticle/save', data);

/**
 * 更新单页文章
 */
export const updatePSingleArticle = (data) => apiService.post('/pSingleArticle/update', data);

/**
 * 删除单页文章
 */
export const deletePSingleArticle = (params) => apiService.post('/pSingleArticle/delete', params);

// ==================== 产品模块 - 产品分类 ====================

/**
 * 获取产品分类列表
 */
export const getQProductCategoryList = (params) => apiService.get('/qProductCategory/getList', { params });

/**
 * 新增产品分类
 */
export const saveQProductCategory = (data) => apiService.post('/qProductCategory/save', data);

/**
 * 更新产品分类
 */
export const updateQProductCategory = (data) => apiService.post('/qProductCategory/update', data);

/**
 * 删除产品分类
 */
export const deleteQProductCategory = (params) => apiService.post('/qProductCategory/delete', params);

// ==================== 产品模块 - 产品信息 ====================

/**
 * 获取产品信息列表
 */
export const getQProductInfoList = (params) => apiService.get('/qProductInfo/getList', { params });

/**
 * 新增产品信息
 */
export const saveQProductInfo = (data) => apiService.post('/qProductInfo/save', data);

/**
 * 更新产品信息
 */
export const updateQProductInfo = (data) => apiService.post('/qProductInfo/update', data);

/**
 * 删除产品信息
 */
export const deleteQProductInfo = (params) => apiService.post('/qProductInfo/delete', params);

// ==================== 产品模块 - 模块配置 ====================

/**
 * 获取模块配置列表
 */
export const getPModuleConfigList = (params) => apiService.get('/pModuleConfig/getList', { params });

/**
 * 新增模块配置
 */
export const savePModuleConfig = (data) => apiService.post('/pModuleConfig/save', data);

/**
 * 更新模块配置
 */
export const updatePModuleConfig = (data) => apiService.post('/pModuleConfig/update', data);

/**
 * 删除模块配置
 */
export const deletePModuleConfig = (params) => apiService.post('/pModuleConfig/delete', params);

// ==================== 产品模块 - 模块规则配置 ====================

/**
 * 获取模块规则配置列表
 */
export const getPModuleRuleList = (params) => apiService.get('/pModuleRule/getList', { params });

/**
 * 新增模块规则配置
 */
export const savePModuleRule = (data) => apiService.post('/pModuleRule/save', data);

/**
 * 更新模块规则配置
 */
export const updatePModuleRule = (data) => apiService.post('/pModuleRule/update', data);

/**
 * 删除模块规则配置
 */
export const deletePModuleRule = (params) => apiService.post('/pModuleRule/delete', params);

// ==================== 模块配置数据 ====================

/**
 * 获取模块配置数据列表
 */
export const getPModuleConfigDataList = (params) => apiService.get('/pModuleConfigData/getList', { params });

/**
 * 获取模块配置数据详情
 */
export const getPModuleConfigData = (params) => apiService.get('/pModuleConfigData/getDetail', { params });

/**
 * 新增模块配置数据
 */
export const savePModuleConfigData = (data) => apiService.post('/pModuleConfigData/save', data);

/**
 * 更新模块配置数据
 */
export const updatePModuleConfigData = (data) => apiService.post('/pModuleConfigData/update', data);

/**
 * 删除模块配置数据
 */
export const deletePModuleConfigData = (params) => apiService.post('/pModuleConfigData/delete', params);

// ==================== 反馈模块 - 留言信息 ====================

/**
 * 获取留言信息列表
 */
export const getQLeaveMessageList = (params) => apiService.get('/qLeaveMessage/getList', { params });

/**
 * 新增留言信息
 */
export const saveQLeaveMessage = (data) => apiService.post('/qLeaveMessage/save', data);

/**
 * 更新留言信息
 */
export const updateQLeaveMessage = (data) => apiService.post('/qLeaveMessage/update', data);

/**
 * 删除留言信息
 */
export const deleteQLeaveMessage = (params) => apiService.post('/qLeaveMessage/delete', params);

// ==================== 反馈模块 - 反馈信息 ====================

/**
 * 获取反馈信息列表
 */
export const getQFeedbackList = (params) => apiService.get('/qFeedback/getList', { params });

/**
 * 新增反馈信息
 */
export const saveQFeedback = (data) => apiService.post('/qFeedback/save', data);

/**
 * 更新反馈信息
 */
export const updateQFeedback = (data) => apiService.post('/qFeedback/update', data);

/**
 * 删除反馈信息
 */
export const deleteQFeedback = (params) => apiService.post('/qFeedback/delete', params);

// ==================== 描述模块 - 图集信息 ====================

/**
 * 获取图集信息列表
 */
export const getQAtlasList = (params) => apiService.get('/qAtlas/getList', { params });

/**
 * 新增图集信息
 */
export const saveQAtlas = (data) => apiService.post('/qAtlas/save', data);

/**
 * 更新图集信息
 */
export const updateQAtlas = (data) => apiService.post('/qAtlas/update', data);

/**
 * 删除图集信息
 */
export const deleteQAtlas = (params) => apiService.post('/qAtlas/delete', params);

// ==================== 描述模块 - 证书信息 ====================

/**
 * 获取证书信息列表
 */
export const getQCertList = (params) => apiService.get('/qCert/getList', { params });

/**
 * 新增证书信息
 */
export const saveQCert = (data) => apiService.post('/qCert/save', data);

/**
 * 更新证书信息
 */
export const updateQCert = (data) => apiService.post('/qCert/update', data);

/**
 * 删除证书信息
 */
export const deleteQCert = (params) => apiService.post('/qCert/delete', params);

// ==================== 描述模块 - 合作企业分类 ====================

/**
 * 获取合作企业分类列表
 */
export const getPCooperativeCategoryList = (params) => apiService.get('/pCooperativeCategory/getList', { params });

/**
 * 新增合作企业分类
 */
export const savePCooperativeCategory = (data) => apiService.post('/pCooperativeCategory/save', data);

/**
 * 更新合作企业分类
 */
export const updatePCooperativeCategory = (data) => apiService.post('/pCooperativeCategory/update', data);

/**
 * 删除合作企业分类
 */
export const deletePCooperativeCategory = (params) => apiService.post('/pCooperativeCategory/delete', params);

// ==================== 描述模块 - 合作企业 ====================

/**
 * 获取合作企业列表
 */
export const getPCooperativeList = (params) => apiService.get('/pCooperative/getList', { params });

/**
 * 新增合作企业
 */
export const savePCooperative = (data) => apiService.post('/pCooperative/save', data);

/**
 * 更新合作企业
 */
export const updatePCooperative = (data) => apiService.post('/pCooperative/update', data);

/**
 * 删除合作企业
 */
export const deletePCooperative = (params) => apiService.post('/pCooperative/delete', params);

// ==================== 描述模块 - 服务类型 ====================

/**
 * 获取服务类型列表
 */
export const getQServiceCategoryList = (params) => apiService.get('/qServiceCategory/getList', { params });

/**
 * 新增服务类型
 */
export const saveQServiceCategory = (data) => apiService.post('/qServiceCategory/save', data);

/**
 * 更新服务类型
 */
export const updateQServiceCategory = (data) => apiService.post('/qServiceCategory/update', data);

/**
 * 删除服务类型
 */
export const deleteQServiceCategory = (params) => apiService.post('/qServiceCategory/delete', params);

// ==================== 描述模块 - 时间轴信息 ====================

/**
 * 获取时间轴信息列表
 */
export const getQTimeLineList = (params) => apiService.get('/qTimeLine/getList', { params });

/**
 * 新增时间轴信息
 */
export const saveQTimeLine = (data) => apiService.post('/qTimeLine/save', data);

/**
 * 更新时间轴信息
 */
export const updateQTimeLine = (data) => apiService.post('/qTimeLine/update', data);

/**
 * 删除时间轴信息
 */
export const deleteQTimeLine = (params) => apiService.post('/qTimeLine/delete', params);

// ==================== 导航菜单 ====================

/**
 * 获取导航菜单树列表
 */
export const getPNavMenuList = (params) => apiService.get('/pNavMenu/getList', { params });

/**
 * 分页查询导航菜单
 */
export const getPNavMenuPageList = (params) => apiService.get('/pNavMenu/getPageList', { params });

/**
 * 新增导航菜单
 */
export const savePNavMenu = (data) => apiService.post('/pNavMenu/save', data);

/**
 * 修改导航菜单
 */
export const updatePNavMenu = (data) => apiService.post('/pNavMenu/update', data);

/**
 * 删除导航菜单
 */
export const deletePNavMenu = (params) => apiService.post('/pNavMenu/delete', params);

// ==================== 视频模块 - 视频分类 ====================

/**
 * 获取视频分类列表（树形）
 */
export const getPVideoCategoryList = (params) => apiService.get('/pVideoCategory/getList', { params });

/**
 * 新增视频分类
 */
export const savePVideoCategory = (data) => apiService.post('/pVideoCategory/save', data);

/**
 * 更新视频分类
 */
export const updatePVideoCategory = (data) => apiService.post('/pVideoCategory/update', data);

/**
 * 删除视频分类
 */
export const deletePVideoCategory = (params) => apiService.post('/pVideoCategory/delete', params);

// ==================== 视频模块 - 视频信息 ====================

/**
 * 获取视频信息列表
 */
export const getPVideoInfoList = (params) => apiService.get('/pVideoInfo/getList', { params });

/**
 * 新增视频信息
 */
export const savePVideoInfo = (data) => apiService.post('/pVideoInfo/save', data);

/**
 * 更新视频信息
 */
export const updatePVideoInfo = (data) => apiService.post('/pVideoInfo/update', data);

/**
 * 删除视频信息
 */
export const deletePVideoInfo = (params) => apiService.post('/pVideoInfo/delete', params);

// ==================== 招聘模块 - 招聘信息 ====================

/**
 * 获取招聘信息列表
 */
export const getPRecruitmentInfoList = (params) => apiService.get('/pRecruitmentInfo/getList', { params });

/**
 * 新增招聘信息
 */
export const savePRecruitmentInfo = (data) => apiService.post('/pRecruitmentInfo/save', data);

/**
 * 更新招聘信息
 */
export const updatePRecruitmentInfo = (data) => apiService.post('/pRecruitmentInfo/update', data);

/**
 * 删除招聘信息
 */
export const deletePRecruitmentInfo = (params) => apiService.post('/pRecruitmentInfo/delete', params);
