package com.desk2dine.controller;

import com.desk2dine.dto.DeliveryLocationRequest;
import com.desk2dine.entity.DeliveryLocation;
import com.desk2dine.security.Role;
import com.desk2dine.security.RequireRole;
import com.desk2dine.service.DeliveryLocationService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-locations")
public class DeliveryLocationController {

    private final DeliveryLocationService deliveryLocationService;

    public DeliveryLocationController(DeliveryLocationService deliveryLocationService) {
        this.deliveryLocationService = deliveryLocationService;
    }

    @GetMapping
    public ApiResponse<List<DeliveryLocation>> list(@RequestParam(defaultValue = "false") boolean includeInactive) {
        return ApiResponse.ok(includeInactive ? deliveryLocationService.listAll() : deliveryLocationService.listActive());
    }

    @PostMapping
    @RequireRole(Role.ADMIN)
    public ApiResponse<DeliveryLocation> create(@Valid @RequestBody DeliveryLocationRequest request, HttpServletRequest httpRequest) {
        return ApiResponse.ok("Location created", deliveryLocationService.create(request, SessionUtil.getCurrentUserId(httpRequest)));
    }

    @PutMapping("/{id}")
    @RequireRole(Role.ADMIN)
    public ApiResponse<DeliveryLocation> update(@PathVariable Long id, @Valid @RequestBody DeliveryLocationRequest request,
                                                 HttpServletRequest httpRequest) {
        return ApiResponse.ok("Location updated", deliveryLocationService.update(id, request, SessionUtil.getCurrentUserId(httpRequest)));
    }

    @DeleteMapping("/{id}")
    @RequireRole(Role.ADMIN)
    public ApiResponse<Void> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        deliveryLocationService.delete(id, SessionUtil.getCurrentUserId(httpRequest));
        return ApiResponse.ok("Location deleted", null);
    }
}
