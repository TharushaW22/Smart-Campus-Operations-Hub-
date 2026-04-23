package com.smartcampus.back_end.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Getter @Setter
public class CreateTicketDTO {
    private String resourceLocation;
    private String category;
    private String description;
    private String priority;
    private String preferredContactDetails;
    private List<MultipartFile> images;
}
