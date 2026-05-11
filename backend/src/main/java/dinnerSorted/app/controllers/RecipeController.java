package dinnerSorted.app.controllers;

import dinnerSorted.app.model.DTOs.RecipeRequestDTO;
import dinnerSorted.app.model.DTOs.RecipeResponseDTO;
import dinnerSorted.app.services.RecipeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RecipeController {

    private final RecipeService recipeService;

    @Autowired
    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/recipes/generate")
    public ResponseEntity<RecipeResponseDTO> generateRecipes(@Valid @RequestBody RecipeRequestDTO request) {
        return ResponseEntity.ok(recipeService.generateMeals(request));
    }
}
