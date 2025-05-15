import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EntityTable from '../components/EntityTable';
import { Modal, Table, Tag } from 'antd';

const ContextsPage = () => {
  const [data, setData] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/contexts/`).then(res => {
      const dev = res.data.dev || [];
      const prod = res.data.prod || [];
      const allIds = Array.from(new Set([...dev.map(d => d.contextid), ...prod.map(p => p.contextid)]));
      const merged = allIds.map(id => {
        const devItem = dev.find(d => d.contextid === id);
        const prodItem = prod.find(p => p.contextid === id);
        return {
          ...devItem,
          ...prodItem,
          contextid: id,
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
    axios.post(`${apiUrl}/contexts/sync/${id}`).then(() => {
      window.location.reload();
    });
  };

  const handleHistory = (contextid) => {
    setHistoryVisible(true);
    setHistoryLoading(true);
    axios.get(`${apiUrl}/contexts/${contextid}/history`).then(res => {
      setHistoryData(res.data);
      setHistoryLoading(false);
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

  return (
    <div>
      <h2>Contexts</h2>
      <EntityTable data={data} entityType="context" onSync={handleSync} onHistory={handleHistory} />
      <Modal
        title="Context History"
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
    </div>
  );
};

export default ContextsPage; 