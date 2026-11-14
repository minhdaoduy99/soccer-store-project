package com.webbd.backend.repository;

import com.webbd.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.variants v " +
           "WHERE p.isActive = true " +
           "AND p.category.id IN :categoryIds " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:size IS NULL OR :size = '' OR v.size = :size) " +
           "AND (:groundType IS NULL OR :groundType = '' OR v.groundType = :groundType) " +
           "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice) " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> findByCategoriesAndFilters(
            @Param("categoryIds") List<Long> categoryIds,
            @Param("brandId") Long brandId,
            @Param("size") String size,
            @Param("groundType") String groundType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword") String keyword
    );

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.variants v " +
           "WHERE p.isActive = true " +
           "AND (:brandId IS NULL OR p.brand.id = :brandId) " +
           "AND (:size IS NULL OR :size = '' OR v.size = :size) " +
           "AND (:groundType IS NULL OR :groundType = '' OR v.groundType = :groundType) " +
           "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice) " +
           "AND (:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Product> findAllByFilters(
            @Param("brandId") Long brandId,
            @Param("size") String size,
            @Param("groundType") String groundType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword") String keyword
    );
}
