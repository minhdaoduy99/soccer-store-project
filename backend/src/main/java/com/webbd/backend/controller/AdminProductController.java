package com.webbd.backend.controller;

import com.webbd.backend.entity.*;
import com.webbd.backend.repository.*;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class VariantDTO {
        private Long id;
        private String sku;
        private String color;
        private String size;
        private String groundType;
        private BigDecimal price;
        private Integer stockQuantity;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ProductDetailDTO {
        private Long id;
        private String name;
        private Long brandId;
        private Long categoryId;
        private BigDecimal basePrice;
        private String thumbnailUrl;
        private List<VariantDTO> variants;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailDTO> getProductDetail(@PathVariable Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        String thumb = p.getImages().stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsThumbnail()))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElseGet(() -> p.getImages().isEmpty() ? "" : p.getImages().get(0).getImageUrl());

        List<VariantDTO> variants = new ArrayList<>();
        for (ProductVariant v : p.getVariants()) {
            variants.add(new VariantDTO(
                    v.getId(),
                    v.getSku(),
                    v.getColor(),
                    v.getSize(),
                    v.getGroundType(),
                    v.getPrice(),
                    v.getStockQuantity()
            ));
        }

        return ResponseEntity.ok(new ProductDetailDTO(
                p.getId(),
                p.getName(),
                p.getBrand().getId(),
                p.getCategory().getId(),
                p.getBasePrice(),
                thumb,
                variants
        ));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductDetailDTO req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Brand brand = brandRepository.findById(req.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hãng"));
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        p.setName(req.getName());
        p.setBrand(brand);
        p.setCategory(category);
        p.setBasePrice(req.getBasePrice());
        productRepository.save(p);

        // Cập nhật ảnh đại diện
        if (req.getThumbnailUrl() != null) {
            if (p.getImages().isEmpty()) {
                ProductImage img = new ProductImage();
                img.setProduct(p);
                img.setImageUrl(req.getThumbnailUrl());
                img.setIsThumbnail(true);
                imageRepository.save(img);
            } else {
                ProductImage img = p.getImages().get(0);
                img.setImageUrl(req.getThumbnailUrl());
                imageRepository.save(img);
            }
        }

        // Đồng bộ danh sách biến thể (Size / Tồn kho)
        Set<Long> keepIds = new HashSet<>();
        if (req.getVariants() != null) {
            for (VariantDTO vDto : req.getVariants()) {
                if (vDto.getId() != null) {
                    keepIds.add(vDto.getId());
                }
            }
        }

        for (ProductVariant existing : new ArrayList<>(p.getVariants())) {
            if (!keepIds.contains(existing.getId())) {
                variantRepository.delete(existing);
            }
        }

        if (req.getVariants() != null) {
            for (VariantDTO vDto : req.getVariants()) {
                ProductVariant v;
                if (vDto.getId() != null) {
                    v = variantRepository.findById(vDto.getId()).orElse(new ProductVariant());
                } else {
                    v = new ProductVariant();
                    v.setProduct(p);
                    String generatedSku = "SP" + p.getId() + "-" + vDto.getSize().replaceAll("\\s+", "") + "-" + (System.currentTimeMillis() % 100000);
                    v.setSku(generatedSku);
                }
                v.setProduct(p);
                v.setSize(vDto.getSize());
                v.setColor(vDto.getColor() != null && !vDto.getColor().isBlank() ? vDto.getColor() : "Tiêu chuẩn");
                v.setGroundType(vDto.getGroundType() != null && !vDto.getGroundType().isBlank() ? vDto.getGroundType() : "TF");
                v.setPrice(req.getBasePrice());
                v.setStockQuantity(vDto.getStockQuantity() != null && vDto.getStockQuantity() >= 0 ? vDto.getStockQuantity() : 0);
                variantRepository.save(v);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Cập nhật sản phẩm thành công"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
        p.setIsActive(false);
        productRepository.save(p);
        return ResponseEntity.ok(Map.of("message", "Đã ẩn sản phẩm"));
    }
}
