package com.eb.dto;

import com.eb.entity.Booking;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;

    @NotNull
    private Long eventId;

    @NotNull @Min(1)
    private Integer tickets;

    // Response fields
    private String eventTitle;
    private String eventLocation;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventDate;
    private BigDecimal totalPrice;
    private String qrCode;
    private String status;
    private LocalDateTime createdAt;
    private String userName;
    private String userEmail;
}
