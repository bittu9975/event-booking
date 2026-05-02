package com.eb.repository;

import com.eb.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    Page<Event> findByCategory(String category, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE " +
            "(COALESCE(:search, '') = '' OR " +
            " LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            " LOWER(e.location) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:category IS NULL OR :category = '' OR e.category = :category)")
    Page<Event> searchEvents(@Param("search") String search,
                             @Param("category") String category,
                             Pageable pageable);

    @Query("SELECT e.category as category, COUNT(b) as count, SUM(b.totalPrice) as revenue " +
           "FROM Event e LEFT JOIN Booking b ON b.event = e " +
           "GROUP BY e.category")
    List<Object[]> getRevenueByCategory();

    @Query("SELECT e, COUNT(b) as bookingCount FROM Event e " +
           "LEFT JOIN Booking b ON b.event = e " +
           "GROUP BY e ORDER BY bookingCount DESC")
    List<Object[]> getTopEventsByBookings(Pageable pageable);
}
