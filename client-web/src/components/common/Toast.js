import React from 'react';
import { toast } from 'react-toastify';

const Toast = () => null;

export const showToast = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast.info(msg),
  warning: (msg) => toast.warning(msg),
};

export default Toast;
