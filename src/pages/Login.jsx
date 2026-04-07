import React, { useState, useEffect, useRef } from 'react';
import { LockOutlined, UserOutlined, SafetyOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Typography, Image } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getCodeImage } from '@api';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';
import { encrypt, decrypt } from '../utils/jsencrypt';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaEnabled, setCaptchaEnabled] = useState(true);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = useRef(new URLSearchParams(location.search).get('redirect') || '/');

  // 如果已经认证，直接跳转
  if (isAuthenticated) {
    return <Navigate to={redirectPath.current} replace />;
  }

  // 从Cookie加载保存的用户信息
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  // 页面加载时获取验证码
  useEffect(() => {
    fetchCaptcha();
  }, []);

  // 从Cookie加载保存的凭据
  const loadSavedCredentials = () => {
    try {
      const username = getCookie('username');
      const encryptedPassword = getCookie('password');
      const rememberMe = getCookie('rememberMe');

      if (rememberMe === 'true' && username) {
        const decryptedPassword = encryptedPassword ? decrypt(encryptedPassword) : '';
        form.setFieldsValue({
          username: username || '',
          password: decryptedPassword || '',
          remember: true
        });
      }
    } catch (error) {
      console.error('加载保存的凭据失败:', error);
      // 清除损坏的Cookie
      removeCookie('username');
      removeCookie('password');
      removeCookie('rememberMe');
    }
  };

  // 获取验证码
  const fetchCaptcha = async () => {
    setCodeLoading(true);
    try {
      const response = await getCodeImage({ timestamp: Date.now() });
      console.log('验证码接口返回:', response); // 调试日志

      // 根据实际返回结构，字段在根级别
      if (response.code === 0 || response.code === 200) {
        // 保存验证码ID - 直接从根级别获取
        setCaptchaId(response.uuid || '');

        // 保存验证码图片 - 直接从根级别的 img 字段获取
        const imageData = response.img;
        if (imageData) {
          // 如果img字段已经是完整的base64图片（以data:开头），直接使用
          // 如果只是base64字符串，需要添加data URI前缀
          if (imageData.startsWith('data:')) {
            setCaptchaUrl(imageData);
          } else if (imageData.startsWith('/9j/')) {
            // JPEG格式的base64
            setCaptchaUrl(`data:image/jpeg;base64,${imageData}`);
          } else {
            // 默认使用GIF格式
            setCaptchaUrl(`data:image/gif;base64,${imageData}`);
          }
        } else {
          setCaptchaUrl('');
        }

        // 验证码开关
        setCaptchaEnabled(response.captchaEnabled !== false);

        message.success('验证码已刷新');
      } else {
        message.error(response.msg || '获取验证码失败');
      }
    } catch (error) {
      console.error('获取验证码失败:', error);
      message.error('获取验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };

  // 处理登录
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 处理"记住密码"功能
      if (values.remember) {
        // 加密密码后存储到Cookie
        const encryptedPassword = encrypt(values.password);
        setCookie('username', values.username, 30);
        setCookie('password', encryptedPassword, 30);
        setCookie('rememberMe', 'true', 30);
      } else {
        // 清除Cookie
        removeCookie('username');
        removeCookie('password');
        removeCookie('rememberMe');
      }

      // 准备登录数据
      const loginData = {
        username: values.username,
        password: values.password,
        authCode: values.authCode, // Google验证码
        code: values.captcha, // 图片验证码
        uuid: captchaId, // 验证码ID
        captchaId: captchaId, // 兼容字段
        userType: 'systemUser'
      };

      const { success, message: errorMsg } = await login(loginData);
      if (success) {
        message.success('登录成功！');
        // 登录成功后会自动跳转，因为isAuthenticated会变化
      } else {
        message.error(errorMsg || '登录失败');
        // 登录失败后刷新验证码
        if (captchaEnabled) {
          fetchCaptcha();
          form.setFieldValue('captcha', '');
        }
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error(error.message || '登录失败，请检查用户名和密码');
      // 登录失败后刷新验证码
      if (captchaEnabled) {
        fetchCaptcha();
        form.setFieldValue('captcha', '');
      }
    } finally {
      setLoading(false);
    }
  };

  // 表单验证失败
  const onFinishFailed = (errorInfo) => {
    console.log('表单验证失败:', errorInfo);
    message.warning('请填写完整的登录信息');
  };

  return (
    <div className="login-container">
      <div className="animated-background">
        <div className="gradient-bg"></div>
      </div>

      <div className="login-card">
        {/* 头部 */}
        <div className="login-header">
          <svg className="login-logo" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" opacity="0.15"/>
            <path d="M32 8L42 20L42 32L32 44L22 32L22 20L32 8Z" fill="url(#logoGradient)"/>
            <circle cx="32" cy="28" r="8" fill="white" opacity="0.9"/>
            <path d="M28 36L32 32L36 36V42C36 43.1 35.1 44 34 44H30C28.9 44 28 43.1 28 42V36Z" fill="url(#logoGradient)"/>
            <circle cx="32" cy="28" r="3" fill="url(#logoGradient)"/>
          </svg>
          <Title level={2} className="login-title">
            BOVO后台管理系统
          </Title>
          <Text className="login-subtitle">Cloud版 - 欢迎回来，请登录您的账户</Text>
        </div>

        <Form
          form={form}
          name="normal_login"
          className="login-form"
          initialValues={{
            username: 'admin',
            password: '123456',
            authCode: '',
            captcha: '',
            remember: false
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          size="large"
          autoComplete="off"
        >
          {/* 用户名 */}
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入您的账号!' },
              { min: 2, message: '账号长度至少2个字符!' }
            ]}
          >
            <Input
              className="login-input"
              prefix={<UserOutlined />}
              placeholder="账号"
              autoComplete="username"
            />
          </Form.Item>

          {/* 密码 */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入您的密码!' },
              { min: 6, message: '密码长度至少6个字符!' }
            ]}
          >
            <Input.Password
              className="login-input"
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          {/* Google验证码 */}
          <Form.Item
            name="authCode"
            rules={[
              { required: true, message: '请输入Google验证码!' }
            ]}
          >
            <Input.Password
              className="login-input"
              prefix={<SafetyOutlined />}
              placeholder="Google验证码"
              autoComplete="off"
              onPressEnter={() => form.submit()}
            />
          </Form.Item>

          {/* 图片验证码 - 仅在启用时显示 */}
          {captchaEnabled && (
            <Form.Item
              name="captcha"
              rules={[{ required: true, message: '请输入验证码!' }]}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  className="login-input"
                  prefix={<SafetyOutlined />}
                  placeholder="验证码"
                  style={{ flex: 1 }}
                  autoComplete="off"
                  onPressEnter={() => form.submit()}
                />
                <div
                  className="captcha-box"
                  onClick={codeLoading ? undefined : fetchCaptcha}
                  title="点击刷新验证码"
                  style={{ cursor: codeLoading ? 'not-allowed' : 'pointer' }}
                >
                  {codeLoading ? (
                    <ReloadOutlined spin className="captcha-loading" />
                  ) : captchaUrl ? (
                    <Image
                      className="captcha-image"
                      src={captchaUrl}
                      alt="验证码"
                      preview={false}
                    />
                  ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>点击获取</Text>
                  )}
                </div>
              </div>
            </Form.Item>
          )}

          {/* 记住密码 */}
          <Form.Item className="login-checkbox">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住密码</Checkbox>
            </Form.Item>
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={loading ? 'login-button loading' : 'login-button'}
            >
              {loading ? '登录中...' : '登 录'}
            </Button>
          </Form.Item>

          {/* 提示信息 */}
          <div className="login-tips">
            <Text type="secondary">
              默认账号: admin / 123456
            </Text>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;
