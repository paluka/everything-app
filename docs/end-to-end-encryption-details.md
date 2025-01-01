# End-To-End Encryption Implementation Details

- Uses asymmetric encryption using public/private key pairs
- Public/private key pairs are created when the user opens up the Messages page and enters a password
- The password is stored in-memory on the frontend. When the user reloads the app, they must re-enter the password again when visiting the Messages page
- The public key is persistently stored on the backend in the user table
- The private key is encrypted using the Messages page's entered password and persistenly stored on the backend in the user table
- When a user sends a message, two versions of the message are stored. One that is encrypted using the receiver's public key, and one that is encrypted using the sender's public key
- When a user receives a message, it decrypts their (the receiver's) private key using their in-memory password. The unencrypted private key is then used to decrypt the received message
- When a user reloads a conversation, it is able to decrypt and load the messages sent from the other user since the messages are encrypted using the user's own public key. For the messages that the user sent, the messages are encrypted using the other user's public key. This user does not have the other user's private key. To overcome this, as stated above, each message is stored twice using different encryption keys. Once using the message receiver's public key, and once using the message sender's public key. So a user can decrypt their own messages that they send by using their own private key to decrypt the messages.
