// src/components/Toast.jsx
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Icon from './Icon.jsx';
import { white } from '../styles/colors.jsx';


const defaultOptions = {
    position: 'top-center',
    autoClose: 3000,            // ← 기본 3초
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    closeButton: false,
    draggable: true,            // ← 드래그 허용
    draggableDirection: 'x',     // ← x축으로
    draggablePercent: 40,        // ← 80% 이상 드래그 시 삭제
};

export function StyledToastContainer() {
    return <ToastContainer {...defaultOptions} limit={3} />;
}

export const Toast = {
info:    (msg, opts = {}) => toast.info   (msg, { icon: <Icon name="info"          stroke={white} />, ...opts }),
success: (msg, opts = {}) => toast.success(msg, { icon: <Icon name="check-circle"  stroke={white} />, ...opts }),
error:   (msg, opts = {}) => toast.error  (msg, { icon: <Icon name="alert-triangle" stroke={white} />, ...opts }),
warn:    (msg, opts = {}) => toast.warn   (msg, { icon: <Icon name="alert-circle"   stroke={white} />, ...opts }),
};