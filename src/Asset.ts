import needle, { NeedleOptions } from "needle";

/**
 * A reference that point to the asset json file.
 * Asset json file contains all asset item references to download.
 *
 */
export interface AssetIndexReference {
  /**
   * The id of the asset.
   */
  id: string;
  /**
   * Checksum as sha1 for the asset json file.
   */
  sha1: string;
  /**
   * File size of the json reference.
   */
  size: number;
  /**
   * Total file size for all assets inside the reference after downloaded.
   */
  totalSize: number;
  /**
   * Url that point to json file.
   */
  url: string;
}

export async function getAssetIndexFromReference(
  reference: AssetIndexReference,
  options?: NeedleOptions
) {
  const response = await needle("get", reference.url, options);

  return response.body;
}
