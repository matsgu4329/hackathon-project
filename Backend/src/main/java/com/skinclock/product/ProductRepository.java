package com.skinclock.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByUser_ClientUserId(String clientUserId);

    Optional<Product> findByIdAndUser_ClientUserId(Long id, String clientUserId);
}
