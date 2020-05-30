import { RecipeParser } from '../../src/controllers/RecipeParser';
import { Recipe } from '../../src/entities/Recipe';

describe('RecipeParser', () => {
  describe('parse', () => {
    it('should parse valid', () => {
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
      expect(recipe).toBeDefined();
    });

    it('should not parse with invalid name', () => {
      // ARRANGE
      const recipeJson: any = {
        name: 1,
        description: 2,
        howTo: 3,
        suplements: 4
      };
      // ACT
      const recipe: Recipe | null = new RecipeParser(recipeJson).parse();
      // ASSERT
      expect(recipe).toBeNull();
    });

    it('should not parse with invalid description', () => {
      // ARRANGE
      const recipeJson: any = {
        name: 'name',
        description: 2,
        howTo: 3,
        suplements: 4
      };
      // ACT
      const recipe: Recipe | null = new RecipeParser(recipeJson).parse();
      // ASSERT
      expect(recipe).toBeNull();
    });

    it('should not parse with invalid howTo', () => {
      // ARRANGE
      const recipeJson: any = {
        name: 'name',
        description: 'description',
        howTo: 3,
        suplements: 4
      };
      // ACT
      const recipe: Recipe | null = new RecipeParser(recipeJson).parse();
      // ASSERT
      expect(recipe).toBeNull();
    });

    it('should not parse with invalid suplements', () => {
      // ARRANGE
      const recipeJson: any = {
        name: 'name',
        description: 'description',
        howTo: 'howTo',
        suplements: 4
      };
      // ACT
      const recipe: Recipe | null = new RecipeParser(recipeJson).parse();
      // ASSERT
      expect(recipe).toBeNull();
    });
  });
});
