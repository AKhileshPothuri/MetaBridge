import React from 'react';
import { Table, Button, Tag } from 'antd';

const EntityTable = ({ data, entityType, onSync, onHistory, customActions }) => {
  const columns = [
    {
      title: `${entityType} Name`,
      dataIndex: entityType === 'system' ? 'systemname' : entityType === 'role' ? 'rolename' : entityType === 'category' ? 'categoryname' : entityType === 'catalog' ? 'table_name' : 'context_name',
      key: 'name',
    },
    {
      title: 'Dev Present',
      dataIndex: 'dev_present',
      render: (present) => present ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: 'Prod Present',
      dataIndex: 'prod_present',
      render: (present) => present ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
    },
    {
      title: 'Dev Updated',
      dataIndex: 'dev_updated',
    },
    {
      title: 'Prod Updated',
      dataIndex: 'prod_updated',
    },
    entityType === 'catalog' ? {
      title: 'History',
      render: (_, record) => (
        <Button onClick={() => onHistory(record.tableid)}>
          View History
        </Button>
      ),
    } : null,
    entityType === 'context' ? {
      title: 'History',
      render: (_, record) => (
        <Button onClick={() => onHistory(record.contextid)}>
          View History
        </Button>
      ),
    } : null,
    {
      title: 'Action',
      render: (_, record) => (
        <>
          {customActions && customActions(record)}
          <Button type="primary" onClick={() => onSync(record.tableid || record.systemid || record.roleid || record.categoryid || record.contextid)} disabled={!record.dev_present}>
            Sync to Prod
          </Button>
        </>
      ),
    },
  ].filter(Boolean);

  return <Table columns={columns} dataSource={data} rowKey={entityType === 'system' ? 'systemid' : entityType === 'role' ? 'roleid' : entityType === 'category' ? 'categoryid' : entityType === 'catalog' ? 'tableid' : 'contextid'} />;
};

export default EntityTable; 