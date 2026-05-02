package com.eb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private long activeBookings;
    private BigDecimal totalRevenue;
    private List<Map<String, Object>> bookingsByMonth;
    private List<Map<String, Object>> topEvents;
    private List<Map<String, Object>> revenueByCategory;
}
