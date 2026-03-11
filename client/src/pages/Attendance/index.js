import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { attendanceAPI, employeeAPI } from '../../utils/api';
import { Spinner, EmptyState, ErrorState, Badge, Modal } from '../../components/UI/index';
import styles from './index.module.css';

function MarkAttendanceForm({ employees, onSuccess, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ employeeId: '', date: today, status: 'Present' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.employeeId) e.employeeId = 'Please select an employee';
    if (!form.date) e.date = 'Date is required';
    if (!form.status) e.status = 'Status is required';
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
      await attendanceAPI.mark(form);
      toast.success('Attendance marked!');
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label className={styles.label}>Employee</label>
        <select
          className={`${styles.input} ${errors.employeeId ? styles.inputError : ''}`}
          value={form.employeeId}
          onChange={handleChange('employeeId')}
        >
          <option value="">Select employee...</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullName} ({e.employeeId}) — {e.department}
            </option>
          ))}
        </select>
        {errors.employeeId && <span className={styles.error}>{errors.employeeId}</span>}
      </div>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <input
            type="date"
            className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
            value={form.date}
            onChange={handleChange('date')}
          />
          {errors.date && <span className={styles.error}>{errors.date}</span>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <div className={styles.statusToggle}>
            {['Present', 'Absent'].map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.statusBtn} ${form.status === s ? (s === 'Present' ? styles.statusBtnGreen : styles.statusBtnRed) : ''}`}
                onClick={() => setForm((f) => ({ ...f, status: s }))}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.btnCancel} onClick={onClose} disabled={submitting}>Cancel</button>
        <button type="submit" className={styles.btnSubmit} disabled={submitting}>
          {submitting ? <><Spinner size="sm" /> Marking...</> : 'Mark Attendance'}
        </button>
      </div>
    </form>
  );
}

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMark, setShowMark] = useState(false);

  // Filters
  const today = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterEmployee) params.employeeId = filterEmployee;
      const [attRes, empRes] = await Promise.all([
        attendanceAPI.getAll(params),
        employeeAPI.getAll(),
      ]);
      setRecords(attRes.data.data);
      setEmployees(empRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterDate, filterEmployee]);

  const filtered = filterStatus
    ? records.filter((r) => r.status === filterStatus)
    : records;

  const presentCount = filtered.filter((r) => r.status === 'Present').length;
  const absentCount = filtered.filter((r) => r.status === 'Absent').length;

  return (
    <div className={styles.page}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <input
            type="date"
            className={styles.filterInput}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            title="Filter by date"
          />
          <select
            className={styles.filterInput}
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.fullName}</option>
            ))}
          </select>
          <select
            className={styles.filterInput}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          {(filterDate || filterEmployee || filterStatus) && (
            <button
              className={styles.clearBtn}
              onClick={() => { setFilterDate(''); setFilterEmployee(''); setFilterStatus(''); }}
            >
              Clear
            </button>
          )}
        </div>
        <button className={styles.markBtn} onClick={() => setShowMark(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Mark Attendance
        </button>
      </div>

      {/* Summary chips */}
      {!loading && !error && filtered.length > 0 && (
        <div className={styles.chips}>
          <span className={styles.chip}>{filtered.length} Records</span>
          <span className={`${styles.chip} ${styles.chipGreen}`}>✓ {presentCount} Present</span>
          <span className={`${styles.chip} ${styles.chipRed}`}>✗ {absentCount} Absent</span>
        </div>
      )}

      {/* Records */}
      {loading ? (
        <div className={styles.center}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M9 16l2 2 4-4"/></svg>}
          title="No records found"
          description="Try adjusting filters or mark attendance for today."
          action={<button className={styles.markBtn} onClick={() => setShowMark(true)}>Mark Attendance</button>}
        />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>ID</th>
                <th>Department</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className={styles.empCell}>
                      <div className={`${styles.empAvatar} ${r.status === 'Present' ? styles.avatarGreen : styles.avatarRed}`}>
                        {r.employee?.fullName?.[0] ?? '?'}
                      </div>
                      <span className={styles.empName}>{r.employee?.fullName ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td><span className={styles.idBadge}>{r.employee?.employeeId ?? '—'}</span></td>
                  <td>{r.employee?.department ?? '—'}</td>
                  <td className={styles.dateCell}>{r.date}</td>
                  <td><Badge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.tableFooter}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</div>
        </div>
      )}

      {/* Mark Modal */}
      <Modal isOpen={showMark} onClose={() => setShowMark(false)} title="Mark Attendance">
        <MarkAttendanceForm
          employees={employees}
          onSuccess={() => { setShowMark(false); fetchData(); }}
          onClose={() => setShowMark(false)}
        />
      </Modal>
    </div>
  );
}
