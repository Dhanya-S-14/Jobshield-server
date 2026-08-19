import React from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import UserManagement from '../components/admin/UserManagement';

const AdminUsersPage = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminUsersPage;
