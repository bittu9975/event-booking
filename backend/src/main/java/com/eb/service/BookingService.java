package com.eb.service;

import com.eb.dto.BookingDTO;

import java.util.List;

public interface BookingService {
    BookingDTO createBooking(BookingDTO dto, String userEmail);
    List<BookingDTO> getMyBookings(String userEmail);
    BookingDTO cancelBooking(Long bookingId, String userEmail);
    List<BookingDTO> getAllBookings();
}
