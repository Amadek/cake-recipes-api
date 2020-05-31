import { Recipe } from "../entities/Recipe";

/**
 * Parses recipe JSON. If parsing failes, returns null.
 */
export interface IRecipeParser {
  parse (recipeJson: any): Recipe | null;
}
