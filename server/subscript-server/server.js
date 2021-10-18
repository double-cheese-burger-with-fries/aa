const { execute, subscribe } = require('graphql')
const { createServer } = require('http')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const express = require('express')


const server = express()
const ws =  createServer(server)