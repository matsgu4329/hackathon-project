package com.skinclock.product;

import com.skinclock.common.ApiResponse;
import com.skinclock.product.dto.ProductRequest;
import com.skinclock.product.dto.ProductResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> list(@RequestHeader("X-User-Id") String userId) {
        return ApiResponse.ok(productService.list(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> get(@RequestHeader("X-User-Id") String userId, @PathVariable Long id) {
        return ApiResponse.ok(productService.get(userId, id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ProductResponse> create(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody ProductRequest request
    ) {
        return ApiResponse.ok(productService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        return ApiResponse.ok(productService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader("X-User-Id") String userId, @PathVariable Long id) {
        productService.delete(userId, id);
    }
}
