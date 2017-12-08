function Validator(app) {
    this.app = app;
    this.validateConfig = function (config) {

        var result = true;
        //Validate Remedy Host
        if (!config.remedyHostName || 0 === config.remedyHostName.trim().length) {

            uigenerator.markError("remedyHostName", "Please enter the AR Server Hostname ");
            result = false;
        } else {

            uigenerator.markSuccess("remedyHostName", "");
        }

        // Validate Remedy port
        if (!$.isNumeric(config.remedyPort)) {
            var port = parseInt(config.remedyPort);
            if (!$.isNumeric(config.remedyPort)) {
                uigenerator.markError("remedyPort", "Please enter a valid port number");
                result = false;
            } else {
                uigenerator.markSuccess("remedyPort", "");
            }
        } else {
            uigenerator.markSuccess("remedyPort", "");
        }

        //Validate Remedy UserName
        if (!config.remedyUserName || config.remedyUserName == "" || 0 === config.remedyUserName.trim().length) {
            uigenerator.markError("remedyUserName", "Please enter the User name ");
            result = false;
        } else {
            uigenerator.markSuccess("remedyUserName", "");
        }

        //Validate Remedy Password
        if (!config.remedyPassword || config.remedyPassword == "" || 0 === config.remedyPassword.trim().length) {
            uigenerator.markError("remedyPassword", "Please enter the password ");
            result = false;
        } else {
            uigenerator.markSuccess("remedyPassword", "");
        }

        //validate tsiEventEndPoint
        if (config.tsiEventEndpoint == "https://api.truesight.bmc.com/v1/events" ||
            config.tsiEventEndpoint == "https://api.truesight-staging.bmc.com/v1/events") {
            uigenerator.markSuccess("tsiEventEndpoint", "");
        } else {
            uigenerator.markError("tsiEventEndpoint", "The endpoint is not correct");
            result = false;

        }

        //validate tsiEventEndPoint
        if (!config.tsiApiToken || config.tsiApiToken == "" || 0 === config.tsiApiToken.length) {
            uigenerator.markError("tsiApiToken", "Please enter proper API token");
            result = false;
        } else {
            uigenerator.markSuccess("tsiApiToken", "");
        }

        //validate conditionFields
        var values = config.conditionFields;
        if (!values || 0 === values.length) {
            uigenerator.markCheckError("conditionFields", "Condition Fields are required, please choose one or more");
            result = false;
        } else {
            uigenerator.markCheckSuccess("conditionFields", "");
        }


        //validate queryStatusList
        if (!config.queryStatusList || 0 === config.queryStatusList.length) {
            uigenerator.markCheckError("queryStatusList", "List of status to query is required, please choose one or more");
            result = false;
        } else {
            uigenerator.markCheckSuccess("queryStatusList", "");
        }



        //validate retryConfig
        if (!$.isNumeric(config.retryConfig)) {
            uigenerator.markError("retryConfig", "please enter a number");
            result = false;
        } else {
            var times = parseInt(config.retryConfig);
            if (times > 5 || times < 0) {
                uigenerator.markError("retryConfig", "Please configure no of retry between 0 and 5");
                result = false;
            }
            uigenerator.markSuccess("retryConfig", "");
        }

        //validate waitMsBeforeRetry
        if (!$.isNumeric(config.waitMsBeforeRetry)) {
            uigenerator.markError("waitMsBeforeRetry", "Please enter a valid millisecond value");
            result = false;
        } else {
            uigenerator.markSuccess("waitMsBeforeRetry", "");
        }


        return result;
    };

    this.validateProperty = function () {
        //return ' apple';
        // alert(JSON.stringify(app));
        // this.app.eventBus.publish("myEvent",{"name":"Ram"});
    };


}