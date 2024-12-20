import React, { useState } from 'react';
import { BrowserRouter as Router, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout, theme, ConfigProvider } from 'antd';
import { FloatButton } from 'antd';
import { IoSettingsOutline } from "react-icons/io5";
import { LiaUserCogSolid } from "react-icons/lia";
import { BiPowerOff } from "react-icons/bi";
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/routes';
import Spinner from './components/Spinner';
import esES from 'antd/es/locale/es_ES';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';

const { Content } = Layout;

// Componente para verificar si el usuario está autenticado
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const LayoutComponent = () => {
  const { isLoading,logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const location = useLocation();

  const hideSidebar = location.pathname === '/login' || 
                      location.pathname === '/reset-password' || 
                      location.pathname === '/reset-password/confirm' || 
                      location.pathname === '/404';

  if (isLoading) return <Spinner />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!hideSidebar && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}
      <Layout style={{ marginLeft: hideSidebar ? 0 : (collapsed ? 80 : 200) }}>
        <Content
          style={{
            margin: '0 2px',
            padding: 0,
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {location.pathname === '/login' ? (
            <Login />
          ) : location.pathname === '/reset-password' ? (
            <ResetPassword />
          ) : location.pathname === '/reset-password/confirm' ? (
            <ResetPasswordConfirm />
          ) : (
            <PrivateRoute>
              <AppRoutes />
            </PrivateRoute>
          )}
        </Content>
        
        {/* Botón flotante */}        
        {!hideSidebar && (
          <FloatButton.Group
          trigger="click"
          type="primary"
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
          }}
          icon={<LiaUserCogSolid />}
        >
          <FloatButton tooltip={<div>Configuración</div>} icon={<IoSettingsOutline />} />
          <FloatButton tooltip={<div>Salir</div>} icon={<BiPowerOff />} onClick={logout} />
        </FloatButton.Group>
        )}
      </Layout>
    </Layout>
  );
};

// Componente principal App
function App() {
  return (
    <AuthProvider>
      <ConfigProvider locale={{ locale: esES }}>
        <Router>
          <LayoutComponent />
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
}

export default App;
