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

        // Build busy nights string
        String busyNightsStr = (request.busyNights() == null || request.busyNights().isEmpty())
                ? "none specified — assume Wednesday and Friday are most likely busy"
                : String.join(", ", request.busyNights());

        String chaoticStr = (request.chaoticNights() == null || request.chaoticNights().isBlank())
                ? "none specified"
                : request.chaoticNights();

        String fussyStr = (request.fussyEaterNotes() == null || request.fussyEaterNotes().isBlank())
                ? "none"
                : request.fussyEaterNotes();

        String sundayStr = (request.sundayWindow() == null || request.sundayWindow().isBlank())
                ? "90 min"
                : request.sundayWindow();

        String weeknightStr = (request.weeknightTime() == null || request.weeknightTime().isBlank())
                ? "20-30 min"
                : request.weeknightTime();

        String freezerStr = (request.freezerProteins() == null || request.freezerProteins().isEmpty())
                ? "not specified"
                : String.join(", ", request.freezerProteins());

        StringBuilder prompt = new StringBuilder(String.format("""
            Please generate a meal plan with the following details:

            — Ingredients available: %s
            — Usual freezer proteins: %s
            — Dietary requirements: %s
            — Fussy eater details: %s
            — Number of days: %d
            — Number of people: %d
            — Typical weeknight cooking time: %s
            — Sunday prep window: %s

            NIGHTS WITH UNDER 30 MINUTES TO GET DINNER ON THE TABLE: %s
            These nights must have Easy meals that require minimal active cooking.

            CHAOTIC NIGHTS (10-15 minutes max to plate — reheating only, zero active cooking):
            %s
            For each chaotic night: the meal must be FULLY prepped on Sunday.
            The dinnertime instruction must be reheating only — never cooking from scratch.

            — Meals to exclude (already in plan, do not repeat): %s

            Meals already planned for this week (DO NOT generate these again, but USE them
            when calculating the shopping list and Sunday session):
            %s

            Only generate NEW meals for the days not covered by the kept meals above.
            The total plan must cover exactly %d days combined (kept + new).
            Number the new meals starting from the first available day slot.

            For each meal, all ingredient quantities must be scaled for exactly %d people.
            Always include specific quantities (e.g. "400g chicken breast", "2 cups rice",
            "3 tbsp olive oil") — never list ingredients without amounts.

            INGREDIENT MATCHING RULE:
            When checking what the user already has, match generously:
            - "Chicken" covers chicken breast, chicken thighs, chicken pieces, chicken fillets — any cut
            - "Beef mince" covers minced beef, ground beef
            - "Salmon" covers salmon fillets, salmon pieces
            - "Potatoes" covers new potatoes, baby potatoes, potato
            Never add an ingredient to the shopping list if the user has provided a parent ingredient that covers it.

            MEAL INSTRUCTIONS RULE:
            The instructions field must include ALL prep steps in full — chopping, dicing,
            marinating, portioning. Do not assume any prep has been done. Write it as a
            complete cook-from-fridge sequence.

            DINNERTIME INSTRUCTION RULE:
            The dinnertimeInstruction must:
            - Start with a verb
            - Include a specific time in minutes
            - Require zero decisions
            - Never use vague language
            - Reference Sunday prep where relevant
            - For chaotic nights: reheating instructions only — never cooking from scratch

            SUNDAY SESSION RULE:
            The sundaySession must be a time-sequenced schedule built around the %s window.
            If all meals cannot fit in the available window, prioritise chaotic nights first,
            then deprioritise lower-stakes nights and flag them as "weeknight cook — no Sunday prep needed".
            Never silently compress or skip steps to make the schedule appear to fit.
            Include ALL ingredient prep: chopping, dicing, cubing, marinating, portioning.
            Each step on its own line with its tag. Never put multiple steps on the same line.
            Tags: [OVEN] [HOB] [PREP] [COOL/STORE] [FREEZE] [DONE]

            For the shopping list:
            - Include ingredients needed for ALL meals (kept + new combined)
            - Combine quantities of the same ingredient across all meals
            - Express quantities in the most practical unit
            - Only include ingredients not already provided by the user
            - Sort by: produce, protein, dairy, pantry, frozen

            Respond ONLY with valid JSON matching this exact structure, no markdown, no explanation.
            Only include the newly generated meals in the meals array:
            {
              "meals": [
                {
                  "day": 1,
                  "name": "meal name",
                  "label": "Fussy eater approved or Whole family",
                  "effortLevel": "Easy, Medium or Needs focus",
                  "ingredients": ["400g chicken breast", "2 cups rice"],
                  "instructions": "complete cook-from-fridge instructions",
                  "dinnertimeInstruction": "starts with verb, specific time, zero decisions",
                  "missingIngredients": ["missing ingredient without quantity"]
                }
              ],
              "shoppingList": ["1.2kg chicken breast", "600g broccoli"],
              "sundaySession": "time-sequenced prep schedule covering ALL meals this week"
            }
            """,
                request.ingredients(),
                freezerStr,
                request.dietary().isEmpty() ? "none" : request.dietary(),
                fussyStr,
                request.days(),
                request.people(),
                weeknightStr,
                sundayStr,
                busyNightsStr,
                chaoticStr,
                request.exclude() == null || request.exclude().isEmpty() ? "none" : request.exclude(),
                request.keep() == null || request.keep().isEmpty() ? "none" : String.join("\n    ", request.keep()),
                request.days(),
                request.people(),
                sundayStr
        ));

        // Tonight's dinner — optional Tomorrow From Tonight section
        if (request.tonightsDinner() != null && !request.tonightsDinner().isBlank()) {
            prompt.append(String.format("""

                TONIGHT'S DINNER: %s
                Also generate a TOMORROW FROM TONIGHT section in the JSON response.
                Show 3 ways to turn tonight's leftovers into tomorrow's meal.
                Rules:
                - Under 15 minutes active work tomorrow
                - Genuinely different from tonight — not just "have it again"
                - Specific to what they're making, not generic leftover advice
                - Vary in effort: one fast (under 10 min), one slightly more, one different base (wrap/bowl/pasta)
                Add this field to the JSON root:
                "tomorrowFromTonight": [
                  {"name": "meal name", "method": "one line, max 15 words"},
                  {"name": "meal name", "method": "one line, max 15 words"},
                  {"name": "meal name", "method": "one line, max 15 words"}
                ]
                """, request.tonightsDinner()));
        }

        return prompt.toString();
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
