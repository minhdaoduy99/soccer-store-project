package com.webbd.backend.controller;

import com.webbd.backend.dto.storefront.CategoryTreeDTO;
import com.webbd.backend.dto.storefront.ProductCardDTO;
import com.webbd.backend.entity.*;
import com.webbd.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class StorefrontController {

    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @GetMapping("/categories")
    public List<CategoryTreeDTO> getCategoryTree() {
        List<Category> all = categoryRepository.findAllByOrderByIdAsc();
        Map<Long, CategoryTreeDTO> map = new LinkedHashMap<>();
        for (Category c : all) {
            if (c.getParentId() == null) {
                map.put(c.getId(), new CategoryTreeDTO(c.getId(), c.getName(), c.getSlug(), new ArrayList<>()));
            }
        }
        for (Category c : all) {
            if (c.getParentId() != null && map.containsKey(c.getParentId())) {
                map.get(c.getParentId()).getChildren().add(
                        new CategoryTreeDTO(c.getId(), c.getName(), c.getSlug(), new ArrayList<>())
                );
            }
        }
        return new ArrayList<>(map.values());
    }

    @GetMapping("/brands")
    public List<Brand> getBrands() {
        return brandRepository.findAllByOrderByIdAsc();
    }

    @GetMapping("/products")
    public List<ProductCardDTO> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String groundType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        List<Product> products;
        if (categoryId != null) {
            List<Long> catIds = new ArrayList<>();
            catIds.add(categoryId);
            List<Category> children = categoryRepository.findByParentId(categoryId);
            for (Category child : children) {
                catIds.add(child.getId());
            }
            products = productRepository.findByCategoriesAndFilters(catIds, brandId, size, groundType, minPrice, maxPrice, keyword);
        } else {
            products = productRepository.findAllByFilters(brandId, size, groundType, minPrice, maxPrice, keyword);
        }

        if ("price_asc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getBasePrice));
        } else if ("price_desc".equals(sort)) {
            products.sort(Comparator.comparing(Product::getBasePrice).reversed());
        } else {
            products.sort(Comparator.comparing(Product::getId).reversed());
        }

        return products.stream().map(this::toCardDTO).collect(Collectors.toList());
    }

    private ProductCardDTO toCardDTO(Product p) {
        String thumb = p.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElseGet(() -> p.getImages().isEmpty() ? "" : p.getImages().get(0).getImageUrl());

        List<String> availableSizes = p.getVariants().stream()
                .filter(v -> v.getStockQuantity() != null && v.getStockQuantity() > 0)
                .map(ProductVariant::getSize)
                .distinct()
                .collect(Collectors.toList());

        List<String> outOfStockSizes = p.getVariants().stream()
                .filter(v -> v.getStockQuantity() == null || v.getStockQuantity() <= 0)
                .map(ProductVariant::getSize)
                .filter(sz -> !availableSizes.contains(sz))
                .distinct()
                .collect(Collectors.toList());

        List<String> grounds = p.getVariants().stream()
                .map(ProductVariant::getGroundType)
                .distinct()
                .collect(Collectors.toList());

        int stock = p.getVariants().stream()
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();

        return new ProductCardDTO(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getBrand().getName(),
                p.getBrand().getId(),
                p.getCategory().getName(),
                p.getCategory().getId(),
                p.getBasePrice(),
                thumb,
                availableSizes,
                outOfStockSizes,
                grounds,
                stock
        );
    }
}
