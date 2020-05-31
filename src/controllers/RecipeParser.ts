import { Recipe } from "../entities/Recipe";
import { IRecipeParser } from "./IRecipeParser";

/**
 * Parses recipe JSON from request.
 * If parsing failes, returns null.
 */
export class RecipeParser implements IRecipeParser {

  public parse(recipeJson: any): Recipe | null {
    if (!recipeJson) return null;

    const isValid: boolean = !!recipeJson.name && typeof recipeJson.name === 'string'
      && !!recipeJson.description && typeof recipeJson.description === 'string'
      && !!recipeJson.howTo && typeof recipeJson.howTo === 'string'
      && Array.isArray(recipeJson.suplements);

    if (!isValid) return null;

    return {
      name: recipeJson.name,
      description: recipeJson.description,
      howTo: recipeJson.howTo,
      suplements: recipeJson.suplements
    };
  }
}
