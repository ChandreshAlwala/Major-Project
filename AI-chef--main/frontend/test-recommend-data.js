// Test data to verify the structure
const testData = {
  "recommendations": [
    {
      "id": "cmge4effd000g9ye56z3g8dlb",
      "score": 100,
      "reason": "Recipe contains all 2 ingredients specified by user. Score: 100",
      "modifications": [],
      "missingIngredients": [
        "yogurt",
        "onion",
        "tomatoes",
        "ginger-garlic paste",
        "biryani masala",
        "saffron",
        "mint leaves",
        "cilantro"
      ],
      "availableIngredients": [
        "basmati rice",
        "chicken"
      ],
      "customizedInstructions": "Original recipe steps:\n1. Marinate chicken with yogurt and half the spices for 1 hour.\n2. Soak saffron in warm milk for 10 minutes.\n3. Fry sliced onions until golden brown, set aside half for garnish.\n4. Cook marinated chicken with tomatoes until tender.\n5. Parboil rice with whole spices until 80% cooked.\n6. Layer rice and chicken in a heavy-bottomed pot.\n7. Sprinkle fried onions, mint, and cilantro between layers.\n8. Cover and cook on low heat for 20 minutes (dum cooking).\n9. Mix in saffron milk and serve hot with raita.\n\nNote: This recipe requires the following ingredients you don't have: yogurt, onion, tomatoes, ginger-garlic paste, biryani masala, saffron, mint leaves, cilantro. Please consider substituting or purchasing these ingredients.",
      "recipe": {
        "id": "cmge4effd000g9ye56z3g8dlb",
        "title": "Chicken Biryani",
        "description": "Fragrant rice dish with tender chicken and aromatic spices.",
        "ingredients": "[{\"name\":\"basmati rice\",\"qty\":2,\"unit\":\"cups\"},{\"name\":\"chicken\",\"qty\":1,\"unit\":\"lb\"},{\"name\":\"yogurt\",\"qty\":0.5,\"unit\":\"cup\"},{\"name\":\"onion\",\"qty\":2,\"unit\":\"large\"},{\"name\":\"tomatoes\",\"qty\":2,\"unit\":\"medium\"},{\"name\":\"ginger-garlic paste\",\"qty\":1,\"unit\":\"tbsp\"},{\"name\":\"biryani masala\",\"qty\":2,\"unit\":\"tbsp\"},{\"name\":\"saffron\",\"qty\":0.5,\"unit\":\"tsp\"},{\"name\":\"mint leaves\",\"qty\":0.25,\"unit\":\"cup\"},{\"name\":\"cilantro\",\"qty\":0.25,\"unit\":\"cup\"}]",
        "steps": "[\"Marinate chicken with yogurt and half the spices for 1 hour.\",\"Soak saffron in warm milk for 10 minutes.\",\"Fry sliced onions until golden brown, set aside half for garnish.\",\"Cook marinated chicken with tomatoes until tender.\",\"Parboil rice with whole spices until 80% cooked.\",\"Layer rice and chicken in a heavy-bottomed pot.\",\"Sprinkle fried onions, mint, and cilantro between layers.\",\"Cover and cook on low heat for 20 minutes (dum cooking).\",\"Mix in saffron milk and serve hot with raita.\"]",
        "cuisine": "Indian",
        "tags": "[\"chicken\",\"rice\",\"dinner\",\"special occasion\"]",
        "cookTime": 40,
        "prepTime": 30,
        "totalTime": 70,
        "servings": 4,
        "difficulty": "medium",
        "nutrition": "{\"calories\":520,\"protein\":25,\"carbs\":65,\"fat\":15}",
        "imageUrl": "http://localhost:8000/public/images/chicken-biryani-local.webp",
        "sourceUrl": null,
        "createdBy": null,
        "mainIngredients": "[\"chicken\",\"basmati rice\",\"biryani masala\"]",
        "createdAt": "2025-10-05T19:54:05.594Z"
      }
    }
  ]
};

// Test accessing the data
console.log("Recipe title:", testData.recommendations[0].recipe?.title);
console.log("Recipe image:", testData.recommendations[0].recipe?.imageUrl);