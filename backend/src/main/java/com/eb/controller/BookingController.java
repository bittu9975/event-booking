package com.eb.controller;

import com.eb.dto.BookingDTO;
import com.eb.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingDTO dto,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.createBooking(dto, auth.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(Authentication auth) {
        return ResponseEntity.ok(bookingService.getMyBookings(auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable Long id,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, auth.getName()));
    }
}
