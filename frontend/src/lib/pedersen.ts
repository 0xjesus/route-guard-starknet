import { hash } from "starknet";

/**
 * Generate a Pedersen commitment from a secret passphrase.
 * commitment = pedersen(secret_felt, salt_felt)
 * where secret_felt = starknetKeccak(passphrase)
 * and salt_felt = starknetKeccak(passphrase + "_salt")
 */
export function generateCommitment(passphrase: string): {
  commitment: string;
  secret: string;
  salt: string;
} {
  const secret = hash.starknetKeccak(passphrase);
  const salt = hash.starknetKeccak(passphrase + "_salt");
  const commitment = hash.computePedersenHash(secret, salt);

  return {
    commitment,
    secret: secret.toString(),
    salt: salt.toString(),
  };
}

/**
 * Generate a random passphrase from BIP39-style words
 */
export function generatePassphrase(wordCount: number = 4): string {
  const words = [
    "alpha", "bravo", "carbon", "delta", "echo", "foxtrot", "gamma", "harbor",
    "igloo", "juliet", "kilo", "lima", "metro", "north", "oscar", "papa",
    "quest", "romeo", "sierra", "tango", "ultra", "victor", "whiskey", "xray",
    "yankee", "zulu", "bridge", "canyon", "drift", "ember", "frost", "grove",
    "haven", "ivory", "jade", "karma", "lunar", "maple", "nexus", "oasis",
    "prism", "quartz", "ridge", "solar", "torch", "urban", "vault", "wander",
    "zenith", "atlas", "blaze", "coral", "dawn", "eagle", "flame", "glacier",
    "horizon", "island", "jungle", "knight", "legend", "mirage", "noble", "orbit",
  ];
  const selected: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    selected.push(words[randomBytes[0] % words.length]);
  }
  return selected.join("-");
}
