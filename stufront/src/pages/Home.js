import React from 'react'
import axios from '../services/axiosConfig'
import notificationService from '../services/notificationService';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Home() {

  const [students, setStudents] = useState([]);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // user-selectable: 8,16,32
  const [jumpPageInput, setJumpPageInput] = useState('');
  const [previewImage, setPreviewImage] = useState(null); // { url, name }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // no route params used here currently

  const deleteStudent = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/student/delete/${id}`);
      // optionally show a user-friendly message
      // Refresh the list after deletion
      const newList = students.filter(s => s.studentId !== id);
      setStudents(newList);
      // adjust current page if needed (e.g., last item on last page deleted)
      const newTotalPages = Math.max(1, Math.ceil(newList.length / pageSize));
      setCurrentPage((cur) => Math.min(cur, newTotalPages));
    } catch (err) {
      console.error('Failed to delete student', err);
      // show a friendly popup using the notification service
      const status = err.response ? err.response.status : null;
      const serverMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : null;
      notificationService.notify({ type: 'error', title: status ? `Error ${status}` : 'Delete failed', message: serverMessage || (err.message || 'Failed to delete') });
    } finally {
      // close modal if open
      setShowConfirm(false);
      setStudentToDelete(null);
    }

  }

  // Modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const onRequestDelete = (id) => {
    setStudentToDelete(id);
    setShowConfirm(true);
  }

  const onShowImage = (student) => {
    if (student && student.photoFileName) {
      setPreviewImage({ url: `http://localhost:8080/student/photo/${student.studentId}`, name: student.photoFileName });
    }
  }

  const onClosePreview = () => setPreviewImage(null);

  const onAbortDelete = () => {
    setShowConfirm(false);
    setStudentToDelete(null);
  }

  const onConfirmDelete = async () => {
    if (studentToDelete != null) {
      await deleteStudent(studentToDelete);
    }
  }

  useEffect(() => {
    const fetchAllStudentRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await axios.get("http://localhost:8080/student/all");
        // axios returns data on the response object
        setStudents(result.data || []);
        // reset to first page whenever we reload the list
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to fetch students', err);
        setError(err.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudentRecords();
  }, []);

  // Action menu component (three horizontal bars -> shows menu)
  const ActionMenu = ({ studentId }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
      const onDocClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }, []);

    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') setOpen(false);
    };

    // nicer styles
    const btnStyle = { padding: 6, minWidth: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 };
    const menuStyle = { position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#f3f8fbff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 2000, minWidth: 190, overflow: 'hidden' };
    const itemStyle = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer' };
    const itemHover = { background: '#86c4dbff' };

    return (
      <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
        <button
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          onKeyDown={onKey}
          className="btn btn-primary btn-sm"
          title="Actions"
          style={btnStyle}
        >
          {/* three horizontal bars (white) */}
          <span style={{ display: 'inline-block', width: 18 }} aria-hidden>
            <span style={{ display: 'block', height: 2, background: '#fff', margin: '2px 0', borderRadius: 2 }}></span>
            <span style={{ display: 'block', height: 2, background: '#fff', margin: '2px 0', borderRadius: 2 }}></span>
            <span style={{ display: 'block', height: 2, background: '#fff', margin: '2px 0', borderRadius: 2 }}></span>
          </span>
        </button>

        {open && (
          <div role="menu" aria-label="Actions" style={menuStyle}>
            <button role="menuitem" style={itemStyle} onClick={() => { setOpen(false); navigate(`/view/${studentId}`); }} onMouseEnter={(e) => e.currentTarget.style.background = itemHover.background} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {/* info icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 'bold' }}>More details</span>
            </button>

            <button role="menuitem" style={itemStyle} onClick={() => { setOpen(false); navigate(`/update/${studentId}`); }} onMouseEnter={(e) => e.currentTarget.style.background = itemHover.background} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {/* edit icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 'bold' }}>Edit</span>
            </button>

            <button role="menuitem" style={{ ...itemStyle, color: '#dc3545' }} onClick={() => { setOpen(false); onRequestDelete(studentId); }} onMouseEnter={(e) => e.currentTarget.style.background = itemHover.background} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {/* trash icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 'bold' }}>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil((students && students.length) ? students.length / pageSize : 1));
  const startIndex = (currentPage - 1) * pageSize;
  const displayedStudents = students.slice(startIndex, startIndex + pageSize);

  const goToPage = (p) => {
    const page = Math.max(1, Math.min(totalPages, Number(p) || 1));
    setCurrentPage(page);
    setJumpPageInput('');
  }

  const onPrev = () => goToPage(currentPage - 1);
  const onNext = () => goToPage(currentPage + 1);


  return (
    <div className="container-md">
      <div className="py-4">

        {loading && (
          <div className="mb-3">Loading students...</div>
        )}
        {error && (
          <div className="mb-3 text-danger">Error: {error}</div>
        )}

  <table className="table d-none d-md-table" cellPadding={5} cellSpacing={0} style={{ boxShadow: '0 0 10px rgba(0,0,0,0.15)' }}>
          <thead>
            <tr>
              <th style={{ color: 'blue' }} scope="col">S.No</th>
              <th style={{ color: 'blue' }}>Photo</th>
              <th style={{ color: 'blue' }}>Student Id</th>
              <th style={{ color: 'blue' }}>Name</th>
              <th style={{ color: 'blue' }}>City</th>

              <th style={{ color: 'crimson' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents && displayedStudents.length > 0 ? (
              displayedStudents.map((s, idx) => (

                <tr key={s.studentId || idx}>
                  <th scope="row">{startIndex + idx + 1}</th>
                  <td style={{ width: 80 }}>
                    {s.photoFileName ? (
                      <img src={`http://localhost:8080/student/photo/${s.studentId}`} alt="thumb" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', transition: 'transform .15s' }} onClick={() => onShowImage(s)} title="Click to enlarge" onMouseEnter={() => { /* could implement hover preview */ }} />
                    ) : (
                      <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: '#666' }} title="No photo available">
                        {/* simple user SVG icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                    )}
                  </td>
                  <td>{s.studentId}</td>
                  <td>{s.studentName}</td>
                  <td>{s.studentCity}</td>
                  <td>
                    <ActionMenu studentId={s.studentId} />
                  </td>
                </tr>

              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">No students found</td>
              </tr>
            )}
          </tbody>

          {/* Confirmation modal */}
          {showConfirm && (
            <div>
              {/* Backdrop */}
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000 }} onClick={onAbortDelete}></div>
              <div style={{
                position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                background: '#fff', padding: 20, borderRadius: 8, zIndex: 1001, width: 400, boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <h5 style={{ color: 'crimson' }}>Warning</h5>
                <p>Are you sure you want to delete student with id <strong>{studentToDelete}</strong>? This action cannot be undone.</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={onAbortDelete}>Abort Delete</button>
                  <button className="btn btn-danger" onClick={onConfirmDelete}>Continue Delete</button>
                </div>
              </div>
            </div>
          )}

        </table>

        {/* Compact stacked cards for small screens */}
        <div className="student-cards d-md-none">
          {displayedStudents && displayedStudents.length > 0 ? (
            displayedStudents.map((s, idx) => (
              <div className="student-card" key={s.studentId || idx}>
                <div className="card-thumb" onClick={() => onShowImage(s)} style={{ cursor: s.photoFileName ? 'pointer' : 'default' }}>
                  {s.photoFileName ? (
                    <img src={`http://localhost:8080/student/photo/${s.studentId}`} alt="thumb" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                </div>
                <div className="card-body">
                  <div className="card-title">{s.studentName}</div>
                  <div className="card-sub">ID: {s.studentId} • {s.studentCity}</div>
                </div>
                <div style={{ marginLeft: 8 }}>
                  <ActionMenu studentId={s.studentId} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted">No students found</div>
          )}
        </div>

        {/* Pagination controls */}
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div className="text-muted small d-flex align-items-center">
            <div>
              Total records: <strong>{students.length}</strong>
              <span className="mx-2">|</span>
              Showing <strong>{students.length === 0 ? 0 : startIndex + 1}</strong> to <strong>{Math.min(startIndex + displayedStudents.length, students.length)}</strong>
            </div>

            <div className="ms-3 d-flex align-items-center">
              <label className="me-2 small mb-0">Per page</label>
              <select className="form-select form-select-sm" value={pageSize} onChange={(e) => {
                const newSize = Number(e.target.value) || 8;
                // compute new total pages and clamp current page
                const newTotalPages = Math.max(1, Math.ceil(students.length / newSize));
                setPageSize(newSize);
                setCurrentPage((cur) => Math.min(cur, newTotalPages));
              }} style={{ width: 90 }} aria-label="Select page size">
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <nav aria-label="Student pagination">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" aria-label="First" onClick={() => goToPage(1)}>«</button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" aria-label="Previous" onClick={onPrev}>‹</button>
                </li>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  const isActive = pageNumber === currentPage;
                  return (
                    <li key={pageNumber} className={`page-item ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined}>
                      <button className="page-link" onClick={() => goToPage(pageNumber)}>{pageNumber}</button>
                    </li>
                  )
                })}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" aria-label="Next" onClick={onNext}>›</button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" aria-label="Last" onClick={() => goToPage(totalPages)}>»</button>
                </li>
              </ul>
            </nav>

            <div className="d-flex align-items-center ms-3">
              <label className="me-2 small mb-0">Jump to</label>
              <input value={jumpPageInput} onChange={(e) => setJumpPageInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') goToPage(jumpPageInput); }} style={{ width: 70 }} className="form-control form-control-sm" aria-label="Jump to page" />
              <button className="btn btn-sm btn-secondary ms-2" onClick={() => goToPage(jumpPageInput)}>Go</button>
            </div>
          </div>
        </div>

        {/* Image preview modal */}
        {previewImage && (
          <div>
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }} onClick={onClosePreview}></div>
            <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 2001 }}>
              <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm btn-secondary" onClick={onClosePreview}>Close</button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <img src={previewImage.url} alt={previewImage.name} style={{ maxWidth: '80vw', maxHeight: '80vh', display: 'block' }} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>


    </div>
  )
}
