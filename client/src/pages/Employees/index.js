import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeAPI } from '../../utils/api';
import { Spinner, EmptyState, ErrorState, Badge, Modal, ConfirmModal } from '../../components/UI/index';
import styles from './index.module.css';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Legal', 'Other'];

function EmployeeForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({ employeeId: '', fullName: '', email: '', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) e.fullName = 'At least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.department) e.department = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await employeeAPI.create(form);
      toast.success('Employee added successfully!');
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label}>Employee ID</label>
          <input
            className={`${styles.input} ${errors.employeeId ? styles.inputError : ''}`}
            placeholder="e.g. EMP001"
            value={form.employeeId}
            onChange={handleChange('employeeId')}
          />
          {errors.employeeId && <span className={styles.error}>{errors.employeeId}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Full Name</label>
          <input
            className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
            placeholder="e.g. Jane Smith"
            value={form.fullName}
            onChange={handleChange('fullName')}
          />
          {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="jane@company.com"
            value={form.email}
            onChange={handleChange('email')}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label}>Department</label>
          <select
            className={`${styles.input} ${errors.department ? styles.inputError : ''}`}
            value={form.department}
            onChange={handleChange('department')}
          >
            <option value="">Select department...</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <span className={styles.error}>{errors.department}</span>}
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnCancel} onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className={styles.btnSubmit} disabled={submitting}>
          {submitting ? <><Spinner size="sm" /> Adding...</> : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeAPI.delete(deleteTarget._id);
      toast.success('Employee deleted');
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.page}>
      {/* Header bar */}
      <div className={styles.topBar}>
        <div className={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Employee
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.center}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchEmployees} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
          title={search ? 'No results found' : 'No employees yet'}
          description={search ? `No employees match "${search}"` : 'Add your first employee to get started.'}
          action={!search && <button className={styles.addBtn} onClick={() => setShowAdd(true)}>Add Employee</button>}
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Present Days</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp._id}>
                  <td>
                    <div className={styles.empCell}>
                      <div className={styles.empAvatar}>{emp.fullName[0]}</div>
                      <div>
                        <div className={styles.empName}>{emp.fullName}</div>
                        <div className={styles.empEmail}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.idBadge}>{emp.employeeId}</span></td>
                  <td><Badge status={emp.department} /></td>
                  <td>
                    <span className={styles.presentDays}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {emp.presentDays ?? 0} days
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link to={`/employees/${emp._id}`} className={styles.viewBtn}>View</Link>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => setDeleteTarget(emp)}
                        title="Delete employee"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.tableFooter}>
            Showing {filtered.length} of {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Employee">
        <EmployeeForm
          onSuccess={() => { setShowAdd(false); fetchEmployees(); }}
          onClose={() => setShowAdd(false)}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? This will also remove all their attendance records and cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
