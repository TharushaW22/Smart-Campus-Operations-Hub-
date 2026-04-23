package com.smartcampus.back_end.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AddCommentDTO {
    @NotBlank(message = "Comment content cannot be blank")
    private String content;
}
