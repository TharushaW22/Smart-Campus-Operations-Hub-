package com.smartcampus.back_end.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Type is required")
    @Column(nullable = false)
    private String type;

    @Min(value = 1, message = "Capacity must be greater than 0")
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @NotBlank(message = "Status is required")
    @Column(nullable = false)
    private String status;

    @Column(length = 1000)
    private String description;

    private String imageUrl;

    @Column(length = 1000)
    private String amenities;
}
