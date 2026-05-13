package dinnerSorted.app.model.DTOs;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RecipeRequestDTO (

        @NotEmpty(message = "At least one ingredient is required")
        List<String> ingredients,

        List<String> dietary,

        @Min(1) @Max(7)
        int days,

        @Min(1) @Max(12)
        int people,

        List<String> exclude,

        List<String> keep

) {}
