import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employeeAPI, attendanceAPI } from '../../utils/api';
import { StatCard, Spinner, ErrorState, Badge } from '../../components/UI/index';
import styles from './index.module.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, attRes] = await Promise.all([
        employeeAPI.getSummary(),
        attendanceAPI.getAll({ date: today }),
      ]);
      setSummary(sumRes.data.data);
      setRecentAttendance(attRes.data.data.slice(0, 8));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className={styles.page}>
      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>{todayFormatted}</span>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total Employees"
          value={summary?.totalEmployees ?? 0}
          color="blue"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          trend="All registered employees"
        />
        <StatCard
          label="Present Today"
          value={summary?.presentToday ?? 0}
          color="green"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          trend={`Out of ${summary?.totalEmployees ?? 0} employees`}
        />
        <StatCard
          label="Absent Today"
          value={summary?.absentToday ?? 0}
          color="red"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          }
          trend="Marked absent today"
        />
        <StatCard
          label="Departments"
          value={summary?.departments?.length ?? 0}
          color="amber"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
          trend="Active departments"
        />
      </div>

      <div className={styles.bottomGrid}>
        {/* Today's attendance */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Today's Attendance</h2>
            <Link to="/attendance" className={styles.viewAll}>View all →</Link>
          </div>
          {recentAttendance.length === 0 ? (
            <p className={styles.noData}>No attendance records for today yet.</p>
          ) : (
            <div className={styles.attendanceList}>
              {recentAttendance.map((r) => (
                <div key={r._id} className={styles.attRow}>
                  <div className={styles.attAvatar}>
                    {r.employee?.fullName?.[0] ?? '?'}
                  </div>
                  <div className={styles.attInfo}>
                    <span className={styles.attName}>{r.employee?.fullName}</span>
                    <span className={styles.attDept}>{r.employee?.department}</span>
                  </div>
                  <Badge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Departments */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>By Department</h2>
          </div>
          {!summary?.departments?.length ? (
            <p className={styles.noData}>No department data yet.</p>
          ) : (
            <div className={styles.deptList}>
              {summary.departments.map((d) => {
                const pct = Math.round((d.count / summary.totalEmployees) * 100);
                return (
                  <div key={d._id} className={styles.deptRow}>
                    <div className={styles.deptMeta}>
                      <span className={styles.deptName}>{d._id}</span>
                      <span className={styles.deptCount}>{d.count}</span>
                    </div>
                    <div className={styles.bar}>
                      <div className={styles.barFill} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <Link to="/employees" className={styles.quickBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Employee
        </Link>
        <Link to="/attendance" className={`${styles.quickBtn} ${styles.quickBtnSecondary}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            <path d="M9 16l2 2 4-4" />
          </svg>
          Mark Attendance
        </Link>
      </div>
    </div>
  );
}
