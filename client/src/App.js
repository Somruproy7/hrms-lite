import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/index';
import Dashboard from './pages/Dashboard/index';
import Employees from './pages/Employees/index';
import Attendance from './pages/Attendance/index';
import EmployeeDetail from './pages/EmployeeDetail/index';
import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c2028',
            color: '#f0f2f7',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#1c2028' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1c2028' } },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/attendance" element={<Attendance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
