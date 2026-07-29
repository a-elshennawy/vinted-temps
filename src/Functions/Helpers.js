import CryptoJS from "crypto-js";
import { supabase } from "../supabase";

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + " read more...";
}

const SECRET = import.meta.env.VITE_APP_SECRET;

export function encryptPassword(plainText) {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(SECRET, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });
  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv });

  return `${salt.toString()}:${iv.toString()}:${encrypted.toString()}`;
}

export function decryptPassword(packed) {
  const [saltHex, ivHex, cipherText] = packed.split(":");
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const key = CryptoJS.PBKDF2(SECRET, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });

  const decrypted = CryptoJS.AES.decrypt(cipherText, key, { iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function maskPassword(password) {
  return password.replace(/./g, "•");
}

export async function addRepliesToAgent(vinted_id, replies) {
  if (!vinted_id)
    throw new Error("Agent ID is required to add to their replies");
  if (!replies) return;

  const { data, error: fetchError } = await supabase
    .from("agents")
    .select("replies")
    .eq("vinted_id", vinted_id)
    .single();

  if (fetchError) throw fetchError;

  const newReplies = (data?.replies || 0) + replies;

  const { error: updateError } = await supabase
    .from("agents")
    .update({ replies: newReplies })
    .eq("vinted_id", vinted_id);

  if (updateError) throw updateError;
}
