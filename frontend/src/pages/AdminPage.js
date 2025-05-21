import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, Select, Modal, List, Card } from 'antd';
import axios from 'axios';

const { Option } = Select;

const dbTypes = [
  { label: 'Postgres', value: 'postgres' },
  { label: 'GCP', value: 'gcp' },
  { label: 'Kinetica', value: 'kinetica' },
  { label: 'Teradata', value: 'teradata' },
  { label: 'Spanner', value: 'spanner' },
];

const AdminPage = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [systems, setSystems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [roleModal, setRoleModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [dbType, setDbType] = useState('postgres');

  useEffect(() => {
    axios.get(`${apiUrl}/systems/`).then(res => setSystems(res.data.dev || []));
  }, [apiUrl]);

  const fetchRoles = (systemid) => {
    axios.get(`${apiUrl}/roles/by_system/${systemid}`).then(res => setRoles(res.data.dev || []));
  };
  const fetchCategories = (systemid) => {
    axios.get(`${apiUrl}/categories/by_system/${systemid}`).then(res => setCategories(res.data.dev || []));
  };

  const handleSystemSelect = (system) => {
    setSelectedSystem(system);
    fetchRoles(system.systemid);
    fetchCategories(system.systemid);
  };

  const handleAddSystem = (values) => {
    axios.post(`${apiUrl}/systems/`, values).then(() => {
      axios.get(`${apiUrl}/systems/`).then(res => setSystems(res.data));
      form.resetFields();
    });
  };

  const handleAddRole = (values) => {
    axios.post(`${apiUrl}/roles/`, { ...values, systemid: selectedSystem.systemid }).then(() => {
      fetchRoles(selectedSystem.systemid);
      setRoleModal(false);
      roleForm.resetFields();
    });
  };

  const handleAddCategory = (values) => {
    let db_creds = {};
    if (dbType === 'postgres') {
      db_creds = {
        database: values.database,
        user: values.user,
        password: values.password,
        host: values.host,
        port: values.port,
      };
    }
    axios.post(`${apiUrl}/categories/`, {
      categoryname: values.categoryname,
      systemid: selectedSystem.systemid,
      description: values.description,
      db_type: dbType,
      db_creds,
    }).then(() => {
      fetchCategories(selectedSystem.systemid);
      setCategoryModal(false);
      categoryForm.resetFields();
    });
  };

  return (
    <Tabs defaultActiveKey="systems">
      <Tabs.TabPane tab="Systems" key="systems">
        <Card title="Add System" style={{ marginBottom: 16 }}>
          <Form layout="inline" form={form} onFinish={handleAddSystem}>
            <Form.Item name="systemname" rules={[{ required: true, message: 'System name required' }]}> <Input placeholder="System Name" /> </Form.Item>
            <Form.Item name="description"> <Input placeholder="Description" /> </Form.Item>
            <Form.Item> <Button type="primary" htmlType="submit">Add System</Button> </Form.Item>
          </Form>
        </Card>
        <List
          bordered
          dataSource={systems}
          renderItem={item => (
            <List.Item onClick={() => handleSystemSelect(item)} style={{ cursor: 'pointer', background: selectedSystem?.systemid === item.systemid ? '#e6f7ff' : undefined }}>
              <b>{item.systemname}</b> {item.description && <span style={{ marginLeft: 8 }}>{item.description}</span>}
            </List.Item>
          )}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Roles" key="roles" disabled={!selectedSystem}>
        <Button type="primary" onClick={() => setRoleModal(true)} style={{ marginBottom: 16 }}>Add Role</Button>
        <List bordered dataSource={roles} renderItem={item => <List.Item>{item.rolename}</List.Item>} />
        <Modal open={roleModal} onCancel={() => setRoleModal(false)} onOk={() => roleForm.submit()} title="Add Role" okText="Add">
          <Form form={roleForm} onFinish={handleAddRole} layout="vertical">
            <Form.Item name="rolename" label="Role Name" rules={[{ required: true }]}> <Input /> </Form.Item>
            <Form.Item name="description" label="Description"> <Input /> </Form.Item>
          </Form>
        </Modal>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Categories" key="categories" disabled={!selectedSystem}>
        <Button type="primary" onClick={() => setCategoryModal(true)} style={{ marginBottom: 16 }}>Add Category</Button>
        <List bordered dataSource={categories} renderItem={item => <List.Item>{item.categoryname}</List.Item>} />
        <Modal open={categoryModal} onCancel={() => setCategoryModal(false)} onOk={() => categoryForm.submit()} title="Add Category" okText="Add">
          <Form form={categoryForm} onFinish={handleAddCategory} layout="vertical">
            <Form.Item name="categoryname" label="Category Name" rules={[{ required: true }]}> <Input /> </Form.Item>
            <Form.Item name="description" label="Description"> <Input /> </Form.Item>
            <Form.Item name="db_type" label="Database Type" initialValue="postgres">
              <Select onChange={setDbType}>
                {dbTypes.map(dt => <Option key={dt.value} value={dt.value}>{dt.label}</Option>)}
              </Select>
            </Form.Item>
            {dbType === 'postgres' && <>
              <Form.Item name="database" label="Database Name" rules={[{ required: true }]}> <Input /> </Form.Item>
              <Form.Item name="user" label="User" rules={[{ required: true }]}> <Input /> </Form.Item>
              <Form.Item name="password" label="Password" rules={[{ required: true }]}> <Input.Password /> </Form.Item>
              <Form.Item name="host" label="Host" rules={[{ required: true }]}> <Input /> </Form.Item>
              <Form.Item name="port" label="Port" rules={[{ required: true }]}> <Input /> </Form.Item>
            </>}
            {dbType !== 'postgres' && <Form.Item label="DB Credentials">(Placeholder for {dbType} credentials)</Form.Item>}
          </Form>
        </Modal>
      </Tabs.TabPane>
    </Tabs>
  );
};

export default AdminPage; 