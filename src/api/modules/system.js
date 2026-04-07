import apiService from '../base';

// ==================== 用户管理 ====================

/**
 * 获取系统用户列表（标准接口，对应旧项目 /system/user/list）
 */
export const listSysUser = (params) => apiService.get('/system/user/list', { params });

/**
 * 获取系统用户详情（标准接口，对应旧项目 /system/user/getInfo/{userId}）
 */
export const getSysUser = (userId) => apiService.get(`/system/user/getInfo/${userId}`);

/**
 * 新增系统用户（标准接口，对应旧项目 /system/user POST）
 */
export const addSysUser = (data) => apiService.post('/system/user', data);

/**
 * 修改系统用户（标准接口，对应旧项目 /system/user PUT）
 */
export const updateSysUser = (data) => apiService.put('/system/user', data);

/**
 * 删除系统用户（标准接口，对应旧项目 /system/user/{userId} DELETE）
 */
export const delSysUser = (userId) => apiService.delete(`/system/user/${userId}`);

/**
 * 重置系统用户密码
 */
export const resetSysUserPwd = (userId, password) => apiService.put('/system/user/resetPwd', { userId, password });

/**
 * 修改系统用户状态
 */
export const changeSysUserStatus = (userId, status) => apiService.put('/system/user/changeStatus', { userId, status });

// ==================== 旧系统用户API（保留兼容性）====================

/**
 * 获取用户列表（旧接口）
 */
export const getSysUserList = (params) => apiService.get('/sysUsers/getList', { params });

/**
 * 获取用户详情（旧接口）
 */
export const getSysUserDetail = (params) => apiService.get('/sysUsers/getUserInfoById', { params });

/**
 * 新增用户（旧接口）
 */
export const saveSysUser = (data) => apiService.post('/sysUsers/save', data);

/**
 * 更新用户（旧接口）
 */
export const updateSysUserOld = (data) => apiService.post('/sysUsers/update', data);

/**
 * 删除用户（旧接口）
 */
export const deleteSysUser = (params) => apiService.post('/sysUsers/delete', params);

/**
 * 获取用户的角色ID列表
 */
export const getSysUserRoleIds = (params) => apiService.get('/sysUsers/getRoleIdsByUserId', { params });

/**
 * 修改用户密码
 */
export const updateSysUserPassword = (params) => apiService.post('/sysUsers/updatePassword', params);

/**
 * 获取角色列表（用于用户表单中的角色选择器）
 */
export const getSysRoleListForUser = (params) => apiService.get('/system/role/list', { params });

// ==================== 角色管理 ====================

/**
 * 获取角色列表
 */
export const getSysRoleList = (params) => apiService.get('/system/role/list', { params });

/**
 * 获取角色详情
 */
export const getSysRoleDetail = (roleId) => apiService.get(`/system/role/${roleId}`);

/**
 * 新增角色
 */
export const saveSysRole = (data) => apiService.post('/system/role', data);

/**
 * 更新角色
 */
export const updateSysRole = (data) => apiService.put('/system/role', data);

/**
 * 删除角色
 */
export const deleteSysRole = (roleId) => apiService.delete(`/system/role/${roleId}`);

/**
 * 获取角色绑定的菜单ID列表
 */
// export const getSysRoleMenuIds = (roleId) => apiService.get(`/system/role/menuIds/${roleId}`);
export const getSysRoleMenuIds = (roleId) => apiService.get(`/system/menu/roleMenuTreeselect/${roleId}`);

/**
 * 更改角色状态
 */
export const changeSysRoleStatus = (roleId, status) => apiService.put('/system/role/changeStatus', { roleId, status });

/**
 * 保存角色数据权限
 */
export const saveSysRoleDataScope = (data) => apiService.put('/system/role/dataScope', data);

/**
 * 获取角色数据权限（部门树）
 */
export const getSysRoleDataScope = (roleId) => apiService.get(`/system/role/deptTree/${roleId}`);

// ==================== 菜单管理 ====================

/**
 * 获取菜单列表（用于菜单管理页面）
 */
export const getSysMenuList = (params) => apiService.get('/system/menu/list', { params });


/**
 * 获取路由菜单树（用于前端路由）
 */
export const getRouters = () => apiService.get('/system/menu/getRouters');

/**
 * 获取菜单详情
 */
export const getSysMenuDetail = (menuId) => apiService.get('/system/menu/' + menuId);

/**
 * 获取菜单下拉树结构
 */
export const getSysMenuTreeSelect = () => apiService.get('/system/menu/treeselect');

/**
 * 获取菜单下拉树结构（别名）
 */
export const getSysMenuTree = getSysMenuTreeSelect;

/**
 * 根据角色ID查询菜单下拉树结构
 */
export const getRoleMenuTreeSelect = (roleId) => apiService.get('/system/menu/roleMenuTreeselect/' + roleId);


// ==================== 字典管理 ====================

/**
 * 获取字典列表
 */
export const getSysDictList = (params) => apiService.get('/sysDict/getList', { params });

/**
 * 获取字典详情
 */
export const getSysDictDetail = (params) => apiService.get('/sysDict/getDetail', { params });

/**
 * 新增字典
 */
export const saveSysDict = (data) => apiService.post('/sysDict/save', data);

/**
 * 更新字典
 */
export const updateSysDict = (data) => apiService.post('/sysDict/update', data);

/**
 * 删除字典
 */
export const deleteSysDict = (params) => apiService.post('/sysDict/delete', params);

/**
 * 获取字典项列表
 */
export const getSysDictItems = (dictCode) => apiService.get(`/sysDict/${dictCode}/items`);

// ==================== 组织管理 ====================

/**
 * 获取组织列表
 */
export const getSysOrganList = (params) => apiService.get('/sysDept/getList', { params });

/**
 * 获取组织树列表
 */
export const getSysOrganTree = (params) => apiService.get('/sysDept/getListTree', { params });

/**
 * 新增组织
 */
export const saveSysOrgan = (data) => apiService.post('/sysDept/save', data);

/**
 * 更新组织
 */
export const updateSysOrgan = (data) => apiService.post('/sysDept/update', data);

/**
 * 删除组织
 */
export const deleteSysOrgan = (params) => apiService.post('/sysDept/delete', params);

// ==================== 系统配置管理 ====================

/**
 * 获取系统配置列表
 */
export const getSysConfigList = (params) => apiService.get('/sysConfig/getList', { params });

/**
 * 新增系统配置
 */
export const saveSysConfig = (data) => apiService.post('/sysConfig/save', data);

/**
 * 更新系统配置
 */
export const updateSysConfig = (data) => apiService.post('/sysConfig/update', data);

/**
 * 删除系统配置
 */
export const deleteSysConfig = (params) => apiService.post('/sysConfig/delete', params);

// ==================== 数据字典管理 ====================

/**
 * 获取数据字典列表
 */
export const getSysDicCodeList = (params) => apiService.get('/sysDicCode/getList', { params });

/**
 * 获取字典值列表（根据字典编码）
 */
export const getSysDicValueListByCode = (params) => apiService.get('/sysDicCode/getValueListByCode', { params });

/**
 * 新增数据字典
 */
export const saveSysDicCode = (data) => apiService.post('/sysDicCode/save', data);

/**
 * 更新数据字典
 */
export const updateSysDicCode = (data) => apiService.post('/sysDicCode/update', data);

/**
 * 删除数据字典
 */
export const deleteSysDicCode = (params) => apiService.post('/sysDicCode/delete', params);

// ==================== 数据字典值管理 ====================

/**
 * 获取数据字典值列表
 */
export const getSysDicValueList = (params) => apiService.get('/sysDicValue/getList', { params });

/**
 * 新增数据字典值
 */
export const saveSysDicValue = (data) => apiService.post('/sysDicValue/save', data);

/**
 * 更新数据字典值
 */
export const updateSysDicValue = (data) => apiService.post('/sysDicValue/update', data);

/**
 * 删除数据字典值
 */
export const deleteSysDicValue = (params) => apiService.post('/sysDicValue/delete', params);

// ==================== 日志管理 ====================

/**
 * 获取日志列表
 */
export const getSysLogList = (params) => apiService.get('/sysLog/getList', { params });

/**
 * 删除日志
 */
export const deleteSysLog = (params) => apiService.post('/sysLog/delete', params);

// ==================== 岗位管理 ====================

/**
 * 获取岗位列表
 */
export const getSysPostList = (params) => apiService.get('/system/post/list', { params });

/**
 * 获取岗位详情
 */
export const getSysPostDetail = (params) => apiService.get('/system/post/' + params.postId);

/**
 * 新增岗位
 */
export const saveSysPost = (data) => apiService.post('/system/post', data);

/**
 * 更新岗位
 */
export const updateSysPost = (data) => apiService.put('/system/post', data);

/**
 * 删除岗位
 */
export const deleteSysPost = (params) => apiService.delete('/system/post/' + params.postId);

// ==================== 部门管理 ====================

/**
 * 获取部门列表（树形）
 */
export const getSysDeptList = (params) => apiService.get('/system/dept/list', { params });

/**
 * 获取部门列表（排除指定节点及其子节点）
 */
export const getSysDeptListExcludeChild = (deptId) => apiService.get('/system/dept/list/exclude/' + deptId);

/**
 * 获取部门详情
 */
export const getSysDeptDetail = (deptId) => apiService.get('/system/dept/' + deptId);

/**
 * 新增部门
 */
export const saveSysDept = (data) => apiService.post('/system/dept', data);

/**
 * 更新部门
 */
export const updateSysDept = (data) => apiService.put('/system/dept', data);

/**
 * 删除部门
 */
export const deleteSysDept = (deptId) => apiService.delete('/system/dept/' + deptId);

// ==================== 字典类型管理 ====================

/**
 * 获取字典类型列表
 */
export const getSysDictTypeList = (params) => apiService.get('/system/dict/type/list', { params });

/**
 * 获取字典类型详情
 */
export const getSysDictTypeDetail = (dictId) => apiService.get(`/system/dict/type/${dictId}`);

/**
 * 新增字典类型
 */
export const saveSysDictType = (data) => apiService.post('/system/dict/type', data);

/**
 * 更新字典类型
 */
export const updateSysDictType = (data) => apiService.put('/system/dict/type', data);

/**
 * 删除字典类型
 */
export const deleteSysDictType = (dictId) => apiService.delete(`/system/dict/type/${dictId}`);

/**
 * 刷新字典缓存
 */
export const refreshSysDictCache = () => apiService.delete('/system/dict/type/refreshCache');

/**
 * 获取字典选择框列表
 */
export const getSysDictTypeOptionSelect = () => apiService.get('/system/dict/type/optionselect');

// ==================== 字典数据管理 ====================

/**
 * 获取字典数据列表
 */
export const getSysDictDataList = (params) => apiService.get('/system/dict/data/list', { params });

/**
 * 获取字典数据详情
 */
export const getSysDictDataDetail = (dictCode) => apiService.get(`/system/dict/data/${dictCode}`);

/**
 * 根据字典类型查询字典数据信息
 */
export const getSysDictDataByType = (dictType) => apiService.get(`/system/dict/data/type/${dictType}`);

/**
 * 新增字典数据
 */
export const saveSysDictData = (data) => apiService.post('/system/dict/data', data);

/**
 * 更新字典数据
 */
export const updateSysDictData = (data) => apiService.put('/system/dict/data', data);

/**
 * 删除字典数据
 */
export const deleteSysDictData = (dictCode) => apiService.delete(`/system/dict/data/${dictCode}`);

// ==================== 用户管理扩展接口 ====================

/**
 * 重置用户密码
 */
export const resetUserPassword = (params) => apiService.put('/system/user/resetPwd', params);

/**
 * 修改用户状态
 */
export const changeUserStatus = (data) => apiService.put('/system/user/changeStatus', data);

/**
 * 查询用户个人信息
 */
export const getUserProfile = () => apiService.get('/system/user/profile');

/**
 * 修改用户个人信息
 */
export const updateUserProfile = (data) => apiService.put('/system/user/profile', data);

/**
 * 用户自己修改密码
 */
export const updateUserPwd = (params) => apiService.put('/system/user/profile/updatePwd', null, { params });

/**
 * 用户头像上传
 */
export const uploadAvatar = (data) => apiService.post('/system/user/profile/avatar', data);

/**
 * 查询授权角色
 */
export const getAuthRole = (userId) => apiService.get(`/system/user/authRole/${userId}`);

/**
 * 保存授权角色
 */
export const updateAuthRole = (params) => apiService.put('/system/user/authRole', null, { params });

/**
 * 查询部门下拉树结构
 */
export const deptTreeSelect = () => apiService.get('/system/user/deptTree');

/**
 * 更新Google Key
 */
export const updateGoogleCode = (params) => apiService.get('/system/user/updateCode', { params });

/**
 * 查询Google Key二维码
 */
export const getGoogleCode = (params) => apiService.get('/system/user/googleCode', { params }, { responseType: 'blob' });

/**
 * 查询可绑定的代理用户列表
 */
export const getAdminUserList = (params) => apiService.get('/system/user/selectAllAgentUser', { params });

/**
 * 绑定代理用户
 */
export const bindActing = (params) => apiService.get('/system/user/bindingAdminUser', { params });

/**
 * 绑定玩家用户
 */
export const bindGameUser = (params) => apiService.get('/system/user/bindingAppUser', { params });

/**
 * 查询可绑定的玩家用户列表
 */
export const getAppUserList = (params) => apiService.get('/asset/appUser/selectUnboundAppUser', { params });

// ==================== 参数配置管理（若依风格） ====================

/**
 * 获取参数配置列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getConfigList = (params) => apiService.get('/system/config/list', { params });

/**
 * 获取参数配置详情
 * @param {string|number} configId - 参数ID
 * @returns {Promise}
 */
export const getConfigDetail = (configId) => apiService.get(`/system/config/${configId}`);

/**
 * 根据参数键名查询参数值
 * @param {string} configKey - 参数键名
 * @returns {Promise}
 */
export const getConfigValueByKey = (configKey) => apiService.get(`/system/config/configKey/${configKey}`);

/**
 * 新增参数配置
 * @param {object} data - 参数数据
 * @returns {Promise}
 */
export const saveConfig = (data) => apiService.post('/system/config', data);

/**
 * 更新参数配置
 * @param {object} data - 参数数据
 * @returns {Promise}
 */
export const updateConfig = (data) => apiService.put('/system/config', data);

/**
 * 删除参数配置
 * @param {string|number} configId - 参数ID
 * @returns {Promise}
 */
export const deleteConfig = (configId) => apiService.delete(`/system/config/${configId}`);

/**
 * 刷新参数缓存
 * @returns {Promise}
 */
export const refreshConfigCache = () => apiService.delete('/system/config/refreshCache');

// ==================== 通知公告管理 ====================

/**
 * 获取通知公告列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getNoticeList = (params) => apiService.get('/system/tNotice/list', { params });

/**
 * 获取通知公告Tab列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getNoticeTabList = (params) => apiService.get('/system/tNotice/noticeTypeList', { params });

/**
 * 获取通知公告详情
 * @param {string|number} noticeId - 公告ID
 * @returns {Promise}
 */
export const getNoticeDetail = (noticeId) => apiService.get(`/system/tNotice/${noticeId}`);

/**
 * 新增通知公告
 * @param {object} data - 公告数据
 * @returns {Promise}
 */
export const saveNotice = (data) => apiService.post('/system/tNotice', data);

/**
 * 更新通知公告
 * @param {object} data - 公告数据
 * @returns {Promise}
 */
export const updateNotice = (data) => apiService.put('/system/tNotice', data);

/**
 * 删除通知公告
 * @param {string|number} noticeId - 公告ID
 * @returns {Promise}
 */
export const deleteNotice = (noticeId) => apiService.delete(`/system/tNotice/${noticeId}`);

// ==================== 在线用户管理 ====================

/**
 * 获取在线用户列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getOnlineList = (params) => apiService.get('/monitor/online/list', { params });

/**
 * 强退用户
 * @param {string} tokenId - 会话ID
 * @returns {Promise}
 */
export const forceLogoutUser = (tokenId) => apiService.delete(`/monitor/online/${tokenId}`);

// ==================== 操作日志管理 ====================

/**
 * 获取操作日志列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getOperLogList = (params) => apiService.get('/monitor/operlog/list', { params });

/**
 * 删除操作日志
 * @param {string|number} operId - 日志ID
 * @returns {Promise}
 */
export const deleteOperLog = (operId) => apiService.delete(`/monitor/operlog/${operId}`);

/**
 * 清空操作日志
 * @returns {Promise}
 */
export const cleanOperLog = () => apiService.delete('/monitor/operlog/clean');

// ==================== 首页统计 ====================

/**
 * 获取首页统计数据
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getStatisticsData = (params) => apiService.get('/asset/system/statistics/platform', { params });

/**
 * 获取系统链接
 * @param {string} key - 链接类型
 * @returns {Promise}
 */
export const getActiveSysLink = (key) => apiService.get(`/system/link/active/${key}`);

// ==================== 站内信管理 ====================

/**
 * 获取站内信列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getMailList = (params) => apiService.get('/system/appMail/list', { params });

/**
 * 新增站内信
 * @param {object} data - 站内信数据
 * @returns {Promise}
 */
export const saveMail = (data) => apiService.post('/system/appMail', data);

/**
 * 删除站内信
 * @param {string|number} id - 站内信ID
 * @returns {Promise}
 */
export const deleteMail = (id) => apiService.delete(`/system/appMail/${id}`);

// ==================== 规则配置管理 ====================

/**
 * 获取规则配置列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getRulesList = (params) => apiService.get('/contract/optionRules/list', { params });

/**
 * 获取规则标签列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getRulesLabelList = (params) => apiService.get('/contract/optionRules/labelList', { params });

/**
 * 获取规则配置详情
 * @param {string|number} id - 规则ID
 * @returns {Promise}
 */
export const getRulesDetail = (id) => apiService.get(`/contract/optionRules/${id}`);

/**
 * 新增规则配置
 * @param {object} data - 规则数据
 * @returns {Promise}
 */
export const saveRules = (data) => apiService.post('/contract/optionRules', data);

/**
 * 更新规则配置
 * @param {object} data - 规则数据
 * @returns {Promise}
 */
export const updateRules = (data) => apiService.put('/contract/optionRules', data);

/**
 * 删除规则配置
 * @param {string|number} id - 规则ID
 * @returns {Promise}
 */
export const deleteRules = (id) => apiService.delete(`/contract/optionRules/${id}`);

// ==================== 规则说明管理 ====================

/**
 * 获取规则说明列表
 * @param {object} params - 查询参数
 * @returns {Promise}
 */
export const getSetterList = (params) => apiService.get('/system/home/setter/list', { params });

/**
 * 获取规则说明详情
 * @param {string|number} id - 规则说明ID
 * @returns {Promise}
 */
export const getSetterDetail = (id) => apiService.get(`/system/home/setter/${id}`);

/**
 * 新增规则说明
 * @param {object} data - 规则说明数据
 * @returns {Promise}
 */
export const saveSetter = (data) => apiService.post('/system/home/setter', data);

/**
 * 更新规则说明
 * @param {object} data - 规则说明数据
 * @returns {Promise}
 */
export const updateSetter = (data) => apiService.put('/system/home/setter', data);

/**
 * 删除规则说明
 * @param {string|number} id - 规则说明ID
 * @returns {Promise}
 */
export const deleteSetter = (id) => apiService.delete(`/system/home/setter/${id}`);
