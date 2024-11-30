import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/routes";
import Sidebar from "./components/Sidebar"; // Sidebar modularizado
import { Layout, Breadcrumb, theme } from "antd";
const { Content, Footer } = Layout;

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Router>
      {/* Sidebar modificado */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout style={{ minHeight: "100vh", marginLeft: collapsed ? 80 : 200 }}>
        {/* Contenido principal */}
        <Content
          style={{
            margin: "0 16px",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
            }}
          >
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {/* Rutas para contenido */}
            <AppRoutes />
          </div>
        </Content>

        {/* Pie de página */}
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          La Semilla De Oro S.A.C. ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
