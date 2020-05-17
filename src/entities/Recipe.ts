
/**
 * Recipe model stored in DB.
 */
export class Recipe {
  /**
   * Recipe name.
   */
  public name: string = '';

  /**
   * Recipe description.
   */
  public description: string = '';

  /**
   * Description of preparation way.
   */
  public howTo: string = '';

  /**
   * Array of suplements with quantity.
   */
  public suplements: string[] = [];
}
