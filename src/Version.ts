import needle from "needle";
import { GameManifestVersion } from "./Manifest";

export async function getVersion(gameVersion: GameManifestVersion) {
  const response = await needle("get", gameVersion.url);
  return response.body;
}
