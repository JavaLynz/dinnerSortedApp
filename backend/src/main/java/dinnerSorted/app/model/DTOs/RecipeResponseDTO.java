package dinnerSorted.app.model.DTOs;

import java.util.List;

public record RecipeResponseDTO(
        List<Meal> meals,
        List<String> shoppingList,
        String sundaySession
) {
    public record Meal(
            int day,
            String name,
            String label,
            String effortLevel,
            List<String> ingredients,
            String instructions,
            String dinnertimeInstruction,
            List<String> missingIngredients
    ) {}
}
