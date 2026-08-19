import React from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminDashboardPage = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
