import React from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import ReportManagement from '../components/admin/ReportManagement';

const AdminReportsPage = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <ReportManagement />
      </div>
    </div>
  );
};

export default AdminReportsPage;
