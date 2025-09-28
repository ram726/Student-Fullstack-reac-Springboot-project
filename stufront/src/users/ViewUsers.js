import React, { useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom';
import axios from '../services/axiosConfig';

export default function ViewUsers() {
    const [student, setStudent] = React.useState({
        studentName: "John Doe",
        studentCity: "New York",
        studentEmail: "john.doe@example.com",
        studentPhone: "1234567890"
    });
    const { id } = useParams();

    const loadStudent = useCallback(async () => {
        const result = await axios.get(`http://localhost:8080/student/search/id/${id}`);
        setStudent(result.data);
    }, [id]);

    // modal / preview state for image zoom and actions
    const [showImageModal, setShowImageModal] = React.useState(false);
    const [zoom, setZoom] = React.useState(1);

    const openImageModal = () => {
        setZoom(1);
        setShowImageModal(true);
    }

    const closeImageModal = () => {
        setShowImageModal(false);
        setZoom(1);
    }

    const zoomIn = () => setZoom(z => Math.min(3, +(z + 0.2).toFixed(2)));
    const zoomOut = () => setZoom(z => Math.max(0.2, +(z - 0.2).toFixed(2)));
    const resetZoom = () => setZoom(1);



    useEffect(() => {
        loadStudent();
    }, [loadStudent]);

    return (
        <div className="container-md">

            <div className="row">
                <div className="col-md-8 offset-md-2 border rounded p-4 mt-4 shadow-sm bg-white">
                    <h3 className="text-center mb-4">Viewing Student Details</h3>

                    <div className="card">
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                                {student.photoFileName ? (
                                    <img src={`http://localhost:8080/student/photo/${student.studentId}`} alt="profile" style={{ width: 220, height: 220, objectFit: 'cover', borderRadius: 8, display: 'block', cursor: 'pointer' }} onClick={openImageModal} title="Click to open" />
                                ) : (
                                    <div style={{ width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#f8f9fa' }} title="No photo available">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <small className="text-muted">Student ID</small>
                                <div className="fw-bold">{student.studentId ?? '-'}</div>
                            </div>
                        </div>
                        <div className="card-body">

                            <div className="row g-2">
                                {/* Compact two-column label/value pairs */}
                                {/** We'll render each field as a small card with label and value side-by-side to save vertical space */}
                                <div className="col-12">
                                    <div className="details-grid">
                                        <div className="details-item">
                                            <div className="details-label">Name</div>
                                            <div className="details-value">{student.studentName || '-'}</div>
                                        </div>

                                        <div className="details-item">
                                            <div className="details-label">City</div>
                                            <div className="details-value">{student.studentCity || '-'}</div>
                                        </div>

                                        <div className="details-item">
                                            <div className="details-label">Email</div>
                                            <div className="details-value" title={student.studentEmail || ''}>
                                                {student.studentEmail ? (
                                                    <a href={`mailto:${student.studentEmail}`}>{student.studentEmail}</a>
                                                ) : '-'}
                                            </div>
                                        </div>

                                        <div className="details-item">
                                            <div className="details-label">Phone</div>
                                            <div className="details-value">{student.studentPhone ? (<a href={`tel:${student.studentPhone}`}>{student.studentPhone}</a>) : '-'}</div>
                                        </div>

                                        <div className="details-item">
                                            <div className="details-label">Created</div>
                                            <div className="details-value">{student.createdAt ? (new Date(student.createdAt).toLocaleString()) : '-'}</div>
                                        </div>

                                        <div className="details-item">
                                            <div className="details-label">Last Updated</div>
                                            <div className="details-value" style={{ fontWeight: 700, color: '#2f6f3a' }}>{student.updatedAt ? (new Date(student.updatedAt).toLocaleString()) : '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr></hr>

                            <div>

                                <div className=" mb-3">
                                    <div>
                                        <Link to={`/update/${student.studentId}`} className="btn btn-outline-primary btn-sm">Update This</Link>
                                    </div><br />
                                    <div>
                                        <Link to="/" className="btn btn-outline-dark btn-sm">Back</Link>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Image modal */}
            {showImageModal && (
                <div>
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }} onClick={closeImageModal}></div>
                    <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 2001, maxWidth: '90vw', maxHeight: '90vh' }}>
                        <div style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={zoomOut}>-</button>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={resetZoom}>Reset</button>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={zoomIn}>+</button>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>

                                    <button className="btn btn-sm btn-secondary" onClick={closeImageModal}>Close</button>
                                </div>
                            </div>
                            <div style={{ overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={`http://localhost:8080/student/photo/${student.studentId}`} alt="preview" style={{ transform: `scale(${zoom})`, maxWidth: '80vw', maxHeight: '80vh', transition: 'transform .12s' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
