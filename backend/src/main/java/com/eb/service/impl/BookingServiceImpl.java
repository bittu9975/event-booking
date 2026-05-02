package com.eb.service.impl;

import com.eb.dto.BookingDTO;
import com.eb.entity.Booking;
import com.eb.entity.Event;
import com.eb.entity.User;
import com.eb.exception.CustomException;
import com.eb.repository.BookingRepository;
import com.eb.repository.EventRepository;
import com.eb.repository.UserRepository;
import com.eb.service.BookingService;
import com.eb.util.EmailService;
import com.eb.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final QRCodeGenerator qrCodeGenerator;
    private final EmailService emailService;

    @Override
    @Transactional
    public BookingDTO createBooking(BookingDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));

        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new CustomException("Event not found"));

        if (event.getAvailableSeats() < dto.getTickets()) {
            throw new CustomException("Not enough seats available. Only " +
                    event.getAvailableSeats() + " seats left.");
        }

        BigDecimal totalPrice = event.getPrice().multiply(BigDecimal.valueOf(dto.getTickets()));

        // Deduct seats
        event.setAvailableSeats(event.getAvailableSeats() - dto.getTickets());
        eventRepository.save(event);

        // Create booking
        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .tickets(dto.getTickets())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        booking = bookingRepository.save(booking);

        // Generate QR
        try {
            String qrContent = qrCodeGenerator.generateBookingQRContent(
                    booking.getId(), user.getId(), event.getId());
            String qrBase64 = qrCodeGenerator.generateQRCodeBase64(qrContent);
            booking.setQrCode(qrBase64);
            booking = bookingRepository.save(booking);
        } catch (Exception e) {
            log.error("QR generation failed: {}", e.getMessage());
        }

        // Send email async
        emailService.sendBookingConfirmation(booking);

        return toDTO(booking);
    }

    @Override
    public List<BookingDTO> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new CustomException("User not found"));
        return bookingRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingDTO cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new CustomException("Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new CustomException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new CustomException("Booking is already cancelled");
        }

        // Restore seats
        Event event = booking.getEvent();
        event.setAvailableSeats(event.getAvailableSeats() + booking.getTickets());
        eventRepository.save(event);

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        emailService.sendCancellationEmail(booking);

        return toDTO(booking);
    }

    @Override
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private BookingDTO toDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .eventId(booking.getEvent().getId())
                .eventTitle(booking.getEvent().getTitle())
                .eventLocation(booking.getEvent().getLocation())
                .eventDate(booking.getEvent().getDate())
                .tickets(booking.getTickets())
                .totalPrice(booking.getTotalPrice())
                .qrCode(booking.getQrCode())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .build();
    }
}
