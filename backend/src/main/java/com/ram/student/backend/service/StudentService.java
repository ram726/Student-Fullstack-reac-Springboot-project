package com.ram.student.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ram.student.backend.model.Student;
import com.ram.student.backend.reopository.StudentRepository;

@Service
public class StudentService {

@Autowired
private StudentRepository repository;


    public Student addStudent(Student student) {
        
        validateStudent(student);

        if (student.getStudentEmail() != null && !student.getStudentEmail().trim().isEmpty()) {
            if (repository.existsByStudentEmail(student.getStudentEmail())) {
                throw new IllegalArgumentException("Student already exists with same email: " + student.getStudentEmail());
            }
        }

        if (student.getStudentPhone() != null) {
            if (repository.existsByStudentPhone(student.getStudentPhone())) {
                throw new IllegalArgumentException("Student already exists with same phone: " + student.getStudentPhone());
            }
        }

        validateStudent(student);
        String generatedId = generateId(student);
        student.setStudentId(generatedId);
        return repository.save(student);
    }

    public Student findByStudentId(String studentId) {
        if (studentId == null || studentId.trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID cannot be empty");
        }
        return repository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
    }

    public List<Student> searchStudents(String name, String phone, String email) {
        if (name == null && phone == null && email == null) {
            return repository.findAll();
        }
        String nameParam = name != null ? name : "";
        String emailParam = email != null ? email : "";

        Long phoneParam = null;
        if (phone != null && !phone.trim().isEmpty()) {
            try {
                phoneParam = Long.parseLong(phone);
            } catch (NumberFormatException ex) {

                phoneParam = null;
            }
        }

        return repository.findByStudentNameOrStudentPhoneOrStudentEmail(
                nameParam,
                phoneParam,
                emailParam);
    }

    public Student updateStudent(String studentId, Student student) {
        validateStudent(student);
    Student existingStudent = repository.findByStudentId(studentId)
        .orElseThrow(() -> new RuntimeException(
            "student is not present with this id "+studentId+" to update"));

        existingStudent.setStudentName(student.getStudentName());
        existingStudent.setStudentCity(student.getStudentCity());
        existingStudent.setStudentPhone(student.getStudentPhone());
        existingStudent.setStudentEmail(student.getStudentEmail());
        // if photo is provided in the request (byte[]), update photo fields
        if (student.getPhoto() != null && student.getPhoto().length > 0) {
            existingStudent.setPhoto(student.getPhoto());
            existingStudent.setPhotoContentType(student.getPhotoContentType());
            existingStudent.setPhotoFileName(student.getPhotoFileName());
        }
        // createdAt should remain unchanged; updatedAt will be set by @PreUpdate in entity
        return repository.save(existingStudent);
    }

    public void deleteStudent(String studentId) {
     Student student = repository.findByStudentId(studentId)
        .orElseThrow(() -> new RuntimeException(
            "student is not present with this id "+studentId+" to delete"));
        repository.delete(student);
    }

    // remove only the photo fields for a student (keep other data)
    public void removeStudentPhoto(String studentId) {
        Student existingStudent = repository.findByStudentId(studentId)
            .orElseThrow(() -> new RuntimeException("student is not present with this id "+studentId+" to remove photo"));
        existingStudent.setPhoto(null);
        existingStudent.setPhotoContentType(null);
        existingStudent.setPhotoFileName(null);
        repository.save(existingStudent);
    }

  
    private void validateStudent(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Student cannot be null");
        }
        if (student.getStudentName() == null || student.getStudentName().trim().isEmpty()) {
            throw new IllegalArgumentException("Student name cannot be empty");
        }
        if (student.getStudentEmail() == null || !student.getStudentEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
     
    }

    private String generateId(Student student) {
            
            Long phoneLong = student.getStudentPhone();
            String phoneStr = phoneLong != null ? String.valueOf(phoneLong) : "";

            if (phoneStr.length() < 3) {
                phoneStr = String.format("%3s", phoneStr).replace(' ', '0');
            }
            String lastThreeDigits = phoneStr.substring(Math.max(0, phoneStr.length() - 3));

            String name = student.getStudentName() != null ? student.getStudentName().toUpperCase() : "";
            String firstTwoInitials = name.length() > 1 ? name.substring(0, 2) : (name.length() == 1 ? name + "X" : "XX");

            int randomNum = (int) (Math.random() * 10000);
            String formattedRandom = String.format("%04d", randomNum);

            String generatedId = "STU" + lastThreeDigits + firstTwoInitials + formattedRandom;
            return generatedId;
        }

    public List<Student> getAllStudents() {
       return repository.findAll();
    }
   }
