import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import SystemsPage from './pages/SystemsPage';
import RolesPage from './pages/RolesPage';
import CategoriesPage from './pages/CategoriesPage';
import CatalogsPage from './pages/CatalogsPage';
import ContextsPage from './pages/ContextsPage';
import 'antd/dist/reset.css';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout>
        <Header>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['systems']}>
            <Menu.Item key="systems"><Link to="/systems">Systems</Link></Menu.Item>
            <Menu.Item key="roles"><Link to="/roles">Roles</Link></Menu.Item>
            <Menu.Item key="categories"><Link to="/categories">Categories</Link></Menu.Item>
            <Menu.Item key="catalogs"><Link to="/catalogs">Catalogs</Link></Menu.Item>
            <Menu.Item key="contexts"><Link to="/contexts">Contexts</Link></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '24px' }}>
          <Routes>
            <Route path="/systems" element={<SystemsPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/catalogs" element={<CatalogsPage />} />
            <Route path="/contexts" element={<ContextsPage />} />
            <Route path="*" element={<SystemsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
