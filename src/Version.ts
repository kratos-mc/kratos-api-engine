import needle from "needle";
import { GameManifestVersion } from "./Manifest";

export type GameVersionAction = "allow" | "deny";

export interface GameVersionGameArguments {
  rules: [
    {
      action: GameVersionAction;
      features: { has_custom_resolution: boolean } | { is_demo_user: boolean };
    }
  ];
  value: string | [string];
}

export interface GameBundleInfo {
  sha1: string;
  size: number;
  url: string;
}

export interface GameVersionJvmArguments {
  rules: [
    {
      action: GameVersionAction;
      os: GameVersionOperatingSystem;
    }
  ];
  value: string | [string];
}

export interface GameVersionLibrary {
  downloads?: GameVersionLibraryDownloads;
  name?: string;
  rules?: GameVersionLibraryRule[];
}

export interface GameVersionLibraryDownloads {
  artifact: GameVersionLibraryArtifact;
}

export interface GameVersionLibraryArtifact {
  path: string;
  sha1: string;
  size: number;
  url: string;
}

export interface GameVersionLibraryRule {
  action: string | "allow" | "deny";
  os: GameVersionOperatingSystem;
}

export interface GameVersionOperatingSystem {
  name?: "osx" | "linux" | "windows";
  version?: RegExp;
  arch?: string;
}

export interface GameVersionResponse {
  arguments: {
    game: [string | GameVersionGameArguments];
    jvm: [string | GameVersionJvmArguments];
  };

  assetIndex: {
    id: string;
    sha1: string;
    size: number;
    totalSize: number;
    url: string;
  };

  assets: string | number;
  complianceLevel: string;

  downloads: {
    client: GameBundleInfo;
    client_mappings: GameBundleInfo;
    server: GameBundleInfo;
    server_mappings: GameBundleInfo;
  };

  id: string;
  javaVersion: {
    component: string;
    majorVersion: number;
  };

  libraries: GameVersionLibrary[];
  logging: {
    client: {
      argument: string;
      file: {
        id: string;
        sha1: string;
        size: number;
        url: string;
      };
      type: string | "log4j2-xml";
    };
  };

  mainClass: string;
  minimumLauncherVersion: number;
  releaseTime: Date;
  time: Date;
  type: "release" | "snapshot" | "old_alpha";
}

/**
 * Receives a Minecraft version from manifest version profile.
 *
 * @param gameVersion a manifest game version which contains version url to fetch
 * @returns a response of the version which fetch from url
 */
export async function getVersion(
  gameVersion: GameManifestVersion
): Promise<GameVersionResponse> {
  const response = await needle("get", gameVersion.url);
  return response.body;
}
