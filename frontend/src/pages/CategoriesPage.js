import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EntityTable from '../components/EntityTable';

const CategoriesPage = () => {
  const [data, setData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/categories/`).then(res => {
      const dev = res.data.dev || [];
      const prod = res.data.prod || [];
      const allIds = Array.from(new Set([...dev.map(d => d.categoryid), ...prod.map(p => p.categoryid)]));
      const merged = allIds.map(id => {
        const devItem = dev.find(d => d.categoryid === id);
        const prodItem = prod.find(p => p.categoryid === id);
        return {
          ...devItem,
          ...prodItem,
          categoryid: id,
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
    axios.post(`${apiUrl}/categories/sync/${id}`).then(() => {
      window.location.reload();
    });
  };

  return (
    <div>
      <h2>Categories</h2>
      <EntityTable data={data} entityType="category" onSync={handleSync} />
    </div>
  );
};

export default CategoriesPage; 