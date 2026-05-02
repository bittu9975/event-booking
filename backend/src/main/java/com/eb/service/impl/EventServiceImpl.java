package com.eb.service.impl;

import com.eb.dto.EventDTO;
import com.eb.entity.Event;
import com.eb.entity.User;
import com.eb.exception.CustomException;
import com.eb.repository.EventRepository;
import com.eb.repository.UserRepository;
import com.eb.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    public Page<EventDTO> getAllEvents(String search, String category, Pageable pageable) {
        String s = (search == null || search.isBlank()) ? "" : search.trim();
        String c = (category == null || category.isBlank()) ? "" : category.trim();
        return eventRepository.searchEvents(s, c, pageable).map(this::toDTO);
    }

    @Override
    public EventDTO getEventById(Long id) {
        return eventRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new CustomException("Event not found with id: " + id));
    }

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO dto, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new CustomException("Admin user not found"));

        Event event = Event.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .date(dto.getDate())
                .location(dto.getLocation())
                .price(dto.getPrice())
                .totalSeats(dto.getTotalSeats())
                .availableSeats(dto.getTotalSeats())
                .imageUrl(dto.getImageUrl())
                .category(dto.getCategory())
                .createdBy(admin)
                .build();

        return toDTO(eventRepository.save(event));
    }

    @Override
    @Transactional
    public EventDTO updateEvent(Long id, EventDTO dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new CustomException("Event not found"));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setDate(dto.getDate());
        event.setLocation(dto.getLocation());
        event.setPrice(dto.getPrice());
        event.setCategory(dto.getCategory());
        if (dto.getImageUrl() != null) event.setImageUrl(dto.getImageUrl());

        // Update available seats if total changed
        int diff = dto.getTotalSeats() - event.getTotalSeats();
        event.setTotalSeats(dto.getTotalSeats());
        event.setAvailableSeats(Math.max(0, event.getAvailableSeats() + diff));

        return toDTO(eventRepository.save(event));
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new CustomException("Event not found");
        }
        eventRepository.deleteById(id);
    }

    private EventDTO toDTO(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .date(event.getDate())
                .location(event.getLocation())
                .price(event.getPrice())
                .totalSeats(event.getTotalSeats())
                .availableSeats(event.getAvailableSeats())
                .imageUrl(event.getImageUrl())
                .category(event.getCategory())
                .createdByName(event.getCreatedBy() != null ? event.getCreatedBy().getName() : null)
                .createdAt(event.getCreatedAt())
                .build();
    }
}
