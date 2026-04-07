import React, { createContext, useState, useContext, useEffect } from "react";
import apiService from "@api/base";
import { getToken, setToken, removeToken, getUser, setUser, removeUser, clearAuth } from "../utils/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("antd-pro-settings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          theme: "light",
          primaryColor: "#1890ff",
          layout: "mix",
          contentWidth: "Fluid",
          fixedHeader: true,
          fixedSider: true,
          splitMenus: false,
          colorWeak: false,
          watermarkDisabled: false,
        };
  });

  // 检查认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = getToken();
        const storedUser = getUser();

        if (storedToken && storedUser) {
          // 这里可以添加token验证逻辑
          // const response = await apiService.post('/verify-token', { token: storedToken });
          // if (response.valid) {
            setUser(storedUser);
          // } else {
          //   clearAuth();
          // }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 登录
  const login = async (loginData) => {
    try {
      const response = await apiService.post("/auth/l_l", {
        username: loginData.username,
        password: loginData.password,
        authCode: loginData.authCode || '', // Google验证码
        code: loginData.code || '', // 图片验证码
        uuid: loginData.uuid || loginData.captchaId || '', // 验证码ID
      });

      // 根据旧项目结构，token直接在响应根级别
      console.log('登录接口返回:', response);
      const token = response.token;

      if (!token) {
        console.error('未获取到token，响应:', response);
        return { success: false, message: response.msg || '登录失败，未获取到Token' };
      }

      console.log('获取到token:', token);

      // 存储token
      setToken(token);

      // 获取用户信息
      const userInfoResponse = await apiService.get("/system/user/getInfo");
      if (userInfoResponse.code === 200 && userInfoResponse.user) {
        const userData = {
          userId: userInfoResponse.user.userId,
          userName: userInfoResponse.user.userName,
          nickName: userInfoResponse.user.nickName,
          avatar: userInfoResponse.user.avatar,
          ...userInfoResponse.user
        };

        // 存储用户信息
        setUser(userData);

        // 存储角色和权限
        const roles = userInfoResponse.roles || [];
        const permissions = userInfoResponse.permissions || [];
        setRoles(roles);
        setPermissions(permissions);

        // 更新localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('roles', JSON.stringify(roles));
        localStorage.setItem('permissions', JSON.stringify(permissions));

        return { success: true, user: userData };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.msg || error.response?.data?.message || error.message || '登录失败';
      return { success: false, message: errorMessage };
    }
  };

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await apiService.get("/system/user/getInfo");
      if (response.code === 200) {
        const { user, roles, permissions } = response || {};

        if (user) {
          const userData = {
            userId: user.userId,
            userName: user.userName,
            nickName: user.nickName,
            avatar: user.avatar,
            ...user
          };

          setUser(userData);
          setRoles(roles || []);
          setPermissions(permissions || []);

          // 更新localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('roles', JSON.stringify(roles || []));
          localStorage.setItem('permissions', JSON.stringify(permissions || []));

          return { success: true, user: userData, roles, permissions };
        }
      }
      return { success: false, message: '获取用户信息失败' };
    } catch (error) {
      console.error('Get user info error:', error);
      return { success: false, message: '获取用户信息失败' };
    }
  };

  // 获取路由菜单
  const getRouters = async () => {
    try {
      const response = await apiService.get("/system/menu/getRouters");
      if (response.code === 0 || response.code === 200) {
        return { success: true, routes: response.data };
      }
      return { success: false, message: '获取路由失败' };
    } catch (error) {
      console.error('Get routers error:', error);
      return { success: false, message: '获取路由失败' };
    }
  };

  // 登出
  const logout = async () => {
    try {
      // 可以在这里调用登出API
      // await apiService.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地存储
      clearAuth();
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');

      // 清除状态
      setUser(null);
      setRoles([]);
      setPermissions([]);
    }
  };

  // 更新用户信息
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // 检查权限
  const hasPermission = (permission) => {
    if (!permissions || permissions.length === 0) return false;
    return permissions.includes(permission);
  };

  // 检查角色
  const hasRole = (role) => {
    if (!roles || roles.length === 0) return false;
    return roles.includes(role);
  };

  const value = {
    user,
    permissions,
    roles,
    login,
    logout,
    updateUser,
    getUserInfo,
    getRouters,
    hasPermission,
    hasRole,
    loading,
    isAuthenticated: !!user && !!getToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
