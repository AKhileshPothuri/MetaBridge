import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, Select, Modal, List, Card, Table, Row, Col, Divider } from 'antd';
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

  // Fetch systems on component mount
  useEffect(() => {
    axios.get(`${apiUrl}/systems/`).then(res => {
        console.log("Fetched Systems:", res.data.dev);
        setSystems(res.data.dev || []);
    }).catch(error => console.error("Error fetching systems:", error));
  }, [apiUrl]);

  // Fetch roles and categories when a system is selected
  useEffect(() => {
    if (selectedSystem) {
      console.log("Selected system:", selectedSystem);
      axios.get(`${apiUrl}/roles/by_system/${selectedSystem.systemid}`).then(res => {
          console.log(`Fetched Roles (API response data.dev) for system ${selectedSystem.systemid}:`, res.data.dev);
          const rolesData = res.data.dev || [];
          console.log(`Calling setRoles with:`, rolesData);
          setRoles(rolesData);
          console.log(`setRoles called for system ${selectedSystem.systemid}.`);
      }).catch(error => console.error(`Error fetching roles for system ${selectedSystem.systemid}:`, error));

      axios.get(`${apiUrl}/categories/by_system/${selectedSystem.systemid}`).then(res => {
          console.log(`Fetched Categories (API response data.dev) for system ${selectedSystem.systemid}:`, res.data.dev);
          const categoriesData = res.data.dev || [];
           console.log(`Calling setCategories with:`, categoriesData);
          setCategories(categoriesData);
          console.log(`setCategories called for system ${selectedSystem.systemid}.`);
      }).catch(error => console.error(`Error fetching categories for system ${selectedSystem.systemid}:`, error));
    } else {
        setRoles([]); // Clear roles if no system is selected
        setCategories([]); // Clear categories if no system is selected
    }
  }, [apiUrl, selectedSystem]); // Depend on selectedSystem to re-fetch

  const handleSystemSelect = (system) => {
    setSelectedSystem(system);
    // Data fetching is now handled by the useEffect hook
  };

  const handleAddSystem = (values) => {
    axios.post(`${apiUrl}/systems/`, values).then(() => {
      axios.get(`${apiUrl}/systems/`).then(res => setSystems(res.data.dev || []));
      form.resetFields();
    }).catch(error => console.error("Error adding system:", error));
  };

  const handleAddRole = (values) => {
    axios.post(`${apiUrl}/roles/`, { ...values, systemid: selectedSystem.systemid }).then(() => {
      // Re-fetch roles for the current system after adding
      fetchRoles(selectedSystem.systemid);
      setRoleModal(false);
      roleForm.resetFields();
    }).catch(error => console.error("Error adding role:", error));
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
      // Re-fetch categories for the current system after adding
      fetchCategories(selectedSystem.systemid);
      setCategoryModal(false);
      categoryForm.resetFields();
    }).catch(error => console.error("Error adding category:", error));
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
    {
        title: 'System',
        key: 'system',
        render: (_, record) => selectedSystem?.systemname || 'N/A'
    },
    { title: 'Date Created', dataIndex: 'date_created', key: 'date_created', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
    { title: 'Date Updated', dataIndex: 'date_updated', key: 'date_updated', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
  ];

  const categoryColumns = [
    { title: 'Category Name', dataIndex: 'categoryname', key: 'categoryname' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
        title: 'System',
        key: 'system',
        render: (_, record) => selectedSystem?.systemname || 'N/A'
    },
    { title: 'DB Type', dataIndex: 'category_preferences', key: 'db_type', render: (prefs) => {
        try {
            const parsedPrefs = JSON.parse(prefs);
            return parsedPrefs.db_type || 'N/A';
        } catch (e) {
            console.error("Error parsing category preferences:", prefs, e);
            return 'Invalid';
        }
    } },
    { title: 'Date Created', dataIndex: 'date_created', key: 'date_created', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
    { title: 'Date Updated', dataIndex: 'date_updated', key: 'date_updated', render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A' },
  ];

  return (
    <Row gutter={16}>
      <Col span={8}>
        <Card title="Systems" style={{ marginBottom: 16 }}>
           <Form layout="inline" form={form} onFinish={handleAddSystem} style={{ marginBottom: 16 }}>
            <Form.Item name="systemname" rules={[{ required: true, message: 'System name required' }]}> <Input placeholder="System Name" /> </Form.Item>
            <Form.Item> <Button type="primary" htmlType="submit">Add System</Button> </Form.Item>
          </Form>
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
        </Card>
      </Col>
      <Col span={16}>
        {selectedSystem ? (
          <>
            <Card title={`Details for ${selectedSystem.systemname}`} style={{ marginBottom: 16 }}>
              <p><b>Description:</b> {selectedSystem.description || 'N/A'}</p>
              <p><b>Date Created:</b> {selectedSystem.date_created ? moment(selectedSystem.date_created).format('YYYY-MM-DD HH:mm') : 'N/A'}</p>
              <p><b>Date Updated:</b> {selectedSystem.date_updated ? moment(selectedSystem.date_updated).format('YYYY-MM-DD HH:mm') : 'N/A'}</p>
              {/* Add other system details here if needed */}
            </Card>

            <Card title={`Roles for ${selectedSystem.systemname}`} style={{ marginBottom: 16 }} extra={<Button type="primary" onClick={() => setRoleModal(true)}>Add Role</Button>}>
              {console.log(`Rendering Roles Table for system ${selectedSystem.systemid}. Data source:`, roles)}
              <Table key={`roles-table-${selectedSystem.systemid}`} columns={roleColumns} dataSource={roles} rowKey="roleid" pagination={false} />
            </Card>

            <Card title={`Categories for ${selectedSystem.systemname}`} extra={<Button type="primary" onClick={() => setCategoryModal(true)}>Add Category</Button>}>
               {console.log(`Rendering Categories Table for system ${selectedSystem.systemid}. Data source:`, categories)}
              <Table key={`categories-table-${selectedSystem.systemid}`} columns={categoryColumns} dataSource={categories} rowKey="categoryid" pagination={false} />
            </Card>

            <Modal open={roleModal} onCancel={() => setRoleModal(false)} onOk={() => roleForm.submit()} title={`Add Role for ${selectedSystem.systemname}`} okText="Add">
              <Form form={roleForm} onFinish={handleAddRole} layout="vertical">
                <Form.Item name="rolename" label="Role Name" rules={[{ required: true }]}> <Input /> </Form.Item>
                <Form.Item name="description" label="Description"> <Input /> </Form.Item>
              </Form>
            </Modal>

            <Modal open={categoryModal} onCancel={() => setCategoryModal(false)} onOk={() => categoryForm.submit()} title={`Add Category for ${selectedSystem.systemname}`} okText="Add">
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
          </>
        ) : (
          <Card title="Select a System" style={{ marginBottom: 16 }}>
            <p>Please select a system from the left pane to view and manage its roles and categories.</p>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default AdminPage; 