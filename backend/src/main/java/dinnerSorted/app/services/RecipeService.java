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
    Meals to exclude (already in plan, do not repeat): %s
    
    Meals already planned for this week (DO NOT generate these again, but USE them
    when calculating the shopping list and Sunday session):
    %s
    
    Only generate NEW meals for the days not covered by the kept meals above.
    The total plan must cover exactly %d days combined (kept + new).
    Number the new meals starting from the first available day slot.
    
    For each meal, all ingredient quantities must be scaled for exactly %d people.
    Always include specific quantities (e.g. "400g chicken breast", "2 cups rice",
    "3 tbsp olive oil") — never list ingredients without amounts.
    
    MEAL INSTRUCTIONS RULE:
    The instructions field must include ALL prep steps in full — chopping, dicing, 
    marinating, portioning. Do not assume any prep has been done. Write it as a 
    complete cook-from-fridge sequence: what to take out, what to prep, what order 
    to cook it in. A user should be able to follow it with zero gaps.
    
    DINNERTIME INSTRUCTION RULE:
    The dinnertimeInstruction must:
    - Start with a verb
    - Include a specific time in minutes
    - Require zero decisions — the cook reads it once and does it
    - Never use vague language like "reheat as needed" or "heat through"
    - Reference what was prepped on Sunday where relevant
    Examples:
    "Take container from fridge, reheat curry in pan on medium 8 mins, microwave rice 3 mins — serve together."
    "Hot pan, oil in, cube chicken straight from fridge — fry 10 mins, add sauce, done."
    "Oven on at 190°C, sheet pan straight from fridge — in for 25 mins, nothing else to do."
    
    SUNDAY SESSION RULE:
    The sundaySession must be a time-sequenced schedule that includes ALL meals
    in the week (both kept and new). Include:
    - ALL ingredient prep: chopping, dicing, cubing, marinating, portioning
    - Cooking tasks with [OVEN] [HOB] [PREP] [COOL/STORE] [DONE] tags
    - Passive vs active tasks clearly distinguished
    - Never two active tasks at the same time
    - Cooling and portioning batched at the end
    A user should be able to follow it with zero gaps — no implied prep steps.
    
    For the shopping list:
       - Include ingredients needed for ALL meals (kept + new combined)
       - Combine quantities of the same ingredient across all meals into a single total
       - Express quantities in the most practical unit (e.g. 1.2kg not 1200g, 1L not 1000ml)
       - Only include ingredients not already provided by the user
       - Sort by supermarket category: produce, protein, dairy, pantry, frozen
    
    Respond ONLY with valid JSON matching this exact structure, no markdown, no explanation.
    Only include the newly generated meals in the meals array (not the kept meals):
    {
      "meals": [
        {
          "day": 1,
          "name": "meal name",
          "label": "Fussy eater approved or Whole family",
          "effortLevel": "Easy, Medium or Needs focus",
          "ingredients": ["400g chicken breast", "2 cups rice"],
          "instructions": "complete cook-from-fridge instructions including all prep steps",
          "dinnertimeInstruction": "4:45pm instruction starting with a verb, specific time, zero decisions",
          "missingIngredients": ["missing ingredient without quantity"]
        }
      ],
      "shoppingList": ["1.2kg chicken breast", "600g broccoli"],
      "sundaySession": "time-sequenced prep schedule covering ALL meals this week"
    }
    """,
                request.ingredients(),
                request.dietary().isEmpty() ? "none" : request.dietary(),
                request.days(),
                request.people(),
                request.exclude() == null || request.exclude().isEmpty() ? "none" : request.exclude(),
                request.keep() == null || request.keep().isEmpty() ? "none" : String.join("\n    ", request.keep()),
                request.days(),
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
