import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EntityTable from '../components/EntityTable';
import { Modal, Table, Tag, Drawer, Button } from 'antd';
import ReactJson from 'react-json-view';

const CatalogsPage = () => {
  const [data, setData] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/catalogs/`).then(res => {
      const dev = res.data.dev || [];
      const prod = res.data.prod || [];
      const allIds = Array.from(new Set([...dev.map(d => d.tableid), ...prod.map(p => p.tableid)]));
      const merged = allIds.map(id => {
        const devItem = dev.find(d => d.tableid === id);
        const prodItem = prod.find(p => p.tableid === id);
        return {
          ...devItem,
          ...prodItem,
          tableid: id,
          dev_present: !!devItem,
          prod_present: !!prodItem,
          dev_updated: devItem?.date_updated || '',
          prod_updated: prodItem?.date_updated || '',
        };
      });
      setData(merged);
    });
  }, [apiUrl]);

  const handleSync = (id) => {
    axios.post(`${apiUrl}/catalogs/sync/${id}`).then(() => {
      window.location.reload();
    });
  };

  const handleHistory = (tableid) => {
    setHistoryVisible(true);
    setHistoryLoading(true);
    axios.get(`${apiUrl}/catalogs/${tableid}/history`).then(res => {
      setHistoryData(res.data);
      setHistoryLoading(false);
    });
  };

  const handleViewDetails = (table_vector_id) => {
    setDrawerVisible(true);
    setDrawerLoading(true);
    axios.get(`${apiUrl}/catalogs/full/${table_vector_id}`).then(res => {
      setDrawerData(res.data);
      setDrawerLoading(false);
    });
  };

  const historyColumns = [
    { title: 'Action', dataIndex: 'action', render: (action) => <Tag color={action === 'INSERT' ? 'green' : action === 'UPDATE' ? 'blue' : 'red'}>{action}</Tag> },
    { title: 'Changed By', dataIndex: 'changed_by' },
    { title: 'Changed At', dataIndex: 'changed_at' },
    { title: 'Old Data', dataIndex: 'old_data', render: (data) => <pre style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre> },
    { title: 'New Data', dataIndex: 'new_data', render: (data) => <pre style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre> },
    { title: 'Reason', dataIndex: 'change_reason' },
  ];

  const customActions = (record) => (
    <Button onClick={() => handleViewDetails(record.table_vector_id)} style={{ marginRight: 8 }}>View Details</Button>
  );

  return (
    <div>
      <h2>Catalogs</h2>
      <EntityTable data={data} entityType="catalog" onSync={handleSync} onHistory={handleHistory} customActions={customActions} />
      <Modal
        title="Catalog History"
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={historyColumns}
          dataSource={historyData}
          loading={historyLoading}
          rowKey="audit_id"
          pagination={false}
        />
      </Modal>
      <Drawer
        title="Catalog Details"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={700}
      >
        {drawerLoading ? <p>Loading...</p> : drawerData && <ReactJson src={drawerData} name={false} collapsed={false} displayDataTypes={false} enableClipboard={false} style={{ fontSize: 14 }} />}
      </Drawer>
    </div>
  );
};

export default CatalogsPage; 