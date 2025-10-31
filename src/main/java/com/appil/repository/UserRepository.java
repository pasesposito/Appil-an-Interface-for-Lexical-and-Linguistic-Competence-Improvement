package com.appil.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.appil.entity.User;

import jakarta.persistence.Table;


	@Table(name = "user")
	public interface UserRepository extends JpaRepository<User, Long> {
		
	   User findByEmail(String email);
	  
	   @Query("SELECT u.points FROM User u WHERE u.id = :id")
	    Long findPointsById(@Param("id") Long id);

	    @Modifying
	    @Transactional
	    @Query("UPDATE User u SET u.points = u.points - :points WHERE u.id = :id")
	    void subtractPointsById(@Param("id") Long id, @Param("points") Long points);

	    @Modifying
	    @Transactional
	    @Query("UPDATE User u SET u.points = u.points + :points WHERE u.id = :id")
	    void addPointsById(@Param("id") Long id, @Param("points") Long points);
	   
	   

	List<User> findByEnabled(boolean b);
	List<User> findByRole(User.Role role);
	    
	    
	}
