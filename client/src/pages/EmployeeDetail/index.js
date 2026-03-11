import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeAPI, attendanceAPI } from '../../utils/api';
import { Spinner, ErrorState, Badge, EmptyState, ConfirmModal } from '../../components/UI/index';
import styles from './index.module.css';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ presentDays: 0, absentDays: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      const [empRes, attRes] = await Promise.all([
        employeeAPI.getById(id),
        attendanceAPI.getByEmployee(id, params),
      ]);
      setEmployee(empRes.data.data);
      setAttendance(attRes.data.data);
      setStats(attRes.data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, filterDate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeeAPI.delete(id);
      toast.success('Employee deleted');
      navigate('/employees');
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!employee) return <ErrorState title="Employee not found" />;

  const attendanceRate = stats.presentDays + stats.absentDays > 0
    ? Math.round((stats.presentDays / (stats.presentDays + stats.absentDays)) * 100)
    : 0;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/employees" className={styles.breadLink}>Employees</Link>
        <span>/</span>
        <span>{employee.fullName}</span>
      </div>

      {/* Profile header */}
      <div className={styles.profileCard}>
        <div className={styles.profileLeft}>
          <div className={styles.avatar}>{employee.fullName[0]}</div>
          <div>
            <h2 className={styles.name}>{employee.fullName}</h2>
            <div className={styles.meta}>
              <Badge status={employee.department} />
              <span className={styles.empId}>{employee.employeeId}</span>
            </div>
            <div className={styles.email}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {employee.email}
            </div>
          </div>
        </div>
        <div className={styles.profileRight}>
          <button className={styles.deleteBtn} onClick={() => setShowDelete(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Delete Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Present Days</span>
          <span className={`${styles.statVal} ${styles.statGreen}`}>{stats.presentDays}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Absent Days</span>
          <span className={`${styles.statVal} ${styles.statRed}`}>{stats.absentDays}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Recorded</span>
          <span className={styles.statVal}>{stats.presentDays + stats.absentDays}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Attendance Rate</span>
          <span className={`${styles.statVal} ${attendanceRate >= 75 ? styles.statGreen : styles.statRed}`}>
            {attendanceRate}%
          </span>
        </div>
      </div>

      {/* Attendance records */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Attendance History</h3>
          <input
            type="date"
            className={styles.filterInput}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            title="Filter by date"
          />
          {filterDate && (
            <button className={styles.clearBtn} onClick={() => setFilterDate('')}>Clear</button>
          )}
        </div>

        {attendance.length === 0 ? (
          <EmptyState
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            title="No attendance records"
            description={filterDate ? `No records for ${filterDate}` : 'No attendance has been recorded yet.'}
          />
        ) : (
          <div className={styles.records}>
            {attendance.map((r) => (
              <div key={r.id} className={`${styles.record} ${r.status === 'Present' ? styles.recordGreen : styles.recordRed}`}>
                <span className={styles.recordDate}>{r.date}</span>
                <Badge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.fullName}? All their attendance records will also be permanently removed.`}
        loading={deleting}
      />
    </div>
  );
}
