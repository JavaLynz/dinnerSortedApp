package dinnerSorted.app.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import dinnerSorted.app.config.SystemPrompts;
import dinnerSorted.app.model.DTOs.RecipeRequestDTO;
import dinnerSorted.app.model.DTOs.RecipeResponseDTO;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class RecipeService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public RecipeService(ChatClient.Builder builder, ObjectMapper objectMapper) {
        this.chatClient = builder.build();
        this.objectMapper = objectMapper;
    }

    public RecipeResponseDTO generateMeals(RecipeRequestDTO request) {
        String prompt = buildUserPrompt(request);

        String response = chatClient.prompt()
                .system(SystemPrompts.MEAL_PLANNER)
                .user(prompt)
                .call()
                .content();

        return parseResponse(response);
    }

    private String buildUserPrompt(RecipeRequestDTO request) {
        return String.format("""
            Please generate a meal plan with the following details:
            
            Ingredients available: %s
            Dietary requirements: %s
            Number of days: %d
            Number of people: %d
            
            For each meal, all ingredient quantities must be scaled for exactly %d people.
            Always include specific quantities (e.g. "400g chicken breast", "2 cups rice",
            "3 tbsp olive oil") — never list ingredients without amounts.
            
            For the shopping list:
               - Combine quantities of the same ingredient across all meals into a single total
               - Express quantities in the most practical unit (e.g. 1.2kg not 1200g, 1L not 1000ml)
               - Only include ingredients not already provided by the user
               - Sort by supermarket category: produce, protein, dairy, pantry, frozen
            
            Respond ONLY with valid JSON matching this exact structure, no markdown, no explanation:
            {
              "meals": [
                {
                  "day": 1,
                  "name": "meal name",
                  "label": "Fussy eater approved or Whole family",
                  "effortLevel": "Easy, Medium or Needs focus",
                  "ingredients": ["400g chicken breast", "2 cups rice"],
                  "instructions": "cooking instructions",
                  "dinnertimeInstruction": "4:45pm instruction starting with a verb",
                  "missingIngredients": ["missing ingredient without quantity"]
                }
              ],
              "shoppingList": ["1.2kg chicken breast", "600g broccoli"],
              "sundaySession": "full sunday prep schedule as formatted text"
            }
            """,
                request.ingredients(),
                request.dietary().isEmpty() ? "none" : request.dietary(),
                request.days(),
                request.people(),
                request.people()
        );
    }

    private RecipeResponseDTO parseResponse(String response) {
        try{
            String clean = response
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();
            return objectMapper.readValue(clean, RecipeResponseDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage());
        }
    }


}
