import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EntityTable from '../components/EntityTable';

const ContextsPage = () => {
  const [data, setData] = useState([]);
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

  return (
    <div>
      <h2>Contexts</h2>
      <EntityTable data={data} entityType="context" onSync={handleSync} />
    </div>
  );
};

export default ContextsPage; 