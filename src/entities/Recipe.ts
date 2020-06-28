
/**
 * Recipe model stored in DB.
 */
export class Recipe {
  /** Recipe Id. */
  public _id?: string;

  /** Recipe owner Id. */
  public ownerId?: number;

  /**
   * Recipe name.
   */
  public name?: string;

  /**
   * Recipe description.
   */
  public description?: string;

  /**
   * Description of preparation way.
   */
  public howTo?: string;

  /**
   * Array of suplements with quantity.
   */
  public suplements?: string[];
}
