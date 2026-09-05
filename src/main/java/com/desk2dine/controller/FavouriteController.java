package com.desk2dine.controller;

import com.desk2dine.entity.MenuItem;
import com.desk2dine.service.FavouriteService;
import com.desk2dine.util.ApiResponse;
import com.desk2dine.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Faculty: star/unstar menu items and view your starred list. */
@RestController
@RequestMapping("/api/favourites")
public class FavouriteController {

    private final FavouriteService favouriteService;

    public FavouriteController(FavouriteService favouriteService) {
        this.favouriteService = favouriteService;
    }

    @GetMapping
    public ApiResponse<List<MenuItem>> list(HttpServletRequest httpRequest) {
        return ApiResponse.ok(favouriteService.list(SessionUtil.getCurrentUserId(httpRequest)));
    }

    @PostMapping("/{menuItemId}")
    public ApiResponse<Void> add(@PathVariable Long menuItemId, HttpServletRequest httpRequest) {
        favouriteService.add(SessionUtil.getCurrentUserId(httpRequest), menuItemId);
        return ApiResponse.ok("Added to favourites", null);
    }

    @DeleteMapping("/{menuItemId}")
    public ApiResponse<Void> remove(@PathVariable Long menuItemId, HttpServletRequest httpRequest) {
        favouriteService.remove(SessionUtil.getCurrentUserId(httpRequest), menuItemId);
        return ApiResponse.ok("Removed from favourites", null);
    }
}
