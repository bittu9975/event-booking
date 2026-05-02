package com.eb.repository;

import com.eb.entity.Booking;
import com.eb.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    List<Booking> findByEvent_Id(Long eventId);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = 'CONFIRMED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CONFIRMED'")
    long countActiveBookings();

    // PostgreSQL-compatible: use EXTRACT instead of MONTH()/YEAR()
    @Query("SELECT EXTRACT(MONTH FROM b.createdAt) as month, COUNT(b) as count " +
           "FROM Booking b WHERE EXTRACT(YEAR FROM b.createdAt) = EXTRACT(YEAR FROM CURRENT_DATE) " +
           "GROUP BY EXTRACT(MONTH FROM b.createdAt) ORDER BY month")
    List<Object[]> getMonthlyBookings();
}
