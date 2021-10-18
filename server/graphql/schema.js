const { gql } = require('apollo-server-express');
const resolvers = require('./resolvers/index')

const typeDefs = gql`
    type User {
        id: ID
        email: String!
        password: String
        name: String
    }
	
		type Message {
			content: String
		}
		
    input UserInputData {
        email: String!
        password: String!
    }

    input renewPassword {
        email: String!
        oldPassword: String!
        newPassword: String!
    }

    input EditUser{
        requestEmail: String!
        name: String!
        lastName: String!
        email: String!
        interests: [String!]!
        bio: String!
        gender: String!
        orientation: String!
    }
		
		input UserProfileInfo {
				firstName: String!
				lastName: String!
				dob: String!
				gender: String!
				orientation: String!
		}
		
		input UserPictureInfo {
				profilePic: String!
				picture2: String
				picture3: String
				picture4: String
				picture5: String
		}
		
		input UserBioInfo {
				job: String!
				interests: [String!]!
				bio: String!
		}
		
    type AuthData {
        token: String!
        userId: String!
        isOnboarded: Boolean!
    }

    input emailData {
        email: String!
        subject: String!
    }
    
    type UserData {
        id: Int
        firstName: String!
        lastName: String!
        email: String!
        dob: String!
        gender: String!
        orientation: String!
        job: String!
        bio: String!
        profilePic: String!
        picture2: String
        picture3: String
        picture4: String
        picture5: String
        latitude: Float
        longitude: Float
        isOnboarded: Boolean!
        interests: [String]
        blocked: Boolean
        address: String
    }
    
    input MatchFilter {
        gender: String!
        orientation: String!
        minAge: Int!
        maxAge: Int!
        interests: [String]
        latitude: Float
        longitude: Float
        radius: Int
    }
    
    input LikeInput {
        receiverId: Int!
        liked: Boolean
    }
    
     input BlockInput {
        receiverId: Int!
        blocked: Boolean
    }
    
    type LikeData {
        likeTo: Boolean!
        likeFrom: Boolean!
    }
    
    type RelationsData {
        likeTo: Boolean!
        likeFrom: Boolean!
        blockTo: Boolean!
        blockFrom: Boolean!
    }
    
    type UserMessage {
        senderId: Int!
        receiverId: Int!
        content: String!
        timestamp: String!
        seen: Boolean
        conversationId: String
        conversationName: String
        otherId: Int
        picture: String
    }
    
    type Conversation {
        messages: [UserMessage]
    }
    
    
    type Like {
      value: Boolean
      sender: Int
    }

    type Notification {
        senderId: Int!
        senderName: String
        type: String!
        seen: Boolean
        createdAt: String
    }

    type Visited {
        sender: Int!
    }
    
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getUserData(id: Int!): UserData
        getUserAgentData: UserData
        relationsData(id: Int!): RelationsData
        isOnboarded: Boolean!
        match(filters: MatchFilter) : [UserData]
        usedInterests: [String]!
        likeInfo(info: LikeInput) : LikeData
        conversations: [[UserMessage]]
        notifications: [Notification]!
    }

    type RootSubscription {
        likeToggled (userId: Int!) : Like
        trackNotification (userId: Int!): Notification
        trackProfileVisited (userId: Int!) :  Visited
        newMessage (userId: Int!) : UserMessage
    }
    
    type RootMutation {
        createUser(userInput: UserInputData) : User!
        editUser(userInput: EditUser): Message
        emailConfirmation(token: String!): AuthData!
        passwordResetEmail(data: emailData) : Message
        resetPassword(token: String!, password: String!, confirmationPassword: String!): AuthData!
        changePassword(info: renewPassword): Message
        insertProfileInfo(info: UserProfileInfo) : Message 
        insertPictureInfo(info: UserPictureInfo) : Message
        insertBioInfo(info: UserBioInfo) : Message
        markOnboarded : Message
        resendConfirmationEmail(email: String): Message 
        toggleLike(info: LikeInput): Message
        toggleBlock(info: BlockInput): Message
        profileVisited(receiverId: Int!): Message
        saveLocation(lat: Float!, long: Float!, address: String) : Message
        markNotificationsAsSeen : Message
        markMessagesAsSeen(senderId: Int!) : Message
        sendMessage(content: String!, receiverId: Int!) : Message
        reportUser(userId: Int!): Message
    }

    schema {
        query: RootQuery
        mutation: RootMutation
        subscription: RootSubscription
    }
`

module.exports = typeDefs
