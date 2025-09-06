package com.stjoseph.assessmentsystem.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Async
    public void sendOTP(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Email Verification - St. Joseph's Assessment System");
        message.setText("Your verification OTP is: " + otp + "\n\nThis OTP will expire in 5 minutes.\n\nRegards,\nSt. Joseph's Assessment System");
        
        mailSender.send(message);
    }
    
    @Async
    public void sendAssessmentNotification(String email, String assessmentTitle, String startTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("New Assessment Assigned - " + assessmentTitle);
        message.setText("A new assessment '" + assessmentTitle + "' has been assigned to you.\n\n" +
                       "Start Time: " + startTime + "\n\n" +
                       "Please log in to your portal to take the assessment.\n\n" +
                       "Regards,\nSt. Joseph's Assessment System");
        
        mailSender.send(message);
    }
    
    @Async
    public void sendChatNotification(String email, String senderName, String message) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject("New Message from " + senderName);
        mailMessage.setText(senderName + " has sent you a message:\n\n" + message + "\n\n" +
                           "Please log in to your portal to reply.\n\n" +
                           "Regards,\nSt. Joseph's Assessment System");
        
        mailSender.send(mailMessage);
    }
    
    @Async
    public void sendAlumniApprovalNotification(String email, boolean approved) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        
        if (approved) {
            message.setSubject("Alumni Verification Approved - Login Credentials");
            message.setText("Congratulations! Your verification as an alumnus has been approved by the management.\n\n" +
                           "Login Details:\n" +
                           "Email: " + email + "\n" +
                           "Password: alumni123\n\n" +
                           "Please login and change your password immediately for security.\n\n" +
                           "You can now access the alumni portal at: [Portal URL]\n\n" +
                           "Regards,\nSt. Joseph's Assessment System");
        } else {
            message.setSubject("Alumni Verification Status Update");
            message.setText("We regret to inform you that your alumni verification application has been reviewed.\n\n" +
                           "Please contact the management directly for more information regarding the status.\n\n" +
                           "You may reapply with additional documentation if needed.\n\n" +
                           "Regards,\nSt. Joseph's Assessment System");
        }
        
        mailSender.send(message);
    }
    
    @Async
    public void sendSimpleMessage(String email, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject(subject);
        message.setText(text + "\n\nRegards,\nSt. Joseph's Assessment System");
        
        mailSender.send(message);
    }
}