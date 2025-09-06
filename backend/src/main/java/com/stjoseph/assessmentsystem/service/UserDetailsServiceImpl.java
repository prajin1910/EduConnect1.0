package com.stjoseph.assessmentsystem.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;
import com.stjoseph.assessmentsystem.security.UserDetailsImpl;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    AlumniRepository alumniRepository;
    
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // First try to find in User collection
        Optional<User> user = userRepository.findByEmail(username);
        if (user.isPresent()) {
            return UserDetailsImpl.build(user.get());
        }
        
        // If not found in User collection, check Alumni collection
        Optional<Alumni> alumni = alumniRepository.findByEmail(username);
        if (alumni.isPresent() && alumni.get().getStatus() == Alumni.AlumniStatus.APPROVED) {
            // Convert Alumni to User-like object for authentication
            User alumniAsUser = convertAlumniToUser(alumni.get());
            return UserDetailsImpl.build(alumniAsUser);
        }
        
        throw new UsernameNotFoundException("User Not Found with email: " + username);
    }
    
    private User convertAlumniToUser(Alumni alumni) {
        User user = new User();
        user.setId(alumni.getId());
        user.setEmail(alumni.getEmail());
        user.setName(alumni.getName());
        user.setPassword(alumni.getPassword());
        user.setRole(User.UserRole.ALUMNI);
        user.setVerified(alumni.isVerified());
        user.setPhoneNumber(alumni.getPhoneNumber());
        user.setDepartment(alumni.getDepartment());
        user.setLastLogin(alumni.getLastLogin());
        return user;
    }
}