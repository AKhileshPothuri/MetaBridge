import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { DatabaseOutlined, UserOutlined, AppstoreOutlined, TableOutlined, ClusterOutlined, SettingOutlined, RocketOutlined } from '@ant-design/icons';
import SystemsPage from './pages/SystemsPage';
import RolesPage from './pages/RolesPage';
import CategoriesPage from './pages/CategoriesPage';
import CatalogsPage from './pages/CatalogsPage';
import ContextsPage from './pages/ContextsPage';
import AdminPage from './pages/AdminPage';
import OnboardingPage from './pages/OnboardingPage';
import 'antd/dist/reset.css';

const { Sider, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider breakpoint="lg" collapsedWidth="0">
          <div style={{ height: 32, margin: 16, color: 'white', fontWeight: 'bold', fontSize: 18 }}>MetaBridge</div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['systems']}>
            <Menu.Item key="admin" icon={<SettingOutlined />}><Link to="/admin">Admin</Link></Menu.Item>
            <Menu.Item key="onboarding" icon={<RocketOutlined />}><Link to="/onboarding">Onboarding</Link></Menu.Item>
            <Menu.Item key="systems" icon={<DatabaseOutlined />}><Link to="/systems">Systems</Link></Menu.Item>
            <Menu.Item key="roles" icon={<UserOutlined />}><Link to="/roles">Roles</Link></Menu.Item>
            <Menu.Item key="categories" icon={<AppstoreOutlined />}><Link to="/categories">Categories</Link></Menu.Item>
            <Menu.Item key="catalogs" icon={<TableOutlined />}><Link to="/catalogs">Catalogs</Link></Menu.Item>
            <Menu.Item key="contexts" icon={<ClusterOutlined />}><Link to="/contexts">Contexts</Link></Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Content style={{ padding: '24px' }}>
            <Routes>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/systems" element={<SystemsPage />} />
              <Route path="/roles" element={<RolesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/catalogs" element={<CatalogsPage />} />
              <Route path="/contexts" element={<ContextsPage />} />
              <Route path="*" element={<SystemsPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
