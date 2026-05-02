package com.eb.util;

import com.eb.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            if (!isMailConfigured()) {
                log.warn("Mail not configured — skipping email");
                return;
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("✅ Booking Confirmed - " + booking.getEvent().getTitle());
            helper.setText(buildBookingHtml(booking), true);

            mailSender.send(message);
            log.info("Booking confirmation email sent to {}", booking.getUser().getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send booking email: {}", e.getMessage());
        }
    }

    @Async
    public void sendCancellationEmail(Booking booking) {
        try {
            if (!isMailConfigured()) {
                log.warn("Mail not configured — skipping email");
                return;
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUser().getEmail());
            helper.setSubject("❌ Booking Cancelled - " + booking.getEvent().getTitle());
            helper.setText(buildCancellationHtml(booking), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send cancellation email: {}", e.getMessage());
        }
    }

    private String buildBookingHtml(Booking booking) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Booking Confirmed! 🎉</h1>
              </div>
              <div style="padding: 30px; background: #f9fafb;">
                <p style="font-size: 16px;">Hi <strong>%s</strong>,</p>
                <p>Your booking has been confirmed. Here are your details:</p>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <h2 style="color: #6366f1; margin-top: 0;">%s</h2>
                  <p>📅 <strong>Date:</strong> %s</p>
                  <p>📍 <strong>Location:</strong> %s</p>
                  <p>🎟️ <strong>Tickets:</strong> %d</p>
                  <p>💰 <strong>Total Paid:</strong> ₹%.2f</p>
                  <p>🆔 <strong>Booking ID:</strong> #%d</p>
                </div>
                <div style="text-align: center; margin: 20px 0;">
                  <p><strong>Your QR Code (for entry):</strong></p>
                  <img src="%s" width="200" height="200" alt="QR Code" />
                </div>
                <p style="color: #6b7280; font-size: 14px;">Show this QR code at the event entrance.</p>
              </div>
              <div style="background: #374151; color: #9ca3af; text-align: center; padding: 15px; font-size: 12px;">
                EventBook &copy; 2024 — All rights reserved
              </div>
            </div>
            """.formatted(
                booking.getUser().getName(),
                booking.getEvent().getTitle(),
                booking.getEvent().getDate().format(FORMATTER),
                booking.getEvent().getLocation(),
                booking.getTickets(),
                booking.getTotalPrice(),
                booking.getId(),
                booking.getQrCode()
        );
    }

    private String buildCancellationHtml(Booking booking) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #ef4444; padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
              </div>
              <div style="padding: 30px;">
                <p>Hi <strong>%s</strong>,</p>
                <p>Your booking for <strong>%s</strong> (Booking #%d) has been cancelled.</p>
                <p>If you have questions, please contact support.</p>
              </div>
            </div>
            """.formatted(
                booking.getUser().getName(),
                booking.getEvent().getTitle(),
                booking.getId()
        );
    }

    @Value("${spring.mail.username:}")
    private String mailUsername;

    private boolean isMailConfigured() {
        return mailUsername != null
                && !mailUsername.isBlank()
                && !mailUsername.equals("your-email@gmail.com");
    }
}
