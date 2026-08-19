import React from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import KeywordManagement from '../components/admin/KeywordManagement';

const AdminKeywordsPage = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <KeywordManagement />
      </div>
    </div>
  );
};

export default AdminKeywordsPage;
