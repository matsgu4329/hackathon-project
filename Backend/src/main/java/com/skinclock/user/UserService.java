package com.skinclock.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User getOrCreate(String clientUserId) {
        return userRepository.findByClientUserId(clientUserId)
                .orElseGet(() -> userRepository.save(new User(clientUserId)));
    }
}
