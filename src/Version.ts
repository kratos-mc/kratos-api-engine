import needle, { NeedleOptions } from "needle";
import { AssetIndexReference, getAssetIndexFromReference } from "./Asset";
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
  action: GameVersionAction;
  os: GameVersionOperatingSystem;
}

export type GameVersionOperatingSystemName = "osx" | "linux" | "windows";
export type GameVersionOperatingSystemArch = "x64" | "x86";
export interface GameVersionOperatingSystem {
  name?: GameVersionOperatingSystemName;
  version?: RegExp;
  arch?: GameVersionOperatingSystemArch;
}

export type GameVersionReleaseType = "release" | "snapshot" | "old_alpha";

export interface GameVersionResponse {
  arguments: {
    game: [string | GameVersionGameArguments];
    jvm: [string | GameVersionJvmArguments];
  };

  assetIndex: AssetIndexReference;

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
  type: GameVersionReleaseType;
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

export interface RequestLibraryOptions {
  platform?: NodeJS.Platform;
  arch?: "x64" | "x86";
  version?: string;
}

/**
 * Represents a content inside asset index files.
 * The asset index file, in general, have a format likes:
 *
 * ```json
 * "objects": {
 *    "path/to/asset_name": {
 *        "hash": "..."
 *         "size": 123
 *     },
 *     "path/to/asset_name_2": {
 *        "hash": "..."
 *         "size": 456
 *     },
 * }
 * ```
 */
export interface AssetIndexContent {
  objects: {
    [key: string]: {
      hash: string;
      size: number;
    };
  };
}

/**
 * Represents a utility class for GameVersionResponse.
 *
 * ```javascript
 * let response: GameVersionResponse = //...
 * let utils = new GameVersionResponseUtils(response);
 * ```
 *
 * This utility class provides many shorter API to resolve assets, libraries, runtime assets, ...
 */
export class GameVersionResponseUtils {
  private response: GameVersionResponse;

  constructor(response: GameVersionResponse) {
    if (response === undefined || response === null) {
      throw new Error("Response cannot be undefined");
    }

    this.response = response;
  }

  /**
   * Get a major java version from the response. For examples,
   * - 8 (for Java 8)
   * - 17 (for Java 17)
   * - ...
   *
   * @returns a major version of the java (runtime)
   */
  public getJavaVersionMajor() {
    return this.response.javaVersion.majorVersion;
  }

  /**
   * Get a raw asset index from current response file.
   *
   * @returns a raw asset index from current response file
   */
  public getAssetIndex() {
    return this.response.assetIndex;
  }

  /**
   * Get asset index content from the raw asset index as reference.
   *
   * @param options a request, response options
   * @returns a received asset index from mojang api
   * @see NeedleOptions an options of needle library
   * @see AssetIndexContent a asset index content interface
   */
  public async getAssetIndexContents(
    options?: NeedleOptions
  ): Promise<AssetIndexContent> {
    return await getAssetIndexFromReference(this.getAssetIndex(), options);
  }
  /**
   * Test whether or not the library rule is match
   *
   * @param libraryRule a library rule to test
   * @param os an operating system name
   * @param arch architechture of the system
   * @param version a version of the operating system
   * @returns true if the rule is compatible, false otherwise
   */
  private assertLibraryRuleCompatibility(
    libraryRule: GameVersionLibraryRule,
    os?: GameVersionOperatingSystemName,
    arch?: GameVersionOperatingSystemArch,
    version?: string
  ) {
    // If the os name is not compatible
    if (os !== undefined && libraryRule.os.name !== os) return false;

    // If the arch is not compatible
    if (arch !== undefined && libraryRule.os.arch !== arch) return false;

    // If the version is not match
    if (version !== undefined && !libraryRule.os.version?.test(version))
      return false;

    return true;
  }

  /**
   * Get all libraries of the current version package
   *
   * @param options an options for getting match libraries
   * @returns the list of library based on provided options
   */
  public getLibraries(options?: RequestLibraryOptions) {
    // Return a whole libraries if options is not defined
    if (options === undefined) {
      return this.response.libraries;
    }

    // Otherwise, find any match case or non-conditional case
    return this.response.libraries
      .map((library) => {
        // If the library have no rule, accept it
        if (!library.rules) {
          return library;
        }

        return library.rules.every((rule) => {
          const predicate =
            rule.action === "allow" &&
            this.assertLibraryRuleCompatibility(
              rule,
              options.platform === "darwin"
                ? "osx"
                : options.platform === "linux"
                ? "linux"
                : "windows",
              options.arch,
              options.version
            );

          return predicate;
        })
          ? library
          : null;
      })
      .filter((item) => item !== null);
  }

  public getMainClass() {
    return this.response.mainClass;
  }

  public getType() {
    return this.response.type;
  }
}
