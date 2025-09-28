import React, { useState } from 'react'
import axios from '../services/axiosConfig';
import notificationService from '../services/notificationService';
import { Link, useNavigate } from 'react-router-dom';

export default function AddUsers() {

    let navigate = useNavigate();

    const [student, setStudent] = React.useState({
        studentName: "",
        studentCity: "",
        studentEmail: "",
        studentPhone: ""
    });

    const{studentName, studentCity, studentEmail, studentPhone} = student;
    // Submit should be disabled when any required field is empty
    const isSubmitDisabled = (
        studentName === '' ||
        studentCity === '' ||
        studentEmail === '' ||
        studentPhone === ''
    );
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

    const [alert, setAlert] = useState(null); // { type: 'success'|'danger'|'warning', message: string }
    const [showToast, setShowToast] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const onSubmit = async (e) => {
        e.preventDefault();

        // clear previous errors
        setFieldErrors({});
        setAlert(null);

        // client-side file validation already happened on file select, but ensure phone as number
        const payloadStudent = {
            ...student,
            studentPhone: student.studentPhone === '' ? null : Number(student.studentPhone)
        };

        const formData = new FormData();
        const studentBlob = new Blob([JSON.stringify(payloadStudent)], { type: 'application/json' });
        formData.append('student', studentBlob);
        if (selectedFile) {
            formData.append('photo', selectedFile);
        }

        try {
            await axios.post("http://localhost:8080/student/add", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // use global notification for success
            notificationService.notify({ type: 'success', title: 'Success', message: `Student ${student.studentName} added successfully!` });
            // navigate after brief delay so user sees message
            setTimeout(() => navigate('/'), 900);
        } catch (err) {
            const status = err.response ? err.response.status : null;
            const serverMessage = err.response && err.response.data && err.response.data.message ? err.response.data.message : null;
            // If server returned validation messages like "field: message; otherField: message", map them to the form
            if (serverMessage && serverMessage.includes(':')) {
                const pairs = serverMessage.split(';').map(s => s.trim()).filter(Boolean);
                const errors = {};
                pairs.forEach(p => {
                    const idx = p.indexOf(':');
                    if (idx > 0) {
                        const key = p.substring(0, idx).trim();
                        const msg = p.substring(idx + 1).trim();
                        // Map backend field names to form field keys if necessary
                        errors[key] = msg;
                    }
                });
                if (Object.keys(errors).length > 0) {
                    // set inline field errors only (no popups/toasts)
                    setFieldErrors(errors);
                    return;
                }
            }

            // Fallback messages
            let msg = 'Failed to add student.';
            if (status === 413) {
                msg = 'Uploaded image is too large. Maximum allowed size is 2 MB.';
            } else if (serverMessage) {
                msg = serverMessage;
            }
            // error notification will already be shown by axios interceptor but include fallback
            notificationService.notify({ type: 'error', title: status ? `Error ${status}` : 'Error', message: msg });
        }
    }

    // File state and preview
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

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
            <h2 className="text-center m-4">Register Student</h2>
            <form onSubmit={(e) => onSubmit(e)}>
                <div className="mb-3">
                    <label htmlFor="Name" className="form-label">Name</label>
                    <input type={"text"} className={`form-control ${fieldErrors.studentName ? 'is-invalid' : ''}`} placeholder="Enter student name" name="studentName" pattern="[A-Za-z ]+" title="Please enter only letters"
                        required value={studentName} onChange={(e) => onInputChange(e)}
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
                        required
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
                    <label htmlFor="Photo" className="form-label">Photo (optional)</label>
                    <input type="file" accept="image/*" className="form-control" onChange={onFileChange} />
                    {previewUrl && (
                        <div className="mt-2">
                            <img src={previewUrl} alt="preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                        </div>
                    )}
                </div>
                <button type="submit" className="btn btn-outline-success" disabled={isSubmitDisabled}>Submit</button>
                <Link to="/" className="btn btn-outline-danger mx-2">Cancel</Link>
            </form>
            {/* Toast container */}
            <div aria-live="polite" aria-atomic="true" className="position-relative">
                <div className="toast-container position-fixed bottom-0 end-0 p-3">
                    {showToast && alert && (
                        <div className={`toast align-items-center text-bg-${alert.type} border-0 show`} role="alert" aria-live="assertive" aria-atomic="true">
                            <div className="d-flex">
                                <div className="toast-body">{alert.message}</div>
                                <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => { setShowToast(false); setAlert(null); }}></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    </div>
    </div>
    </div>
  )
}
