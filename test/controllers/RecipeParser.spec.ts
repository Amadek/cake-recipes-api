import 'mocha';
import { RecipeParser } from '../../src/controllers/RecipeParser';
import { Recipe } from '../../src/entities/Recipe';
import assert from 'assert';

describe('RecipeParser', () => {
  describe('parse', () => {
    it('parseValidRecipe', () => {
      // ARRANGE
      const recipeJson: any = {
        name: 'name',
        description: 'description',
        howTo: 'howTo',
        suplements: ['suplement 1', 'suplement 2']
      };
      // ACT
      const recipe: Recipe | null = new RecipeParser(recipeJson).parse();
      // ASSERT
      assert.notStrictEqual(recipe, null);
    });

    it('parseInvalidRecipe', () => {
      // ARRANGE
      const recipeJson: any = {
        name: 1,
        description: 2,
        howTo: 3,
        suplements: 4
      };
      // ACT, ASSERT
      let recipe: Recipe | null = new RecipeParser(recipeJson).parse();
      assert.strictEqual(recipe, null);

      recipeJson.name = 'name';
      recipe = new RecipeParser(recipeJson).parse();
      assert.strictEqual(recipe, null);

      recipeJson.description = 'description';
      recipe = new RecipeParser(recipeJson).parse();
      assert.strictEqual(recipe, null);

      recipeJson.howTo = 'howTo';
      recipe = new RecipeParser(recipeJson).parse();
      assert.strictEqual(recipe, null);

      recipeJson.suplements = ['suplement 1', 'suplement 2'];
      recipe = new RecipeParser(recipeJson).parse();
      assert.notStrictEqual(recipe, null);
    });
  })
});
