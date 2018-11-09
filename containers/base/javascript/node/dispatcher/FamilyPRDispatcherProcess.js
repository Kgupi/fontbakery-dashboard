"use strict";
/* jshint esnext:true, node:true*/

const { Process:Parent } = require('./framework/Process')
    , { Step } = require('./framework/Step')
    , { Task, finishingStatuses } = require('./framework/Task')
    , { string2statusCode, FAIL, OK } = require('./framework/Status')
    , { FamilyRequest } = require('protocolbuffers/messages_pb')
    , {mixin: stateManagerMixin} = require('./framework/stateManagerMixin')
    ;

// This is an empty function to temporarily disable jshint
// "defined but never used" warnings and to mark unfinished
// business
function TODO(){}

function renderMD(){
    return '**NOT IMPLEMENTED:** renderMD';
}

const EmptyTask = (function(){

// just a placeholder to get infrastructure running before actually
// implementing this module.
const Parent = Task;
function EmptyTask(step, state) {
    Parent.call(this, step, state);
}

const _p = EmptyTask.prototype = Object.create(Parent.prototype);
_p.constructor = EmptyTask;

_p._activate = function() {
    this._setOK('EmptyTask is OK on activate.');
};

return EmptyTask;
})();



const GetFamilyDataTask = (function(){

const Parent = Task;
function GetFamilyDataTask(step, state) {
    Parent.call(this, step, state);
}

const _p = GetFamilyDataTask.prototype = Object.create(Parent.prototype);
_p.constructor = GetFamilyDataTask;

/**
 * _activate runs when the step is activated the first time
 * and it possibly re-runs when explicitly requested; e.g. a Task
 * can be re-tried via the UI, in some cases, when dependent from
 * external sources this may change the result of the task.
 */
_p._activate = function() {
    var familyRequest = new FamilyRequest();
    familyRequest.setSourceid('CSVSpreadsheet');
    familyRequest.setFamilyName(this.process.familyName);
    return this.grpcSourceClient.get(familyRequest)
        .then(familyDataMessage => {
            // this is nice, we'll have all the info of the files
            // of the progress available in the document
            let familyDataSummaryMarkdown = renderMD(familyDataMessage);
            this._setLOG(familyDataSummaryMarkdown);
            return this._setSharedData('familyData', familyDataMessage)
                .then(()=>this._setOK('Family data is persisted.'));
        });
        // error case will be handled and FAIL will be set
};

return GetFamilyDataTask;
})();


const InitProcessStep = (function() {
const Parent = Step;
function InitProcessStep(process, state) {
    Parent.call(this, process, state, {
        GetFamilyData: GetFamilyDataTask // => where to put the files etc?
    });
}

const _p = InitProcessStep.prototype = Object.create(Parent.prototype);
_p.constructor = InitProcessStep;
return InitProcessStep;
})();


const FontbakeryTask = (function(){
const Parent = Task;
function FontbakeryTask(step, state) {
    Parent.call(this, step, state);
}

const _p = FontbakeryTask.prototype = Object.create(Parent.prototype);
_p.constructor = FontbakeryTask;


_p._createFamilyJob = function(familyDataMessage) { // -> FamilyJobMessage
   TODO(familyDataMessage);
   this.log.error('Not Implemented _createFamilyJob');
    // include to call "callbackFontBakeryFinished" with a fontbakeryResultMessage
};

_p._dispatchFamilyJob = function(ticket, familyJob) {
    TODO(ticket, familyJob);

};

_p._runFamilyJob = function(familyJob) {
    var callbackTicket = this._setExpectedAnswer('Font Bakery', 'callbackFontBakeryFinished');
    return this._dispatchFamilyJob(callbackTicket, familyJob)
    .then(reportId=>{
        this._setPrivateData('reportId', reportId);
        // This improves the information of the PENDING status by showing
        // the Font Bakery report details.
        // FIXME: This is wrong in many ways (but easy). There must be a
        // better way to define this link maybe we should set special data
        // to this log entry, that contains the reportId and the uiServer
        // or client can properly include the report then.
        let linkToFontbakeryReport = '/report/' + reportId;
        this._setPENDING('Waiting for Font Bakery [report '
                        + reportId + '](' + linkToFontbakeryReport + ')' );
        return reportId;
    });
};

_p.callbackFontBakeryFinished = function(fontbakeryResultMessage) {
    // hmm, can get the result also from the DB?
    // the reportID must be the same as the one we received in _runFamilyJob
    // otherwise, this task may have been re-activated and we're looking at
    // the wrong report and subsequently are setting the wrong state for
    // that wrong report.
    var expectedReportID = this._getPrivateData('reportId', null)
      , resultReportID = fontbakeryResultMessage.getReportId()
      ;
    if(resultReportID !== expectedReportID) {
        this._logStatus('The callback for a finished Font Bakery report '
            + 'was called for a wrong report id ("'+resultReportID+'")'
            + 'the expected reportID is: "'+expectedReportID+'".'
        );
        // don't do anything.
        return;
    }
    this._setPrivateData('fontbakeryResultMessage', fontbakeryResultMessage);
    this._logStatus(renderMD(fontbakeryResultMessage));

    TODO();  // The task is now waiting for user interaction
           // this needs to be communicated to the applicable users
           // as such:
           //       * we MAY send out emails (later)
           //       * we SHOULD provide an overview to the users for all
           //         processes that are awaiting direct human interaction.
           //         If the current watching user is authorized to perform
           //         the action, we should also mark these processes
           //         specially and also put them into a personal list:
           //               processes awaiting your attention

    return this._setExpectedAnswer('Finalize UI', 'callbackFinalize', 'uiFinalize');
};

_p.callbackFinalize = function(finalizeMessage) {
    if(!this._hasPrivateData('fontbakeryResultMessage')) {
        // The UI should not allow this callback to be made, but in
        // race condition cases like updates or such we may receive it.
        // There' will also be a way to exceptionally close a whole
        // step, e.g. if Font Bakery is not responding or something
        // else goes totally wrong.
        this._logStatus('To finalize the task orderly it is required '
            + 'that there\'s a finished Font Bakery report with which '
            + 'an informed assesment can be made by a human.');
        return;
    }
    // we should make an extra userInteraction message type for each of
    // these. This gives some certainty about the message content
    var statusName = finalizeMessage.getStatus()
      , status = string2statusCode(statusName)
      , reasoning = finalizeMessage.getReasoning(reasoning)
      ;
    if(!finishingStatuses.has(status))
        throw new Error('Status must be one of '
                + (finishingStatuses.join(', '))
                + ', but received: "' + statusName+ '" : ' + status);
    this._setStatus(status, reasoning);
};

TODO(); // user interactions describe how to display and handle
// required user interactions. These functions are used by the
// uiServer in contrast to the ProcessManager service.
// A uiServer will not be allowed to change the Process state directly
// instead, it can send messages to the ProcessManager.

// Instead of registering these explicitly, we will look for methods
// starting with "_userInteraction" that don't return false when called.
_p.uiFinalize = function() {
    // this should be managed differently!
    // if(!this._hasPrivateData('fontbakeryResultMessage'))
    //    return false;

    // in this case, show
    //      * a select field with the choices [FAIL, OK]
    //      * a text field with the label "Reasoning" (that can't be empty!?)
    return [
        {
            type: 'choice'
          , label: 'Set a final status.'
          , options: [[FAIL.toString(), FAIL.toString()], [OK.toString(), OK.toString()]]
        }
      , {
            type: 'line'
          , label: 'Describe your reasoning for the chosen status.'
        }
    ];
};

_p._activate = function() {
    return this._getSharedData('familyData').then(FamilyDataMessage=>{
        this._createFamilyJob(FamilyDataMessage)
        .then(familyJob=>this._runFamilyJob(familyJob));
    });
};

/**
// One question is if we're better of structuring a task explicitly
// so that we always know what the next step is (after finishing the
// previous one.
// That way we remove probably some sources of error, like figuring if
// a callback/userInteraction is allowed to run.
//
//
_activate // _getSharedData ... _createFamilyJob ... _runFamilyJob ... _dispatchFamilyJob
// -> waiting for callbackFontBakeryFinished
callbackFontBakeryFinished // _setPrivateData('fontbakeryResultMessage', fontbakeryResultMessage);
// -> request (dispatch) user-interaction _userInteractionFinalize
// -> waiting for callbackFinalize
callbackFinalize // this._setStatus(finishingStatus, reasoning);

*/

return FontbakeryTask;
})();


const FontBakeryStep = (function(){
const Parent = Step;
/**
 * DiffbrowsersTask could be parallel to FontbakeryTask, it's only serial
 * because I want to conserve resources. There's no need to run DiffbrowsersTask
 * when FontbakeryTask failed.
 */
function FontBakeryStep(process, state) {
    Parent.call(this, process, state, {
        // needs font files package
        Fontbakery: FontbakeryTask // queue fontbakery
                      //   => wait for the result (CleanupJobs will have to call back)
                      //   => present the result and a form to make it pass or fail
                      //   => wait for user interaction to judge result
    });
}

const _p = FontBakeryStep.prototype = Object.create(Parent.prototype);
_p.constructor = FontBakeryStep;

return FontBakeryStep;
})();

const DiffbrowsersTask = EmptyTask;

const RegressionsStep = (function(){
const Parent = Step;
function RegressionsStep(process, state) {
    Parent.call(this, process, state, {
        // needs font files package
        // produces images
        // the UI will need the images
        Diffbrowsers: DiffbrowsersTask // queue diffbrowsers tool (can this run on our workers?)
                        // OR maybe a simple diffbrowsers service that's not massively parallel
                        // when we need more we can still scale this
                        // will call back when done
                        // wait for user interaction to judge result
        });
}
const _p = RegressionsStep.prototype = Object.create(Parent.prototype);
_p.constructor = RegressionsStep;
})();


const DispatchPRTask = EmptyTask;

const DispatchStep = (function(){
const Parent = Step;
/**
 * Make a the PR or manually fail with a reasoning.
 */
function DispatchStep(process, state) {
    Parent.call(this, process, state, {
        DispatchPR: DispatchPRTask // we want this to be done by authorized engineers only
                    // will create a nice PR with good message
    });
}
const _p = DispatchStep.prototype = Object.create(Parent.prototype);
_p.constructor = DispatchStep;
return DispatchStep;
})();


const DummyFeedbackTask = (function(){

// just a placeholder to get infrastructure running before actually
// implementing this module.
const Parent = Task;
function DummyFeedbackTask(step, state) {
    Parent.call(this, step, state);
}

const _p = DummyFeedbackTask.prototype = Object.create(Parent.prototype);
_p.constructor = DummyFeedbackTask;

_p._activate = function() {
    this._setLOG('requesting a user interaction …');
    return this._setExpectedAnswer('Dummy UI'
                                      , 'callbackDummyUI'
                                      , 'uiDummyUI');
};

_p.uiDummyUI = function() {
    return [
        {   type:'choice' // => could be a select or a radio
          , label: 'Pick one:'
          , options: [['I\'m a teapot.', 'teapot'], ['I like Unicorns.', 'unicorn']]
          , default: 'unicorn' // 0 => the first item is the default
        }
      , {
            type: 'line' // input type:text
          , label: 'What is your name?'
        }
      , {
            type: 'binary' // input type checkbox
          , label: 'Let this task fail?'
          , default: false // false is the default
        }
    ];
};

_p.callbackDummyUI = function(args) {
    this.log.debug('callbackDummyUI:', ...args);
    var [choice, name, fail] = args
      , choices = {
          teapot: 'are a teapot'
        , unicorn: 'like unicorns'
        }
      , strippedName = name.trim()
      ;

    if(!strippedName)
        strippedName = '(anonymus)';

    // Pretend this didn't resolve i.e. a monkey form
    // HMM, for a monkey form, it would be nice to show the last
    // made entries by the user again. This is probably possible
    // with something like the virtual DOM of reactJS, would all happen
    // in the client though!.
    // TODO: here -> send a message to the actual client that called
    // this method. Like: call.write('Hello from the process manager.').
    // this is a direct anser to the client, either describing problems
    // or just stating that all was fine-> the client will probably have
    // a personalized log/messages window/element to render this.
    this._setLOG('Hello '+ strippedName + ' '
        + 'you ' + choices[choice] + ' '
        + 'and you ' + (fail ? 'want to see the world burn' : 'will do it again')
        + '!');
    if(!fail)
        return this._setExpectedAnswer('Dummy UI'
                                      , 'callbackDummyUI'
                                      , 'uiDummyUI');
    else
        this._setFAILED(strippedName + ' decided to FAIL this task.');
};

return DummyFeedbackTask;
})();



const TempTaskIntit = EmptyTask;

const TempStepIntit = (function(){
const Parent = Step;
/**
 * Make a the PR or manually fail with a reasoning.
 */
function TempStepIntit(process, state) {
    Parent.call(this, process, state, {
        TempIntit: TempTaskIntit
      , DummyFeedback: DummyFeedbackTask
    });
}
const _p = TempStepIntit.prototype = Object.create(Parent.prototype);
_p.constructor = TempStepIntit;
return TempStepIntit;
})();


/**
 * This is a special step. It runs immediately after the first failed
 * step and closes the process
 *
 * Create an issue somewhere on GitHub.
 */

const FailTask = EmptyTask;

const FailStep = (function(){
const Parent = Step;
/**
 * Make a the PR or manually fail with a reasoning.
 */
function FailStep(process, state) {
    Parent.call(this, process, state, {
        Fail: FailTask
    });
}
const _p = FailStep.prototype = Object.create(Parent.prototype);
_p.constructor = FailStep;
return FailStep;
})();



const stepCtors = [
            InitProcessStep
          , FontBakeryStep
          , RegressionsStep
          , DispatchStep
    ]
    // using these to make sure we have a lean development environment
    // above will have to be implemented when the system actually works
    // reduces the compexity to deal with at a time.
  , tmpStepCtors = [
        TempStepIntit
    ]
  , FailStepCtor = FailStep
  , FinallyStepCtor = TempStepIntit
  ;

Object.freeze(stepCtors);

function FamilyPRDispatcherProcess(resources, state, initArgs) {
    Parent.call(this
              , resources
              , state
              , tmpStepCtors
              , FailStepCtor
              , FinallyStepCtor
    );
    if(state)
        return;
    // else if(initArgs) … !
    this.log.debug('new FamilyPRDispatcherProcess initArgs:', initArgs, 'state:', state);
    var { familyName, requester } = initArgs;
    this._state.familyName = familyName;
    this._state.requester = requester;

}

const _p = FamilyPRDispatcherProcess.prototype = Object.create(Parent.prototype);
_p.constructor = FamilyPRDispatcherProcess;

stateManagerMixin(_p, {
    /**
     * The name of the font family for the process document in the database.
     *
     * We'll likely add other metadata here, think e.g. process initiator.
     * BUT, how do we teach ProcessManager to handle (set/evaluate etc) these?
     * It would be proper cool the have them as arguments to activate!
     *
     * Although, the familyName in this case also is important to check if
     * the process is allowed to get created at all OR if there's another
     * active process, blocking new creation (maybe not implemented
     * immediately, as we'll have authorization for this).
     *
     * We'll want to check n case of process initiator if they are
     * authorized to perform that action. (a useful first step could be
     * to ask an engineer (task ui) to authorize if the initiator is not
     * properly authorized.
     *
     * familyName will be a secondary index in the database and e.g.
     * the processManager.subscribeProcessList method will need to know
     * how to query for it.
     * This is an interesting problem! Separating the specific Process
     * implementation from the ProcessManager, still allowing ProcessManager
     * to use specific queries for the Process...
     * Could implement a specific ProcessManager, it's probably the most
     * straight forward.
     */
    familyName: {
        init: ()=>null
      , load: val=>val
      , serialize: val=>val
    }
    /**
     * For authorization purposes, maybe just the requester ID/handle,
     * (a string) so that we can get the roles of the requester
     * from the DB.
     */
  , requester: {
        init: ()=>null
      , load: val=>val
      , serialize: val=>val
    }
});

Object.defineProperties(_p, {
    familyName:{
        get: function() {
            return this._state.familyName;
        }
    }
   , requester:{
        get: function() {
            return this._state.requester;
        }
    }

});

exports.FamilyPRDispatcherProcess = FamilyPRDispatcherProcess;
