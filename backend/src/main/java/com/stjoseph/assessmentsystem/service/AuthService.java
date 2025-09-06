package com.stjoseph.assessmentsystem.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.stjoseph.assessmentsystem.dto.LoginRequest;
import com.stjoseph.assessmentsystem.dto.LoginResponse;
import com.stjoseph.assessmentsystem.dto.OTPVerificationRequest;
import com.stjoseph.assessmentsystem.dto.RegisterRequest;
import com.stjoseph.assessmentsystem.model.Alumni;
import com.stjoseph.assessmentsystem.model.OTPVerification;
import com.stjoseph.assessmentsystem.model.User;
import com.stjoseph.assessmentsystem.repository.AlumniRepository;
import com.stjoseph.assessmentsystem.repository.OTPVerificationRepository;
import com.stjoseph.assessmentsystem.repository.UserRepository;
import com.stjoseph.assessmentsystem.security.JwtUtils;
import com.stjoseph.assessmentsystem.security.UserDetailsImpl;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private OTPVerificationRepository otpRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private EmailService emailService;
    
    public String registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already taken!");
        }
        
        if (!signUpRequest.getEmail().endsWith("@stjosephstechnology.ac.in")) {
            throw new RuntimeException("Error: Please use your college email address!");
        }
        
        if (signUpRequest.getPassword() == null || signUpRequest.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Error: Password is required!");
        }
        
        // Generate OTP
        String otp = generateOTP();
        
        // Save OTP verification
        OTPVerification otpVerification = new OTPVerification();
        otpVerification.setEmail(signUpRequest.getEmail());
        otpVerification.setOtp(otp);
        otpVerification.setType(OTPVerification.OTPType.REGISTRATION);
        
        // Delete existing OTP if any
        otpRepository.deleteByEmail(signUpRequest.getEmail());
        otpRepository.save(otpVerification);
        
        // Create user but don't save yet
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setPhoneNumber(signUpRequest.getPhoneNumber());
        user.setDepartment(signUpRequest.getDepartment());
        user.setClassName(signUpRequest.getClassName());
        user.setRole(User.UserRole.valueOf(signUpRequest.getRole().toUpperCase()));
        user.setVerified(false);
        
        userRepository.save(user);
        
        // Log activity (removed for simplicity)
        System.out.println("AuthService: New " + user.getRole().toString().toLowerCase() + " registered: " + user.getName());
        
        // Send OTP email
        emailService.sendOTP(signUpRequest.getEmail(), otp);
        
        return "User registered successfully. Please verify your email with OTP sent to " + signUpRequest.getEmail();
    }
    
    public String registerAlumni(RegisterRequest signUpRequest) {
        if (alumniRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already registered!");
        }
        
        Alumni alumni = new Alumni();
        alumni.setName(signUpRequest.getName());
        alumni.setEmail(signUpRequest.getEmail());
        alumni.setPhoneNumber(signUpRequest.getPhoneNumber());
        alumni.setGraduationYear(signUpRequest.getGraduationYear());
        alumni.setBatch(signUpRequest.getBatch());
        alumni.setPlacedCompany(signUpRequest.getPlacedCompany());
        alumni.setDepartment(signUpRequest.getDepartment());
        alumni.setStatus(Alumni.AlumniStatus.PENDING);
        
        alumniRepository.save(alumni);
        
        // Log activity (removed for simplicity)
        System.out.println("AuthService: New alumni registration request: " + alumni.getName());
        
        return "Alumni registration successful. Please wait for management approval.";
    }
    
    public String verifyOTP(OTPVerificationRequest request) {
        OTPVerification otpVerification = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found for this email"));
        
        if (otpVerification.isExpired()) {
            otpRepository.delete(otpVerification);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        
        if (!otpVerification.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        
        // Verify user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setVerified(true);
        userRepository.save(user);
        
        // Delete OTP
        otpRepository.delete(otpVerification);
        
        return "Email verified successfully. You can now login.";
    }
    
    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        // Special handling for management login
        if (loginRequest.getEmail().endsWith("@stjosephstechnology.ac.in") && 
            "tech@123".equals(loginRequest.getPassword())) {
            
            // Create or get management user
            User managementUser = userRepository.findByEmail(loginRequest.getEmail())
                .orElseGet(() -> {
                    User newManagementUser = new User();
                    newManagementUser.setName("Management");
                    newManagementUser.setEmail(loginRequest.getEmail());
                    newManagementUser.setPassword(encoder.encode("tech@123"));
                    newManagementUser.setRole(User.UserRole.MANAGEMENT);
                    newManagementUser.setVerified(true);
                    return userRepository.save(newManagementUser);
                });
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), "tech@123"));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Update last login
            managementUser.setLastLogin(LocalDateTime.now());
            userRepository.save(managementUser);
            
            return new LoginResponse(jwt, userDetails.getId(), userDetails.getEmail(), 
                                   userDetails.getName(), "MANAGEMENT", null, null, null, true);
        }
        
        // Regular user login
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Update last login
        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());
        String role = "ALUMNI"; // Default to ALUMNI if not found in User collection
        String department = null;
        String className = null;
        String phoneNumber = null;
        Boolean verified = true;
        
        if (user.isPresent()) {
            User foundUser = user.get();
            foundUser.setLastLogin(LocalDateTime.now());
            userRepository.save(foundUser);
            role = foundUser.getRole().name();
            department = foundUser.getDepartment();
            className = foundUser.getClassName();
            phoneNumber = foundUser.getPhoneNumber();
            verified = foundUser.isVerified();
        } else {
            // Check if this is an alumni login
            Optional<Alumni> alumni = alumniRepository.findByEmail(loginRequest.getEmail());
            if (alumni.isPresent()) {
                Alumni foundAlumni = alumni.get();
                foundAlumni.setLastLogin(LocalDateTime.now());
                alumniRepository.save(foundAlumni);
                department = foundAlumni.getDepartment();
                phoneNumber = foundAlumni.getPhoneNumber();
                verified = foundAlumni.getStatus() == Alumni.AlumniStatus.APPROVED;
            }
        }
        
        return new LoginResponse(jwt, userDetails.getId(), userDetails.getEmail(), 
                               userDetails.getName(), role, department, className, phoneNumber, verified);
    }
    
    public String resendOTP(String email) {
        OTPVerification existingOtp = otpRepository.findByEmail(email).orElse(null);
        if (existingOtp != null) {
            otpRepository.delete(existingOtp);
        }
        
        String otp = generateOTP();
        OTPVerification otpVerification = new OTPVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtp(otp);
        otpVerification.setType(OTPVerification.OTPType.REGISTRATION);
        
        otpRepository.save(otpVerification);
        emailService.sendOTP(email, otp);
        
        return "OTP sent successfully to " + email;
    }
    
    private String generateOTP() {
        Random random = new Random();
        return String.format("%04d", random.nextInt(10000));
    }
    
    public String cleanupDuplicateUsers() {
        List<User> allUsers = userRepository.findAll();
        Map<String, List<User>> usersByEmail = allUsers.stream()
                .collect(Collectors.groupingBy(User::getEmail));
        
        int duplicatesRemoved = 0;
        for (Map.Entry<String, List<User>> entry : usersByEmail.entrySet()) {
            List<User> usersWithSameEmail = entry.getValue();
            if (usersWithSameEmail.size() > 1) {
                // Keep the most recent user (or the verified one)
                User userToKeep = usersWithSameEmail.stream()
                        .filter(User::isVerified)
                        .findFirst()
                        .orElse(usersWithSameEmail.get(0));
                
                // Remove the others
                for (User user : usersWithSameEmail) {
                    if (!user.getId().equals(userToKeep.getId())) {
                        userRepository.delete(user);
                        duplicatesRemoved++;
                    }
                }
            }
        }
        
        return "Cleaned up " + duplicatesRemoved + " duplicate user records.";
    }
    
    public String changePassword(String userEmail, String currentPassword, String newPassword) {
        // First try to find in User repository
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Verify current password
            if (!encoder.matches(currentPassword, user.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            
            // Update password
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
            
            return "Password changed successfully";
        }
        
        // If not found in User repository, check Alumni repository
        Optional<Alumni> alumniOpt = alumniRepository.findByEmail(userEmail);
        if (alumniOpt.isPresent()) {
            Alumni alumni = alumniOpt.get();
            
            // Verify current password
            if (alumni.getPassword() == null || !encoder.matches(currentPassword, alumni.getPassword())) {
                throw new RuntimeException("Current password is incorrect");
            }
            
            // Update password
            alumni.setPassword(encoder.encode(newPassword));
            alumniRepository.save(alumni);
            
            return "Password changed successfully";
        }
        
        throw new RuntimeException("User not found");
    }
}