import express, { Router, Request, Response, NextFunction } from 'express';
import { Recipe } from '../entities/Recipe';
import { BadRequest } from 'http-errors';
import { Db } from 'mongodb';
import { RecipeParser } from './RecipeParser';
import { validator } from './validator';

/**
 * Controller performing CRUD operations on recipes.
 */
export class RecipeController {
  /**
   * Ctor.
   * @param _db database
   */
  public constructor (private readonly _db: Db) { }

  /**
   * Sets up routes for a router and returns the router.
   */
  public route (): Router {
    const router: Router = express.Router();
    router.post('/', this.postRecipe.bind(this));
    return router;
  }

  /**
   * Adds recipe to db.
   * @param req request containing JSON recipe in body
   * @param res response
   * @param next express callback
   */
  public postRecipe (req: Request, res: Response, next: NextFunction): void {
    Promise.resolve()
      .then(() => this._parseRecipe(req.body))
      .then(recipe => {
        if (!recipe) throw new BadRequest();

        return this._addRecipeToDb(recipe);
      })
      .then(() => res.status(200).send('OK'))
      .catch(next);
  }

  /**
   * Gets recipe from DB
   * @param req request containing recipe name  
   * @param res response
   * @param next express callback
   */
  public getRecipe (req: Request, res: Response, next: NextFunction, recipeName:string): void {
    var sanitizer = require('Sanitize')();
    Promise.resolve()
    .then(() => sanitizer.Sanitize(recipeName))
    .then(()=> {
      if (!validator.isAlphanumeric(recipeName)) throw new BadRequest();

      return this._fetchRecipeFromDbByName(recipeName);
      })

    .then(() => res.status(200).send('OK'))
    .catch(next)
  }


  /**
   * Gets multiple recipes from database 
   * @param req request containing letters 
   * @param res response
   * @param next express callback
   */
  public getMultipleRecipes (req: Request, res: Response, next: NextFunction, query:string): void {
    var sanitizer = require('Sanitize')();
    Promise.resolve()
    .then(() => sanitizer.Sanitize(query))
    .then(()=> {
      if (!validator.isAlphanumeric(query)&& query.length < 3 ) throw new BadRequest();

      return this._fetchMultipleRecipes(query);
      })

    .then(() => res.status(200).send('OK'))
    .catch(next)
  }

  private _parseRecipe (recipeJson: any): Recipe | null {
    return new RecipeParser(recipeJson).parse();
  }

  private _addRecipeToDb (recipe: Recipe): Promise<any> {
    return this._db.collection('recipe').insertOne(recipe);
  }
  
  private _fetchRecipeFromDbByName (name: string): Promise<any> {
    return this._db.collection('recipe').findOne({name});
  }
  
  private _fetchMultipleRecipes (query: string): Promise<any> {
    return this._db.collection('recipe').find({Name: new RegExp('^' + query)}).toArray();
  }
}

