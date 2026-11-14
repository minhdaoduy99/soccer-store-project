package com.webbd.backend.dto.storefront;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class ProductCardDTO {
    private Long id;
    private String name;
    private String slug;
    private String brandName;
    private Long brandId;
    private String categoryName;
    private Long categoryId;
    private BigDecimal basePrice;
    private String thumbnailUrl;
    private List<String> availableSizes;
    private List<String> outOfStockSizes;
    private List<String> groundTypes;
    private int totalStock;
}
