import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EntityTable from '../components/EntityTable';

const SystemsPage = () => {
  const [data, setData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/systems/`).then(res => {
      const dev = res.data.dev || [];
      const prod = res.data.prod || [];
      // Merge dev and prod by systemid
      const allIds = Array.from(new Set([...dev.map(d => d.systemid), ...prod.map(p => p.systemid)]));
      const merged = allIds.map(id => {
        const devItem = dev.find(d => d.systemid === id);
        const prodItem = prod.find(p => p.systemid === id);
        return {
          ...devItem,
          ...prodItem,
          systemid: id,
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
    axios.post(`${apiUrl}/systems/sync/${id}`).then(() => {
      window.location.reload();
    });
  };

  return (
    <div>
      <h2>Systems</h2>
      <EntityTable data={data} entityType="system" onSync={handleSync} />
    </div>
  );
};

export default SystemsPage; 