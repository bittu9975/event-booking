package com.eb.service;

import com.eb.dto.EventDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {
    Page<EventDTO> getAllEvents(String search, String category, Pageable pageable);
    EventDTO getEventById(Long id);
    EventDTO createEvent(EventDTO dto, String adminEmail);
    EventDTO updateEvent(Long id, EventDTO dto);
    void deleteEvent(Long id);
}
