package dinnerSorted.app.model.DTOs;

import java.util.List;

public record RecipeResponseDTO(
        List<MealDTO> meals,
        List<String> shoppingList,
        String sundaySession,
        List<TomorrowMealDTO> tomorrowFromTonight
) {
    public record MealDTO(
            int day,
            String name,
            String label,
            String effortLevel,
            List<String> ingredients,
            String instructions,
            String dinnertimeInstruction,
            List<String> missingIngredients,
            String prepTime
    ) {}

    public record TomorrowMealDTO(String name, String method){}
}
