--Remove the user test4
DELETE FROM Members 
WHERE Email='test4@test.com';

--Add the User test4  (password is: test12345)
INSERT INTO 
    Members(FirstName, LastName, Username, Email, Password, Salt)
VALUES
    ('test4First', 'test4Last', 'test4', 'test4@test.com', 'aafc93bbad0671a0531fa95168c4691be3a0d5e033c33a7b8be9941d2702e566', '5a3d1d9d0bda1e4855576fe486c3a188e14a3f1a381ea938cacdb8c799a3205f');

--Remove the user test5
DELETE FROM Members 
WHERE Email='test5@test.com';

--Add the User test5 (password is: test12345)
INSERT INTO 
    Members(FirstName, LastName, Username, Email, Password, Salt)
VALUES
    ('test5First', 'test5Last', 'test5', 'test5@test.com', 'aafc93bbad0671a0531fa95168c4691be3a0d5e033c33a7b8be9941d2702e566', '5a3d1d9d0bda1e4855576fe486c3a188e14a3f1a381ea938cacdb8c799a3205f');

--Create Second Chat room, ChatId 2
INSERT INTO
    chats(chatid, name)
VALUES
    (2, 'Second Chat')
RETURNING *;

--Add the five test users to Global Chat
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 2, Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
    OR Members.Email='test4@test.com'
    OR Members.Email='test5@test.com'
RETURNING *;

--Add Multiple messages to create a conversation
INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Hello world!',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'this is a chatroom',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Hey Test1, how is it going?',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'This is a message',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'I am well.',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Lets get down to business',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'to defeat the Huns.',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'That is a song',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'words',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'also words',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'we all like to say many words',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Here are some more words',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Making apps is making me cry',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;


INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Am I the only one who hates Java?',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Java is a language.',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Java is a nightmare.',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Who needs apps anyways?',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'I like money',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Money is good',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'more words still',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'yada yada',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'wow, thats a lot of messages to make up.',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'seriously, why are there so many messages.',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'I need to stop making fake messages',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'goodbye',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'goodbye',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'Sounds like a plan',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'goodbye',
    Members.MemberId
FROM Members
WHERE Members.Email='test4@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'lets stop talking',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'ending this conversation',
    Members.MemberId
FROM Members
WHERE Members.Email='test5@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    2, 
    'c ya l8r sk8r boi',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;