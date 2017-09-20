#! /usr/bin/env node
"use strict";
// this is expected to run in nodejs
/* global require, module */
/* jshint esnext:true */

/**
 * TODO: I put this currently in here because I'm on an airplane and want
 * to resuse this docker image and probably some code as well. But,
 * this service should be separated from this image eventually. We'll
 * need a way to share some code though, maybe a `shared` lib via a symlink
 * that's then copied in the Dockerfiles.
 */


const rethinkdbdash = require('rethinkdbdash')
  // https://github.com/squaremo/amqp.node
  , amqplib = require('amqplib')
  , serverExports = require('./main.js')
  , getSetup = serverExports.getSetup
  , mergeArrays = serverExports.mergeArrays
  , fs = require('fs')
  , StringDecoder = require('string_decoder').StringDecoder
  , express = require('express')
  , http = require('http')
  ;

function Collectiontester(logging, portNum, amqpSetup, rethinkSetup) {
    this._log = logging;
    this._portNum = portNum;
    this._dbName = rethinkSetup.db;

    // FIXME: needs a new name, we use it for all reports!
    this._dbDNDTable = 'draganddrop';
    this._dbCollectionTable = 'collectiontests';
    this._amqpConnection = null;
    // this requests to start a collection wide test run.
    this._initQueueName = 'init_collecton_test_queue';

    this._app = express();
    this._server = http.createServer(this._app);

    // use this to shamelessly reuse the existing workers
    // NOTE: one problem could become that we'll have like up to
    // 6 times of the collections font size on the amqp queue, this will
    // likely become a bottleneck/memory problem.
    // but it is the fastest way to proceed. I thought about a kind of
    // file service where we can get the files directly, that should help
    // keep the queues working.
    this._dispatchQueueName = 'drag_and_drop_queue';

    // I'll copy this from my harddrive and don't do any updates now.
    // I'm on an airplane, data is expensive!
    this._fontsRepositoryPath = '/var/fonts';

    this._r = rethinkdbdash(rethinkSetup);
    // Start serving when the database and rabbitmq queue is ready
    Promise.all([
                 this._initDB()
               , this._initAmqp(amqpSetup)
               ])
    .then(this._listen.bind(this))
    .catch(function(err) {
        this._log.error('Can\'t initialize.', err);
        process.exit(1);
    }.bind(this));

    this._app.get('/family/filenames/:licensedir/:family', this.getFamilyFilenames.bind(this));
    this._app.get('/family/files/:licensedir/:family', this.getFiles.bind(this));
}

var _p = Collectiontester.prototype;

_p._query = function(dbTable) {
    return this._r.table(dbTable);
};

// copypasta from server.js
_p._initDB = function() {
    var createDatabase, createTable;

    createDatabase = function() {
        return this._r.dbCreate(this._dbName)
            .run()
            //.then(function(response) {/* pass */})
            .error(function(err){
                if (err.message.indexOf('already exists') !== -1)
                    return;
                throw err;
            });

    }.bind(this);

    createTable = function(dbTable) {
        return this._r.tableCreate(dbTable)
            .run()
            //.then(function(response) {/* pass */})
            .error(function(err){
            if (err.message.indexOf('already exists') !== -1)
                return;
            throw err;
        });
    }.bind(this);

    return createDatabase()
        .then(createTable.bind(this, this._dbDNDTable))
        .then(function(){
            return this._query(this._dbDNDTable)
                .indexCreate(this._dbCollectionTable + '_id')
                .run()
                .error(function(err){
                    if (err.message.indexOf('already exists') !== -1)
                        return;
                    throw err;
                });
        }.bind(this))
        .then(createTable.bind(this, this._dbCollectionTable))
        .catch(function(err) {
            // It's not an error if the table already exists
            this._log.warning('Error while initializing database.', err);
            throw err;
        }.bind(this));
};

// copypasta from server.js
_p._initAmqp = function(amqpSetup) {
    return amqplib.connect('amqp://' + amqpSetup.host)
            .then(function(connection) {
                process.once('SIGINT', connection.close.bind(connection));
                this._amqpConnection = connection;
            }.bind(this))
            .catch(function(err) {
                this._log.error('Error while connecting to queue.', err);
                throw err;
            }.bind(this));
};

_p._updateGIT = function() {
    // TODO: this is a placehoder to remind us that we should test the
    // requested version of the repository.
};

_p._fetchFamilies = function() {
    var licensdirs = ['ofl', 'apache', 'ufl']
      , i, l, dir
      , promises = []
      ;
    function addLicenseDir(licenseDir, files) {
        return files.map(function(file){
                                return [licenseDir, file].join('/');});
    }
    for(i=0,l=licensdirs.length;i<l;i++) {
        dir = [this._fontsRepositoryPath, licensdirs[i]].join('/');
        promises.push(readdir(dir)
                        .then(addLicenseDir.bind(null, licensdirs[i])));
    }

    // bind an [] Array to the thisval of this
    function reduce(arrays) {
        var result = [], i, l;
        for(i=0,l=arrays.length;i<l;i++)
            Array.prototype.push.apply(result, arrays[i]);
        return result;
    }
    return Promise.all(promises).then(reduce);
};


_p.getFamilyFilenames = function(req, res) {
    var path = [this._fontsRepositoryPath, req.params.licensedir
                                            , req.params.family].join('/');
    return readdir(path).then(function(files) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(files));
    });
};

_p.getFiles = function(req, res) {
    // packs the file part the same as the drag and drop does
    var dir = [req.params.licensedir, req.params.family].join('/');
    this.getPayload(dir).then(function(blob) {
        res.setHeader('Content-Type', 'appication/octet-stream');
        res.end(blob, 'binary');
    });
};

function str2Uint8Array(str) {
    // expecting str to be only ASCII chars, because serializing
    // higher unicode is not that straight forward.
    return Uint8Array.from(str,
                            function(chr){ return chr.charCodeAt(0);});
}

_p._packMessage = function  (docid, payload) {
    this._log.debug('_packMessage:', docid);
    var docidArray = str2Uint8Array(docid)
      , docidLen = new Uint32Array(1)
      ;
    docidLen[0] = docidArray.byteLength;
    this._log.debug('docidLen is', docidArray.byteLength
                                                , 'for docid:', docid);

    return mergeArrays([docidLen, docidArray, payload]);
};

function fs2Promise(func/* args */) {
    var args = [], i, l;
    for(i=1,l=arguments.length;i<l;i++)
        args.push(arguments[i]);

    return new Promise(function(resolve, reject) {
        // callback
        args.push(function(err, files) {
            if(err) reject(err);
            else resolve(files);
        });
        func.apply(null, args);
    });
}

function readdir(path) {
    return fs2Promise(fs.readdir.bind(fs), path);
}

_p.getPayload = function(dir) {
    this._log.debug('getPayload', dir, 'in', this._fontsRepositoryPath);
    // looks the same in the and as an initial drag'n'drop job
    var path = [this._fontsRepositoryPath, dir].join('/');

    function getJobEntry(fileName, fileBuffer) {
        var bytesJson = str2Uint8Array(JSON.stringify(
                                            {filename: fileName}))
            // header, json, font
          , job = [null, bytesJson, fileBuffer]
          , header, i, l
          ;
        header = new Uint32Array(job.length-1);
        // store at the beginning the length of each element
        for(i=1,l=job.length;i<l;i++) {
            header[i-1] = job[i].byteLength;
        }
        job[0] = header;
        return job;
    }

    function getJobEntries (path, fileNames) {
        var jobPromises = []
          , jobPromise
          , i, l
          ;
        for(i=0,l=fileNames.length;i<l;i++) {
            var fileName = fileNames[i];
            jobPromise = getFileBuffer([path,fileName].join('/'))
                            .then(getJobEntry.bind(null, fileName));
            jobPromises.push(jobPromise);
        }

        return Promise.all(jobPromises);
    }

    function packJobEntries(entries) {
        var job = [], i, l;
        for(i=0,l=entries.length;i<l;i++)
            Array.prototype.push.apply(job, entries[i]);
        return mergeArrays(job);
    }

    var getFileNames = readdir;

    function getFileBuffer(path){
        return fs2Promise(fs.readFile.bind(fs), path);
    }

    return getFileNames(path)
        .then(getJobEntries.bind(null, path))
        .then(packJobEntries);
};

_p._sendAMQPMessage = function (channel, queueName, message) {
    var options = {
            // TODO: do we need persistent here/always?
            persistent: true // same as deliveryMode: true or deliveryMode: 2
        }
        ;
    function onAssert() {
        // jshint validthis:true
        this._log.info('sendToQueue: ', queueName);
        return channel.sendToQueue(queueName, message, options);
    }
    return channel.assertQueue(queueName, {durable: true})
           .then(onAssert.bind(this))
           .finally(function(){ channel.close(); })
           ;
};

_p._dispatchJob = function(familyDir, dbResponse) {
    var docid = dbResponse.generated_keys[0]
      , job = {
            // use this to get the filenames/files of the family
            family: familyDir
            // use this to safe the test results
          , docid: docid
          , type: 'collectiontest'
        }
      , message = Buffer.from(JSON.stringify(job), 'utf8')
      , channelPromise = this._amqpConnection.createChannel()
      ;

    return Promise.all([channelPromise, this._dispatchQueueName, message])
         // like: this._sendAMQPMessage.apply(this, [channel, queueName, message])
        .then(this._sendAMQPMessage.apply.bind(this._sendAMQPMessage, this));
};

_p._dispatchDragAndDropStyleJob = function(familyDir, dbResponse) {
    // this is the report docid NOT the collectiontestId
    var docid =  dbResponse.generated_keys[0]
      , messagePromise = Promise.all([
            docid
          , this.getPayload(familyDir)
           // args = [docid, payload]
        ]).then(this._packMessage.apply.bind(this._packMessage, this))
      , channelPromise = this._amqpConnection.createChannel()
      ;
    this._log.debug('_dispatchJob', familyDir, 'job docid:', docid);

    return Promise.all([channelPromise, this._dispatchQueueName, messagePromise])
         // like: this._sendAMQPMessage.apply(this, [channel, queueName, message])
        .then(this._sendAMQPMessage.apply.bind(this._sendAMQPMessage, this));

};

_p._dbInsertDoc = function(dbTable, doc) {
    return this._query(dbTable).insert(doc)
            .run()
            .error(function(err) {
                this._log.error('Creating a doc failed ', err);
            }.bind(this));
};

_p._comissionFamily = function(collectiontestId, familyDir) {
    this._log.debug('_comissionFamily', collectiontestId, familyDir);
    var doc = {
        created: new Date()
      , family_dir: familyDir
    };
    // very important
    doc[this._dbCollectionTable + '_id'] = collectiontestId;

    return this._dbInsertDoc(this._dbDNDTable, doc)
        .then(this._dispatchJob.bind(this, familyDir))
        // needs .error if dispatchJob fails?
        .catch(function(err) {
            this._log.error('dispatchJob failed ', err);
        }.bind(this));
};

_p._comissionFamilies = function(collectiontestId, families) {
    this._log.debug('_comissionFamilies', collectiontestId, 'families:', families.length);
    var i, results = []
      , numJobs = families.length
      , maxJobs
      ;

    if('DEVEL_MAX_JOBS' in process.env) {
        maxJobs = parseInt(process.env.DEVEL_MAX_JOBS, 10);
        if(maxJobs !== maxJobs)
            maxJobs = numJobs;
        this._log.info('Environment variable DEVEL_MAX_JOBS is:'
                        , process.env.DEVEL_MAX_JOBS, 'maxJobs is', maxJobs
                        , 'numJobs is', numJobs);
        numJobs = Math.min(maxJobs, numJobs);
    }

    for(i=0;i<numJobs;i++)
        results.push(this._comissionFamily(collectiontestId, families[i]));
    return Promise.all(results);
};

_p._initJob = function(channel, message) {
    var decoder = new StringDecoder('utf8')
      , collectiontestId = JSON.parse(decoder.write(Buffer.from(message.content))).docid
      ;
    this._log.debug('_initJob', collectiontestId);
    channel.ack(message);
    // update git
    this._updateGIT();
    // get all family directories:
    // TODO: write the `started` field to the collectiontestId doc
    return this._fetchFamilies()
        .then(this._comissionFamilies.bind(this, collectiontestId))
        .catch(function(err) {
            this._log.error('Error initializing job:', err);
            // let this to hurt.
            throw err;
        });
};

_p._consumeQueue = function(queueName, channel) {
    var consume = channel.consume.bind(channel, queueName
                                    , this._initJob.bind(this, channel));
    return channel.assertQueue(queueName).then(consume);
};

_p._listen = function() {
    this._log.debug('_listen');

    this._server.listen(this._portNum);
    this._log.info('Listening to port', this._portNum);

    this._amqpConnection.createChannel()
           .then(this._consumeQueue.bind(this, this._initQueueName));
};

if (typeof require != 'undefined' && require.main==module) {
    var setup = getSetup();
    setup.logging.info('Init server ...');
    new Collectiontester(setup.logging, 3000, setup.amqp, setup.rethink);
}
