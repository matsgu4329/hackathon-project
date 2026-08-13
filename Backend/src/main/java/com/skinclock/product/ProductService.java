package com.skinclock.product;

import com.skinclock.common.NotFoundException;
import com.skinclock.product.dto.ProductRequest;
import com.skinclock.product.dto.ProductResponse;
import com.skinclock.user.User;
import com.skinclock.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProductService {

    private final UserService userService;
    private final ProductRepository productRepository;

    public ProductService(UserService userService, ProductRepository productRepository) {
        this.userService = userService;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list(String clientUserId) {
        LocalDate today = LocalDate.now();
        return productRepository.findAllByUser_ClientUserId(clientUserId).stream()
                .map(product -> ProductResponse.from(product, today))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse get(String clientUserId, Long productId) {
        Product product = findOwnedProduct(clientUserId, productId);
        return ProductResponse.from(product, LocalDate.now());
    }

    @Transactional
    public ProductResponse create(String clientUserId, ProductRequest request) {
        request.validateCycleFields();
        User user = userService.getOrCreate(clientUserId);
        Product product = new Product(user);
        applyRequest(product, request);
        return ProductResponse.from(productRepository.save(product), LocalDate.now());
    }

    @Transactional
    public ProductResponse update(String clientUserId, Long productId, ProductRequest request) {
        request.validateCycleFields();
        Product product = findOwnedProduct(clientUserId, productId);
        applyRequest(product, request);
        return ProductResponse.from(product, LocalDate.now());
    }

    @Transactional
    public void delete(String clientUserId, Long productId) {
        Product product = findOwnedProduct(clientUserId, productId);
        productRepository.delete(product);
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.apply(
                request.name(),
                request.usageStep(),
                request.ingredientTags(),
                request.cycleType(),
                request.cycleIntervalDays(),
                request.cycleWeekdays(),
                request.lastUsedAt()
        );
    }

    private Product findOwnedProduct(String clientUserId, Long productId) {
        return productRepository.findByIdAndUser_ClientUserId(productId, clientUserId)
                .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND", "제품을 찾을 수 없습니다."));
    }
}
