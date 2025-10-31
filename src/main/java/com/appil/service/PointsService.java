package com.appil.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.appil.repository.UserRepository;

@Service
public class PointsService {

	@Autowired
    private UserRepository userRepository;

   
        public boolean subtractPoints(Long userId, Long points) {
        if (points <= 0) {
            return false;
        }

        Long currentPoints = userRepository.findPointsById(userId);
        if (currentPoints == null || currentPoints < points) {
            return false;
        }

        try {
            userRepository.subtractPointsById(userId, points);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean addPoints(Long userId, Long points) {
        if (points <= 0) {
            return false;
        }

        try {
            userRepository.addPointsById(userId, points);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Subtract points for a specific user.
     *
     * @param userId The ID of the user.
     * @param points The number of points to subtract.
     * @return True if points were successfully subtracted, false otherwise.
     */
//    public boolean subtractPoints(Long userId, int points) {
//        String sql = "UPDATE appil.user SET points = points - ? WHERE id = ?";
//        int rowsAffected = jdbcTemplate.update(sql, points, userId);
//        return rowsAffected > 0;
//    }
//    
//    
//    public boolean addPoints(Long userId, int points) {
//        String sql = "UPDATE appil.user SET points = points + ? WHERE id = ?";
//        int rowsAffected = jdbcTemplate.update(sql, points, userId);
//        return rowsAffected > 0;
//    }
//    
    
}
