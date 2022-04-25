const oracledb=require('oracledb');
const req=require('request');
const http=require('http');
const fs = require('fs');
const url = require('url');
const path=require('path')
const express=require('express');
const res = require('express/lib/response');
const { DEC8_SWEDISH_CI } = require('mysql/lib/protocol/constants/charsets');
const port=3001;
const app=express();



app.set('views','./views');