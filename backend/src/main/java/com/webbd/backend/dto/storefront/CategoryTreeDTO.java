package com.webbd.backend.dto.storefront;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class CategoryTreeDTO {
    private Long id;
    private String name;
    private String slug;
    private List<CategoryTreeDTO> children = new ArrayList<>();
}
