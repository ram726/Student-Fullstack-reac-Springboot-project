import React, { useState, useEffect } from 'react'
import axios from '../services/axiosConfig';
import notificationService from '../services/notificationService';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function EditUsers() {

    let navigate = useNavigate();
    const { id } = useParams();

    const [student, setStudent] = React.useState({
        studentName: "",
        studentCity: "",
        studentEmail: "",
        studentPhone: ""
    });

    // Keep a copy of the fetched original values so we can detect changes
    const [originalStudent, setOriginalStudent] = useState(null);

    const{studentName, studentCity, studentEmail, studentPhone} = student;
    const onInputChange = (e) => {
        const { name, value } = e.target;
        // If the phone field is being updated, coerce to Number (or keep empty string)
        if (name === 'studentPhone') {
            const parsed = value === '' ? '' : Number(value);
            setStudent({ ...student, [name]: parsed });
            return;
        }

        setStudent({ ...student, [name]: value });
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    // Photo handling
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [existingPhotoName, setExistingPhotoName] = useState(null);

    useEffect(() => {
        // Fetch student by id when component mounts
        const fetchStudent = async () => {
            try {
                setLoading(true);
                const resp = await axios.get(`http://localhost:8080/student/search/id/${id}`);
                const data = resp.data || {};

                // Ensure phone is represented as string for controlled input
                setStudent({
                    studentName: data.studentName || '',
                    studentCity: data.studentCity || '',
                    studentEmail: data.studentEmail || '',
                    studentPhone: data.studentPhone == null ? '' : String(data.studentPhone)
                });
                setOriginalStudent({
                    studentName: data.studentName || '',
                    studentCity: data.studentCity || '',
                    studentEmail: data.studentEmail || '',
                    studentPhone: data.studentPhone == null ? '' : String(data.studentPhone)
                });
                // set existing photo info (if any)
                setExistingPhotoName(data.photoFileName || null);
            } catch (err) {
                console.error('Failed to fetch student', err);
                setError(err?.response?.data?.message || 'Failed to load student');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchStudent();
    }, [id]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});
        // Prepare multipart form data so we can send an optional photo
        const payloadStudent = {
            ...student,
            studentPhone: student.studentPhone === '' ? null : Number(student.studentPhone)
        };

        const formData = new FormData();
        const studentBlob = new Blob([JSON.stringify(payloadStudent)], { type: 'application/json' });
        formData.append('student', studentBlob);
        // If a new file was selected, append it
        if (selectedFile) {
            formData.append('photo', selectedFile);
        }

        try {
            await axios.put(`http://localhost:8080/student/update/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            notificationService.notify({ type: 'success', title: 'Updated', message: `Student ${student.studentName} updated successfully!` });
            navigate("/");
        } catch (err) {
            console.error('Update failed', err);
            const serverMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : null;
            if (serverMessage && serverMessage.includes(':')) {
                const pairs = serverMessage.split(';').map(s => s.trim()).filter(Boolean);
                const errors = {};
                pairs.forEach(p => {
                    const idx = p.indexOf(':');
                    if (idx > 0) {
                        const key = p.substring(0, idx).trim();
                        const msg = p.substring(idx + 1).trim();
                        errors[key] = msg;
                    }
                });
                if (Object.keys(errors).length > 0) {
                    // set inline field errors only
                    setFieldErrors(errors);
                    return;
                }
            }

            setError(serverMessage || 'Failed to update student');
        }
    }

    // Helper to check if current form equals the original fetched values
    // Treat the form as changed if a new file has been selected (selectedFile != null)
    const isUnchanged = (() => {
        if (!originalStudent) return true; // treat as unchanged while original isn't loaded
        const fieldsEqual = (
            (student.studentName || '') === (originalStudent.studentName || '') &&
            (student.studentCity || '') === (originalStudent.studentCity || '') &&
            (student.studentEmail || '') === (originalStudent.studentEmail || '') &&
            (String(student.studentPhone || '') )=== (String(originalStudent.studentPhone || ''))
        );
        // If a new photo was selected, the form is considered changed
        if (selectedFile) return false;
        return fieldsEqual;
    })();

    // File change handler with validation and preview
    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }
        const allowed = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 2 * 1024 * 1024; // 2 MB
        if (!allowed.includes(file.type)) {
            notificationService.notify({ type: 'warning', title: 'Invalid file', message: 'Invalid image type. Allowed: JPEG, PNG, GIF.' });
            e.target.value = null;
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }
        if (file.size > maxSize) {
            notificationService.notify({ type: 'warning', title: 'File too large', message: 'Image too large. Maximum size is 2 MB.' });
            e.target.value = null;
            setSelectedFile(null);
            setPreviewUrl(null);
            return;
        }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = function (ev) {
            setPreviewUrl(ev.target.result);
        };
        reader.readAsDataURL(file);
    }

  return (   
    <div className="container-md">
    <div className = "row">
        <div className = "col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
           <h3 className="text-center m-4">Update Student</h3>
            {loading ? (
                <div className="text-center">Loading student...</div>
            ) : (
            <>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={(e) => onSubmit(e)}>
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">Name</label>
                    <input type={"text"} className={`form-control ${fieldErrors.studentName ? 'is-invalid' : ''}`} placeholder="Enter student name" name="studentName" pattern="[A-Za-z ]+" title="Please enter only letters"
                        required value={studentName} onChange={(e) => onInputChange(e)} aria-invalid={!!fieldErrors.studentName} aria-describedby={fieldErrors.studentName ? 'error-studentName' : undefined}
                    />
                    {fieldErrors.studentName && <div id="error-studentName" className="invalid-feedback d-block">{fieldErrors.studentName}</div>}
                  
                </div>
                <div className="mb-3">
                    <label htmlFor="City" className="form-label">City</label>
                    <input type={"text"}  className={`form-control ${fieldErrors.studentCity ? 'is-invalid' : ''}`} placeholder="Enter student city" name="studentCity" value={studentCity} onChange={(e) => onInputChange(e)} aria-invalid={!!fieldErrors.studentCity} aria-describedby={fieldErrors.studentCity ? 'error-studentCity' : undefined} />
                    {fieldErrors.studentCity && <div id="error-studentCity" className="invalid-feedback d-block">{fieldErrors.studentCity}</div>}
                </div> 
                <div className="mb-3">
                    <label htmlFor="Email" className="form-label">Email</label>
                    <input type="email" className={`form-control ${fieldErrors.studentEmail ? 'is-invalid' : ''}`} placeholder="Enter student email" name="studentEmail" pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
                        title="Please enter a valid email address" value={studentEmail} onChange={(e) => onInputChange(e)}
                        required aria-invalid={!!fieldErrors.studentEmail} aria-describedby={fieldErrors.studentEmail ? 'error-studentEmail' : undefined}
                    />
                    {fieldErrors.studentEmail && <div id="error-studentEmail" className="invalid-feedback d-block">{fieldErrors.studentEmail}</div>}
                </div>  
                <div className="mb-3" >
                    <label htmlFor="Phone" className="form-label" >Phone</label>
                    <input type={"number"} className={`form-control ${fieldErrors.studentPhone ? 'is-invalid' : ''}`} placeholder="Enter student phone"  name="studentPhone" value={studentPhone} onChange={(e) => onInputChange(e)} pattern="[0-9]{10}" title="Please enter a 10-digit phone number" required
                    aria-invalid={!!fieldErrors.studentPhone} aria-describedby={fieldErrors.studentPhone ? 'error-studentPhone' : undefined}
                    />
                    {fieldErrors.studentPhone && <div id="error-studentPhone" className="invalid-feedback d-block">{fieldErrors.studentPhone}</div>}
                </div>
                <div className="mb-3">
                    <label className="form-label">Photo (optional)</label>
                    <div className="mb-2">
                        {existingPhotoName ? (
                            <div style={{ marginBottom: 8 }}>
                                <div className="small text-muted">Current photo:</div>
                                <img src={`http://localhost:8080/student/photo/${id}`} alt="current" style={{ maxWidth: 160, maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
                            </div>
                        ) : (
                            <div style={{ marginBottom: 8 }} className="small text-muted">No current photo</div>
                        )}
                        {previewUrl && (
                            <div style={{ marginBottom: 8 }}>
                                <div className="small text-muted">New preview:</div>
                                <img src={previewUrl} alt="preview" style={{ maxWidth: 160, maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
                            </div>
                        )}
                    </div>
                    <input type="file" accept="image/*" className="form-control" onChange={onFileChange} />
                </div>
                                <button type="submit" className="btn btn-outline-success" disabled={loading || isUnchanged}>Update</button>
                                <Link to="/" className="btn btn-outline-danger mx-2">Cancel</Link>
                        </form>
                        </>
                        )}
        </div>
        </div>
        </div>
  )
}
