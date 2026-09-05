package com.desk2dine.service;

import com.desk2dine.dto.DeliveryLocationRequest;
import com.desk2dine.entity.DeliveryLocation;
import com.desk2dine.exception.NotFoundException;
import com.desk2dine.exception.ValidationException;
import com.desk2dine.repository.DeliveryLocationRepository;
import com.desk2dine.util.ValidationUtil;
import org.springframework.stereotype.Service;

import java.util.List;

/** CRUD for delivery locations, called by DeliveryLocationController. */
@Service
public class DeliveryLocationService {

    private final DeliveryLocationRepository repository;
    private final AuditLogService auditLogService;

    public DeliveryLocationService(DeliveryLocationRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    /** Faculty placing an order only need the active list. */
    public List<DeliveryLocation> listActive() {
        return repository.findAllActive();
    }

    /** Admin managing locations needs to see inactive ones too. */
    public List<DeliveryLocation> listAll() {
        return repository.findAll();
    }

    public DeliveryLocation create(DeliveryLocationRequest request, Long actingUserId) {
        String name = ValidationUtil.sanitize(request.getName());
        if (ValidationUtil.isBlank(name)) {
            throw new ValidationException("Location name is required");
        }
        DeliveryLocation location = new DeliveryLocation();
        location.setName(name);
        location.setBlock(ValidationUtil.sanitize(request.getBlock()));
        location.setFloor(ValidationUtil.sanitize(request.getFloor()));
        location.setActive(true);
        DeliveryLocation saved = repository.insert(location);
        auditLogService.record(actingUserId, "LOCATION_CREATED", "DELIVERY_LOCATION", saved.getId(), name);
        return saved;
    }

    public DeliveryLocation update(Long id, DeliveryLocationRequest request, Long actingUserId) {
        DeliveryLocation existing = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Delivery location not found"));
        String name = ValidationUtil.sanitize(request.getName());
        if (ValidationUtil.isBlank(name)) {
            throw new ValidationException("Location name is required");
        }
        existing.setName(name);
        existing.setBlock(ValidationUtil.sanitize(request.getBlock()));
        existing.setFloor(ValidationUtil.sanitize(request.getFloor()));
        repository.update(existing);
        auditLogService.record(actingUserId, "LOCATION_UPDATED", "DELIVERY_LOCATION", id, name);
        return existing;
    }

    public void delete(Long id, Long actingUserId) {
        repository.findById(id).orElseThrow(() -> new NotFoundException("Delivery location not found"));
        repository.delete(id);
        auditLogService.record(actingUserId, "LOCATION_DELETED", "DELIVERY_LOCATION", id, "Location deleted");
    }
}
