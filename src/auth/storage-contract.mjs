export const AccountStorageContract = Object.freeze({
  methods: Object.freeze([
    "createAccount",
    "getAccountByUsername",
    "getAccountByEmail",
    "updateAccountStatus",
    "markEmailVerified",
  ]),
});

export const SessionStorageContract = Object.freeze({
  methods: Object.freeze([
    "createSession",
    "getSessionById",
    "findSessionByTokenHash",
    "revokeSession",
    "listSessionsByIdentity",
  ]),
});

export const UserDataStorageRules = Object.freeze({
  serverOwned: Object.freeze([
    "identityId",
    "normalizedUsername",
    "normalizedEmail",
    "passwordHash",
    "accountStatus",
    "emailVerifiedAt",
    "createdAt",
    "updatedAt",
  ]),
  neverPlaintext: Object.freeze([
    "password",
    "verificationCode",
    "bearerToken",
    "apiKey",
  ]),
  applicationOwned: Object.freeze([
    "profile",
    "preferences",
    "consentedMemory",
    "applicationData",
  ]),
});

export function assertStorageAdapter(adapter, contract = AccountStorageContract) {
  if (!adapter || typeof adapter !== "object") throw new TypeError("Storage adapter is required");
  for (const method of contract.methods) {
    if (typeof adapter[method] !== "function") throw new TypeError(`Storage adapter missing method: ${method}`);
  }
  return adapter;
}
