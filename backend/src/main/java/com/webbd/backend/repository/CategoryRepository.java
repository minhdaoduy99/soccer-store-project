package com.webbd.backend.repository;

import com.webbd.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByOrderByIdAsc();
    List<Category> findByParentId(Long parentId);
}
