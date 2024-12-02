// src/components/Sidebar.js
import React from "react";
import { Link } from "react-router-dom";
import { Menu, Layout, Avatar } from "antd";
import {
  // DesktopOutlined,
  UserOutlined,
  FileOutlined,
  HomeOutlined,
} from "@ant-design/icons";

// Desestructura Sider de Layout
const { Sider } = Layout;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const items = [
    { key: "1", icon: <HomeOutlined />, label: <Link to={"/"}>{"Inicio"}</Link> },
    // { key: "2", icon: <DesktopOutlined />, label: "Option 2", to: "/option2" },
    {
      key: "sub1", icon: <UserOutlined />, label: "User", children: [
        { key: "3", label: <Link to={"/user/tom"}>{"Tom"}</Link>, },
        { key: "4", label: <Link to={"/user/Bill"}>{"Bill"}</Link>, },
        { key: "5", label: <Link to={"/user/Alex"}>{"Alex"}</Link>, }
      ]
    },
    { key: "8", icon: <FileOutlined />, label: <Link to={"/about"}>{"About"}</Link>, },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="flex items-center px-2 py-6 m-auto w-full space-x-4">
        <Avatar src={"/Logo_Semilla.png"} size={60} shape="square" />        
          <div className={`flex items-center ${collapsed ? 'hidden' : 'block'}`}>
            <span className="text-5xl text-white font-extrabold text-[#F6AF33]">360°</span>
          </div>        
      </div>

      <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items}>

      </Menu>
    </Sider>
  );
};

export default Sidebar;
