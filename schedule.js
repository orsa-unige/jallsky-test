/**
 * @file   schedule.js
 * @author Davide Ricci (davide.ricci82@gmail.com) and Pierre Sprimont
 * @date   2017-12-31
 *
 * @brief  Schedules observations and launches the exposures.
 *
 *
 */

"use strict";

var config = require('./config.json'); /// Configuration file
var jall = require('./launch.js');     /// Handlers
//var db_obs= require('./db_obs.js');    /// DB functions

//var meteo= require('../jmeteo/meteo-data.js');    /// DB functions

(function(params){

    // /// Test.js
    //jall.launch_exposure({exptime:2,imagetyp:'light',frametyp:'crop'})

    var auto_expo=false;
    var auto_expo_done_cb=undefined;

    function do_exposure(params, ws_server, ws, cb){
	jall.launch_exposure(params, ws_server, ws)
	    .then(function(){
		console.log("schedule: launch exposure done OK!");
		// db_obs.enter(params, config.allskycam.collection, function(){
		//     cb(null, "schedule: database enter OK!");
		// });
                
//                meteo.realtime();

            })
	    .catch(function(err) {
		var error="schedule: launch exposure error =  " + err;
		console.log(error);
		cb(error);

	    });  /// jall.launch_exposure

    };

    exports.launch = function(params, ws_server, ws, cb){
	console.log("schedule: launch exposure!");
	do_exposure(params, ws_server, ws, cb);
    };

    exports.abort = function(params,cb){
	jall.cam.abort().then(function(){
	    jall.cam.close().then(cb);
	});
    };

    exports.start_auto_expo = function(params, ws_server, ws, cb){

	var nexpo=0;
	auto_expo=true;

	function exposure_done_cb(fail, ok){

	    if(fail==null){
		console.log("auto expo: Begin exposure" + nexpo);
		if(auto_expo==true)
		    do_exposure(params, ws_server, ws, exposure_done_cb);
		else{ //stop received!
		    cb(null, "auto expo: Terminated!");
		    if(auto_expo_done_cb!==undefined)
			auto_expo_done_cb("auto expo terminated!");
		}
	    }else{
		console.log("auto expo: Error in exposure, aborting! nexpo= " + nexpo + " error : " + fail);
		auto_expo=false;
		cb(fail);
	    }

	    nexpo++;
	}

	exposure_done_cb(null);
    };
    
    exports.stop_auto_expo = function(cb){
	auto_expo_done_cb=cb;
	auto_expo=false;
    };
    
    
}).call();
