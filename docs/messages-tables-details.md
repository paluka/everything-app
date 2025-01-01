# Messages Tables Implementation Details

- Tables:

  - Conversation
  - Participant
  - Message
  - User

- Each conversation has many messages (Message) and many participants (Participant)
- Each participant has an associated conversation (Conversation), and user (User)
- Each message has an associated sender (User), conversation (Conversation), and status
- Participant entity is useful when a user can have different roles (eg. member, guest, admin) in different conversations, or when you need to track different conversation participant properties such as join date, last seen, status
