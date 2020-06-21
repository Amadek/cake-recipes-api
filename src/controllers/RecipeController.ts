import express, { Router, Request, Response, NextFunction } from 'express';
import { Recipe } from '../entities/Recipe';
import { BadRequest, Forbidden, Unauthorized, NotFound } from 'http-errors';
import { Db } from 'mongodb';
import { IRecipeParser } from './IRecipeParser';
import { IJwtManager } from './IJwtManager';
import { User } from '../entities/User';
import { ObjectID } from 'mongodb';

/**
 * Controller performing CRUD operations on recipes.
 */
export class RecipeController {
  /**
   * Ctor.
   * @param _db database
   */
  public constructor (private readonly _jwtManager: IJwtManager, private readonly _recipeParser: IRecipeParser, private readonly _db: Db) { }

  /**
   * Sets up routes for a router and returns the router.
   */
  public route (): Router {
    const router: Router = express.Router();
    router.get('/name/:recipeName', this.getRecipesByName.bind(this));
    router.get('/id/:recipeId', this.getRecipeById.bind(this));
    router.post('/', this.postRecipe.bind(this));
    router.patch('/', this.patchRecipe.bind(this));
    router.put('/id/:recipeId', this.putRecipe.bind(this));
    return router;
  }

  /**
   * Gets recipes from db by name.
   * @param req request containing recipe name as param.
   * @param res response wit recipe
   * @param next express callback
   */
  public getRecipesByName (req: Request, res: Response, next: NextFunction): void {
    const recipeName: string = req.params.recipeName;
    if (!recipeName) throw new BadRequest('recipeName not provided.');

    Promise.resolve()
      .then(() => this._getRecipesByNameFromDb(recipeName))
      .then(recipe => res.status(200).send(recipe))
      .catch(next);
  }

  /**
   * Gets recipe from db by id.
   * @param req request containing recipeId as param
   * @param res response wit recipe
   * @param next express callback
   */
  public getRecipeById (req: Request, res: Response, next: NextFunction): void {
    const recipeId: string = req.params.recipeId;
    if (!recipeId || !ObjectID.isValid(recipeId)) throw new BadRequest('recipeId is invalid or not provided.');

    Promise.resolve()
      .then(() => this._getRecipeByIdFromDb(new ObjectID(recipeId)))
      .then(recipe => res.status(200).send(recipe))
      .catch(next);
  }

  /**
   * Adds recipe to db.
   * @param req request containing JSON recipe in body
   * @param res response
   * @param next express callback
   */
  public postRecipe (req: Request, res: Response, next: NextFunction): void {
    const user: User = this._parseJwt(req);

    Promise.resolve()
      .then(() => this._checkPermission(user.id))
      .then(() => {
        const recipe: Recipe | null = this._parseRecipe(req.body);
        if (!recipe) throw new BadRequest();
        recipe.ownerId = user.id;
        return recipe;
      })
      .then(recipe => this._addRecipeToDb(recipe))
      .then(({ insertedId }) => res.status(201).send(insertedId))
      .catch(next);
  }

  /**
   * Updates recipe in db.
   * @param req request containing JSON recipe in body
   * @param res response
   * @param next express callback
   */
  public patchRecipe (req: Request, res: Response, next: NextFunction): void {
    const user: User = this._parseJwt(req);

    Promise.resolve()
      .then(() => this._checkPermission(user.id))
      .then(() => {
        const recipe: Recipe | null = this._parseRecipe(req.body);
        if (!recipe) throw new BadRequest('Failed to parse recipe.');
        return recipe;
      })
      .then(recipe => this._updateRecipeInDb(recipe))
      .then(() => res.status(200).send('Updated.'))
      .catch(next);
  }

  /**
   * Deletes recipe from db by id.
   * @param req request containing recipe id as param
   * @param res response wit recipe
   * @param next express callback
   */
  public putRecipe (req: Request, res: Response, next: NextFunction): void {
    const user: User = this._parseJwt(req);

    Promise.resolve()
      .then(() => this._checkPermission(user.id))
      .then(() => {
        const recipeId: string = req.params.recipeId;
        if (!recipeId) throw new BadRequest('recipeId not provided.');
        return recipeId;
      })
      .then(recipeId => this._deleteRecipeFromDb(recipeId))
      .then(() => res.status(200).send('Deleted.'))
      .catch(next);
  }

  private _parseRecipe (recipeJson: any): Recipe | null {
    return this._recipeParser.parse(recipeJson);
  }

  private _parseJwt (req: Request): User {
    if (!req.headers.authorization) throw new Unauthorized('Invalid JWT.');

    const jwt = req.headers.authorization.replace('Bearer ', '');
    const user: User | null = this._jwtManager.parse(jwt);

    if (!user) throw new Unauthorized('Invalid JWT. User not parsed.');

    return user;
  }

  private _checkPermission (userId: number | undefined): Promise<void> {
    return Promise.resolve()
      // Checks is any associated permission with this userId.
      .then(() => this._db.collection('permission').count({ userId }, { limit: 1 }))
      .then(count => {
        if (count === 0) throw new Forbidden('You do not have sufficient permissions.');
      });
  }

  private _getRecipesByNameFromDb (recipeName: string): Promise<Recipe[]> {
    return this._db.collection('recipe').find({ name: { $regex: `.*${recipeName}.*` } }).toArray();
  }

  private _getRecipeByIdFromDb (recipeId: ObjectID): Promise<Recipe> {
    return this._db.collection('recipe').find({ _id: recipeId }, { limit: 1 }).toArray()
      .then(recipes => {
        if (recipes.length === 0) throw new NotFound('Not found recipe with specified Id.');
        return recipes[0];
      });
  }

  private _updateRecipeInDb (recipe: Recipe | null): Promise<any> {
    if (!recipe) throw new BadRequest();

    return this._db.collection('recipe').updateOne({ _id: new ObjectID(recipe._id) }, { $set: { name: recipe.name, description: recipe.description } });
  }

  private _addRecipeToDb (recipe: Recipe | null): Promise<any> {
    if (!recipe) throw new BadRequest();

    return this._db.collection('recipe').insertOne(recipe);
  }

  private _deleteRecipeFromDb (recipeId: string) {
    return this._db.collection('recipe').deleteOne({ _id: new ObjectID(recipeId) });
  }
}
