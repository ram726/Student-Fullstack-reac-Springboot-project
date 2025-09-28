package com.ram.student.backend.reopository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ram.student.backend.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);
    boolean existsByStudentEmail(String studentEmail);
    boolean existsByStudentPhone(Long studentPhone);
    
    List<Student> findByStudentNameOrStudentPhoneOrStudentEmail(String studentName, Long studentPhone, String studentEmail);

}



