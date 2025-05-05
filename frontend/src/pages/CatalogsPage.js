import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EntityTable from '../components/EntityTable';

const CatalogsPage = () => {
  const [data, setData] = useState([]);
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

  return (
    <div>
      <h2>Catalogs</h2>
      <EntityTable data={data} entityType="catalog" onSync={handleSync} />
    </div>
  );
};

export default CatalogsPage; 