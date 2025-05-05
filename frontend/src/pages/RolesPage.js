import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EntityTable from '../components/EntityTable';

const RolesPage = () => {
  const [data, setData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/roles/`).then(res => {
      const dev = res.data.dev || [];
      const prod = res.data.prod || [];
      const allIds = Array.from(new Set([...dev.map(d => d.roleid), ...prod.map(p => p.roleid)]));
      const merged = allIds.map(id => {
        const devItem = dev.find(d => d.roleid === id);
        const prodItem = prod.find(p => p.roleid === id);
        return {
          ...devItem,
          ...prodItem,
          roleid: id,
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
    axios.post(`${apiUrl}/roles/sync/${id}`).then(() => {
      window.location.reload();
    });
  };

  return (
    <div>
      <h2>Roles</h2>
      <EntityTable data={data} entityType="role" onSync={handleSync} />
    </div>
  );
};

export default RolesPage; 