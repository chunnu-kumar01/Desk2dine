package com.desk2dine.service;

import com.desk2dine.dto.PageResult;
import com.desk2dine.dto.UserResponse;
import com.desk2dine.entity.User;
import com.desk2dine.repository.UserRepository;
import com.desk2dine.security.Role;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/** Powers the admin "Manage Users" screen: search + filter + sort + paginate over all accounts. */
@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public PageResult<UserResponse> search(String searchText, Role roleFilter, String sortBy, String sortDir,
                                            int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 20 : Math.min(size, 100);
        List<User> users = userRepository.search(searchText, roleFilter, sortBy, sortDir, safePage, safeSize);
        List<UserResponse> responses = users.stream().map(UserResponse::from).collect(Collectors.toList());
        long total = userRepository.countSearch(searchText, roleFilter);
        return new PageResult<>(responses, safePage, safeSize, total);
    }
}
