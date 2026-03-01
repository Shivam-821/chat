# End-to-End Encryption Architecture (Hybrid E2EE)

This outlines the core idea of our End-to-End Encryption (E2EE) system, explaining how devices exchange keys to encrypt and decrypt messages quickly and securely without the server ever seeing the content.

We use **Hybrid Encryption** (ECDH + AES):
- **Asymmetric Encryption (ECDH):** Used to share keys securely.
- **Symmetric Encryption (AES):** Used to encrypt the actual message fast.

---

## Step 1: Each User Has Keys

When users register, their device generates a pair of cryptographic keys:

**Alice:**
- Alice Private Key (secret, stays on browser/device)
- Alice Public Key (shared, stored in Database)

**Bob:**
- Bob Private Key (secret, stays on browser/device)
- Bob Public Key (shared, stored in Database)

**The Rule:** The server only knows the Public Keys. The server NEVER sees private keys in plaintext (it only stores private keys backed up and encrypted via the user's password).

---

## Step 2: Alice Wants to Send "Hello"

Alice types "Hello". Now the encryption process starts.

---

## Step 3: Alice Fetches Bob's Public Key

Alice's frontend requests Bob's public key from the server:
`GET /users/bob/publickey`

The server returns: `BobPublicKey`.

---

## Step 4: Shared Secret Creation (The Magic Step)

Alice creates a **Shared Secret** by combining her Private Key and Bob's Public Key using the **ECDH algorithm**.

Conceptually:
```
AlicePrivate (123) + BobPublic (456) = SharedSecret (987654321)
```

---

## Step 5: Alice Creates AES Key

The Shared Secret directly translates to (or hashes to) an AES Key to be used for encrypting the chat message.

```
AESKey = HASH(SharedSecret)
AESKey = "XAJKSD8923JASD"
```

---

## Step 6: Alice Encrypts the Message

Alice encrypts the string "Hello" using the `AESKey`.

```
EncryptedMessage = "ASD89ASD98ASD"
```

---

## Step 7: Alice Sends the Message

Alice's socket sends the encrypted payload to the server:

```json
{
  "encryptedMessage": "ASD89ASD98ASD",
  "senderId": "Alice",
  "receiverId": "Bob"
}
```

**The server stores and forwards this encrypted message.** It cannot read "Hello" because it only sees "ASD89ASD98ASD".

---

## Step 8: Bob Receives the Message

Bob receives: `EncryptedMessage = ASD89ASD98ASD`.

---

## Step 9: Bob Creates the Same Shared Secret

Bob calculates the Shared Secret by combining his Private Key and Alice's Public Key. 

Conceptually:
```
BobPrivate (789) + AlicePublic (321) = SharedSecret (987654321)
```

**Why is it the same secret?** 
Because of the mathematical property of ECDH:
`AlicePrivate + BobPublic == BobPrivate + AlicePublic`

*(Analogy: 3 * 5 = 15, and 5 * 3 = 15)*

---

## Step 10: Bob Creates the AES Key

Bob performs the exact same operation Alice did to derive the AES Key from the Shared Secret.

```
AESKey = HASH(SharedSecret)
AESKey = "XAJKSD8923JASD"
```

---

## Step 11: Bob Decrypts

Bob uses the derived `AESKey` to decrypt the received message.

```
Decrypt("ASD89ASD98ASD", AESKey)
Result = "Hello"
```

---

## Visual Diagram summary

```text
Alice                Server               Bob

Hello
 ↓
Encrypt AES
 ↓
EncryptedMessage ---> Forward ---> EncryptedMessage
                                      ↓
                                   Decrypt AES
                                      ↓
                                    Hello
```

### Golden Rules

1. **Private Key** → Never leaves device (unless encrypted as a backup). Only used for Shared Secret generation.
2. **Public Key** → Stored in DB and safe to share. Used for Shared Secret generation.
3. **AES Key** → Generated locally per chat pair. Actually encrypts the messages.
