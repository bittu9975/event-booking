package com.eb.service.impl;

import com.eb.dto.AdminStatsDTO;
import com.eb.repository.BookingRepository;
import com.eb.repository.EventRepository;
import com.eb.repository.UserRepository;
import com.eb.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;

    @Override
    public AdminStatsDTO getDashboardStats() {
        // Monthly bookings
        List<Object[]> rawMonthly = bookingRepository.getMonthlyBookings();
        List<Map<String, Object>> bookingsByMonth = new ArrayList<>();
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        for (Object[] row : rawMonthly) {
            Map<String, Object> entry = new HashMap<>();
            int monthIdx = ((Number) row[0]).intValue() - 1;
            entry.put("month", months[monthIdx]);
            entry.put("count", ((Number) row[1]).longValue());
            bookingsByMonth.add(entry);
        }

        // Top events
        List<Object[]> rawTop = eventRepository.getTopEventsByBookings(PageRequest.of(0, 5));
        List<Map<String, Object>> topEvents = new ArrayList<>();
        for (Object[] row : rawTop) {
            var event = (com.eb.entity.Event) row[0];
            Map<String, Object> entry = new HashMap<>();
            entry.put("title", event.getTitle());
            entry.put("bookings", ((Number) row[1]).longValue());
            entry.put("category", event.getCategory());
            topEvents.add(entry);
        }

        // Revenue by category
        List<Object[]> rawRevenue = eventRepository.getRevenueByCategory();
        List<Map<String, Object>> revenueByCategory = new ArrayList<>();
        for (Object[] row : rawRevenue) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("category", row[0]);
            entry.put("bookings", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            entry.put("revenue", row[2] != null ? row[2] : BigDecimal.ZERO);
            revenueByCategory.add(entry);
        }

        return AdminStatsDTO.builder()
                .totalUsers(userRepository.count())
                .totalEvents(eventRepository.count())
                .totalBookings(bookingRepository.count())
                .activeBookings(bookingRepository.countActiveBookings())
                .totalRevenue(bookingRepository.getTotalRevenue())
                .bookingsByMonth(bookingsByMonth)
                .topEvents(topEvents)
                .revenueByCategory(revenueByCategory)
                .build();
    }
}
