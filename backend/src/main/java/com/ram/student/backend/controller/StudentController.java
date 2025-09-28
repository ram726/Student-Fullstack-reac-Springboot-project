package com.ram.student.backend.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ram.student.backend.model.Student;
import com.ram.student.backend.service.StudentService;

@RestController
@RequestMapping("/student")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {
    
    @Autowired
    private StudentService service;
    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> addStudent(
            @Validated @RequestPart("student") Student student,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {
        if (photo != null && !photo.isEmpty()) {
            // server-side validation: allowed types and max size
            String contentType = photo.getContentType();
            long maxSize = 2 * 1024 * 1024; // 2 MB
            if (contentType == null || 
                    !(contentType.equalsIgnoreCase(MediaType.IMAGE_JPEG_VALUE)
                      || contentType.equalsIgnoreCase(MediaType.IMAGE_PNG_VALUE)
                      || contentType.equalsIgnoreCase("image/gif"))) {
                throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image type. Allowed types: JPEG, PNG, GIF.");
            }

            if (photo.getSize() > maxSize) {
                throw new org.springframework.web.server.ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image size exceeds maximum allowed size of 2 MB.");
            }

            student.setPhoto(photo.getBytes());
            student.setPhotoContentType(contentType);
            student.setPhotoFileName(photo.getOriginalFilename());
        }
        Student saved = service.addStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/search/id/{studentId}")
    public ResponseEntity<Student> findByStudentId(@PathVariable String studentId) {
        return new ResponseEntity<>(service.findByStudentId(studentId), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email) {
        return new ResponseEntity<>(service.searchStudents(name, phone, email), HttpStatus.OK);
    }

    @PutMapping(value = "/update/{studentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Student> updateStudent(
            @PathVariable String studentId,
            @Validated @RequestPart("student") Student student,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {

        if (photo != null && !photo.isEmpty()) {
            String contentType = photo.getContentType();
            long maxSize = 2 * 1024 * 1024; // 2 MB
            if (contentType == null || 
                    !(contentType.equalsIgnoreCase(MediaType.IMAGE_JPEG_VALUE)
                      || contentType.equalsIgnoreCase(MediaType.IMAGE_PNG_VALUE)
                      || contentType.equalsIgnoreCase("image/gif"))) {
                throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image type. Allowed types: JPEG, PNG, GIF.");
            }

            if (photo.getSize() > maxSize) {
                throw new org.springframework.web.server.ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Image size exceeds maximum allowed size of 2 MB.");
            }

            student.setPhoto(photo.getBytes());
            student.setPhotoContentType(contentType);
            student.setPhotoFileName(photo.getOriginalFilename());
        }

        return new ResponseEntity<>(service.updateStudent(studentId, student), HttpStatus.OK);
    }

    @DeleteMapping("/delete/{studentId}")
    public ResponseEntity<String> deleteStudent(@PathVariable String studentId) {
        service.deleteStudent(studentId);
        return new ResponseEntity<>("Student deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Student>> getAllStudents() {
        return new ResponseEntity<>(service.getAllStudents(), HttpStatus.OK);
    }   

    @GetMapping(path = "/photo/{studentId}", produces = { MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE })
    public ResponseEntity<byte[]> getStudentPhoto(@PathVariable String studentId) {
        Student student = service.findByStudentId(studentId);
        byte[] photo = student.getPhoto();
        if (photo == null || photo.length == 0) {
            return ResponseEntity.notFound().build();
        }
        String contentType = student.getPhotoContentType();
        MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok().contentType(mediaType).body(photo);
    }

    @DeleteMapping("/photo/{studentId}")
    public ResponseEntity<String> removeStudentPhoto(@PathVariable String studentId) {
        service.removeStudentPhoto(studentId);
        return new ResponseEntity<>("Photo removed successfully", HttpStatus.OK);
    }
}
