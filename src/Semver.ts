/**
 * A Minecraft version which are remaining by Mojang to build
 * Minecraft version. There are two different types of semver.
 *
 *
 * The version Id looks like a semver (https://semver.org):
 * - 1.19
 * - 1.19.2
 * - 1.8
 * - 1.12.4
 * - 23w05a
 * - 22w46a
 * - 1.19.3-pre1
 * - 1.19.3-rc3
 *
 */
export type MinecraftVersionId = MinecraftSemver | MinecraftSnapshotSemver;

/**
 * Some snapshot versions look very awkward like:
 * - 22w46a
 * - 22w46a
 */
export type MinecraftSnapshotSemver = string;
/**
 * Typical semver version id
 */
export type MinecraftSemver = string;
