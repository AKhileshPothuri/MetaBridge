import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, Select, Modal, List, Card, Table } from 'antd';
import axios from 'axios';
import moment from 'moment';

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
      axios.get(`${apiUrl}/systems/`).then(res => setSystems(res.data.dev || []));
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

  const systemColumns = [
    { title: 'System Name', dataIndex: 'systemname', key: 'systemname' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Date Created', dataIndex: 'date_created', key: 'date_created', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
    { title: 'Date Updated', dataIndex: 'date_updated', key: 'date_updated', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
  ];

  const roleColumns = [
    { title: 'Role Name', dataIndex: 'rolename', key: 'rolename' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Date Created', dataIndex: 'date_created', key: 'date_created', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
    { title: 'Date Updated', dataIndex: 'date_updated', key: 'date_updated', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
  ];

  const categoryColumns = [
    { title: 'Category Name', dataIndex: 'categoryname', key: 'categoryname' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'DB Type', dataIndex: 'category_preferences', key: 'db_type', render: (prefs) => prefs ? JSON.parse(prefs).db_type : 'N/A' },
    { title: 'Date Created', dataIndex: 'date_created', key: 'date_created', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
    { title: 'Date Updated', dataIndex: 'date_updated', key: 'date_updated', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
  ];

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
        <h3>Existing Systems</h3>
        <Table
          columns={systemColumns}
          dataSource={systems}
          rowKey="systemid"
          pagination={false}
          onRow={(record) => ({
            onClick: () => handleSystemSelect(record),
            style: { cursor: 'pointer', background: selectedSystem?.systemid === record.systemid ? '#e6f7ff' : undefined },
          })}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Roles" key="roles" disabled={!selectedSystem}>
        <Button type="primary" onClick={() => setRoleModal(true)} style={{ marginBottom: 16 }}>Add Role</Button>
        <h3>Roles for {selectedSystem?.systemname}</h3>
        <Table key="roles-table" columns={roleColumns} dataSource={roles} rowKey="roleid" pagination={false} />
        <Modal open={roleModal} onCancel={() => setRoleModal(false)} onOk={() => roleForm.submit()} title="Add Role" okText="Add">
          <Form form={roleForm} onFinish={handleAddRole} layout="vertical">
            <Form.Item name="rolename" label="Role Name" rules={[{ required: true }]}> <Input /> </Form.Item>
            <Form.Item name="description" label="Description"> <Input /> </Form.Item>
          </Form>
        </Modal>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Categories" key="categories" disabled={!selectedSystem}>
        <Button type="primary" onClick={() => setCategoryModal(true)} style={{ marginBottom: 16 }}>Add Category</Button>
        <h3>Categories for {selectedSystem?.systemname}</h3>
        <Table key="categories-table" columns={categoryColumns} dataSource={categories} rowKey="categoryid" pagination={false} />
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