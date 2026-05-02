package com.eb.dto;

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
public class EventDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull @DecimalMin("0.0")
    private BigDecimal price;

    @NotNull @Min(1)
    private Integer totalSeats;

    private Integer availableSeats;
    private String imageUrl;

    @NotBlank
    private String category;

    private String createdByName;
    private LocalDateTime createdAt;
}
