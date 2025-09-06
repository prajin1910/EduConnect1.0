package com.stjoseph.assessmentsystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class OTPVerificationRequest {
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    private String otp;
    
    public OTPVerificationRequest() {}
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}