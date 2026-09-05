package com.desk2dine.service;

import com.desk2dine.entity.MenuItem;
import com.desk2dine.exception.NotFoundException;
import com.desk2dine.repository.FavouriteRepository;
import com.desk2dine.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Lets a faculty member star/unstar menu items for quick reordering later. */
@Service
public class FavouriteService {

    private final FavouriteRepository favouriteRepository;
    private final MenuItemRepository menuItemRepository;

    public FavouriteService(FavouriteRepository favouriteRepository, MenuItemRepository menuItemRepository) {
        this.favouriteRepository = favouriteRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public void add(Long userId, Long menuItemId) {
        menuItemRepository.findById(menuItemId).orElseThrow(() -> new NotFoundException("Menu item not found"));
        favouriteRepository.add(userId, menuItemId);
    }

    public void remove(Long userId, Long menuItemId) {
        favouriteRepository.remove(userId, menuItemId);
    }

    public List<MenuItem> list(Long userId) {
        return favouriteRepository.findByUser(userId);
    }
}
