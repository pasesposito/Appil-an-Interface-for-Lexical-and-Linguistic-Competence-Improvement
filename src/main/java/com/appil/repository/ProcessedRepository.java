package com.appil.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appil.entity.Processed;

@Repository
public interface ProcessedRepository extends JpaRepository<Processed, Long> {

    boolean existsByUserIdAndText(long userId, String text);
    
     List<Processed> findAllByUserId(Long userId);
     
}
