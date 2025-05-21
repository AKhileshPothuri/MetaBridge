import React, { useEffect, useState } from 'react';
import { Steps, Select, Button, Card, Spin, message } from 'antd';
import axios from 'axios';
import ReactJson from 'react-json-view';

const { Option } = Select;

const OnboardingPage = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [schema, setSchema] = useState(null);
  const [tables, setTables] = useState([]);
  const [table, setTable] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/categories/`).then(res => setCategories(res.data.dev || []));
  }, [apiUrl]);

  const fetchSchemas = () => {
    if (categoryId === null) {
        console.log("fetchSchemas: categoryId is null, returning.");
        return; // Prevent API call if categoryId is not set
    }
    setLoading(true);
    // Explicitly ensure categoryId is an integer before sending
    const idToSend = parseInt(categoryId);
    console.log("fetchSchemas: categoryId before API call", { value: categoryId, type: typeof categoryId, parsed: idToSend });
    if (isNaN(idToSend)) {
        console.error("Invalid categoryId parsed:", categoryId);
        message.error("Invalid category selected.");
        setLoading(false);
        return;
    }
    axios.post(`${apiUrl}/db/list_schemas/`, { categoryid: idToSend })
      .then(res => setSchemas(res.data))
      .catch(error => {
        console.error('Error fetching schemas:', error.response ? error.response.data : error.message);
        message.error('Failed to fetch schemas');
        setSchemas([]); // Clear schemas on error
      })
      .finally(() => setLoading(false));
  };

  const fetchTables = () => {
    if (categoryId === null || schema === null) return; // Prevent API call if categoryId or schema is not set
    setLoading(true);
    // Explicitly ensure categoryid is an integer before sending
    const idToSend = parseInt(categoryId);
     if (isNaN(idToSend)) {
        console.error("Invalid categoryId:", categoryId);
        message.error("Invalid category selected.");
        setLoading(false);
        return;
    }
    axios.post(`${apiUrl}/db/list_tables/`, { categoryid: idToSend, schema })
      .then(res => setTables(res.data))
      .catch(error => {
        console.error('Error fetching tables:', error);
        message.error('Failed to fetch tables');
        setTables([]); // Clear tables on error
      })
      .finally(() => setLoading(false));
  };

  const handleGenerate = () => {
     if (categoryId === null || schema === null || table === null) return; // Prevent API call if inputs not set
    setLoading(true);
     // Explicitly ensure categoryid is an integer before sending
    const idToSend = parseInt(categoryId);
     if (isNaN(idToSend)) {
        console.error("Invalid categoryId:", categoryId);
        message.error("Invalid category selected.");
        setLoading(false);
        return;
    }
    axios.post(`${apiUrl}/db/generate_metadata/`, { categoryid: idToSend, schema, table })
      .then(res => setMetadata(res.data))
      .catch(error => {
        console.error('Error generating metadata:', error);
        message.error('Failed to generate metadata');
        setMetadata(null); // Clear metadata on error
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card title="Onboarding Wizard" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Steps current={step} style={{ marginBottom: 32 }}>
        <Steps.Step title="Select Category" />
        <Steps.Step title="Select Schema" />
        <Steps.Step title="Select Table" />
        <Steps.Step title="Generate Metadata" />
      </Steps>
      {step === 0 && (
        <div>
          <Select
            style={{ width: 400 }}
            placeholder="Select Category"
            value={categoryId}
            onChange={v => setCategoryId(parseInt(v))}
            showSearch
            optionFilterProp="children"
          >
            {categories.map(cat => (
              <Option key={cat.categoryid} value={cat.categoryid}>{cat.categoryname}</Option>
            ))}
          </Select>
          <Button type="primary" style={{ marginLeft: 16 }} disabled={categoryId === null} onClick={() => { fetchSchemas(); setStep(1); }}>Next</Button>
        </div>
      )}
      {step === 1 && (
        <div>
          <Select
            style={{ width: 400 }}
            placeholder="Select Schema"
            value={schema}
            onChange={v => setSchema(v)}
            showSearch
            optionFilterProp="children"
          >
            {schemas.map(s => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>
          <Button style={{ marginLeft: 8 }} onClick={() => setStep(0)}>Back</Button>
          <Button type="primary" style={{ marginLeft: 8 }} disabled={!schema} onClick={() => { fetchTables(); setStep(2); }}>Next</Button>
        </div>
      )}
      {step === 2 && (
        <div>
          <Select
            style={{ width: 400 }}
            placeholder="Select Table"
            value={table}
            onChange={v => setTable(v)}
            showSearch
            optionFilterProp="children"
          >
            {tables.map(t => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
          <Button style={{ marginLeft: 8 }} onClick={() => setStep(1)}>Back</Button>
          <Button type="primary" style={{ marginLeft: 8 }} disabled={!table} onClick={() => setStep(3)}>Next</Button>
        </div>
      )}
      {step === 3 && (
        <div>
          <Button style={{ marginBottom: 16 }} onClick={() => setStep(2)}>Back</Button>
          <Button type="primary" style={{ marginLeft: 8, marginBottom: 16 }} onClick={handleGenerate} disabled={loading || !table}>Generate Metadata</Button>
          {loading && <Spin style={{ marginLeft: 16 }} />}
          {metadata && (
            <div style={{ marginTop: 24 }}>
              <ReactJson src={metadata} name={false} collapsed={false} displayDataTypes={false} enableClipboard={false} style={{ fontSize: 14 }} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default OnboardingPage; 