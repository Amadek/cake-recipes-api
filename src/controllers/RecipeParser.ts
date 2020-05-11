import { Recipe } from "../entities/Recipe";

/**
 * Parses recipe JSON from request.
 * If parsing failes, returns null.
 */
export class RecipeParser {
  /**
   * Ctor.
   * @param _recipeJson recipe as JSON object
   */
  public constructor (private readonly _recipeJson: any) { }

  public parse(): Recipe | null {
    if (!this._recipeJson) return null;

    const isValid: boolean = !!this._recipeJson.name && typeof this._recipeJson.name === 'string'
      && !!this._recipeJson.description && typeof this._recipeJson.description === 'string'
      && !!this._recipeJson.howTo && typeof this._recipeJson.howTo === 'string'
      && Array.isArray(this._recipeJson.suplements);

    if (!isValid) return null;

    return {
      name: this._recipeJson.name,
      description: this._recipeJson.description,
      howTo: this._recipeJson.howTo,
      suplements: this._recipeJson.suplements
    };
  }
}
