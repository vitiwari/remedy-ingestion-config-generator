function Util(app) {
    this.app = app;
    this.loadDefaultConfigs = function () {
        var defaultTemplate = $.extend(true, {}, app.defaultTemplate);
        var properties = defaultTemplate.eventDefinition.properties;
        if (app.generatedTemplate && app.generatedTemplate != null) {
            app.finalJsonTemplate = {
                "config": $.extend(true, {}, defaultTemplate.config),
                "eventDefinition": { "properties": {} },
                "fieldDefinitionMap": $.extend(true, {}, app.generatedTemplate.fieldDefinitionMap)
            };
            $.each(properties, function (k, v) {
                if (k != "app_id") {
                    var definition = defaultTemplate.fieldDefinitionMap[v];
                    var fieldId = definition["fieldId"];
                    $.each(app.generatedTemplate.fieldDefinitionMap, function (D, F) {
                        if (D != "config" && D != "eventDefinition" && F["fieldId"] == fieldId) {
                            app.finalJsonTemplate.eventDefinition.properties[k] = D;
                            return;
                        }
                    });
                }
            });
        } else {
            app.finalJsonTemplate = $.extend(true, {}, app.defaultTemplate);
        }
    };

    this.preparePluginFinalTemplate = function () {
        var finalJSon = $.extend(true, {}, app.finalJsonTemplate);
        app.finalPluginJsonTemplate.fieldDefinitionMap = {};
        app.finalPluginJsonTemplate = {
            "config": $.extend(true, {}, finalJSon.config),
            "eventDefinition": $.extend(true, {}, finalJSon.eventDefinition),
            "fieldDefinitionMap": {}
        };


        $.each(finalJSon.eventDefinition.properties, function (k, v) {
            if (k != "app_id" && v.startsWith("@")) {
                app.finalPluginJsonTemplate.fieldDefinitionMap[v] = finalJSon.fieldDefinitionMap[v];
            }
        });

        delete app.finalPluginJsonTemplate.config.remedyHostName;
        delete app.finalPluginJsonTemplate.config.remedyPort;
        delete app.finalPluginJsonTemplate.config.remedyUserName;
        delete app.finalPluginJsonTemplate.config.remedyPassword;
        delete app.finalPluginJsonTemplate.config.tsiEventEndpoint;
        delete app.finalPluginJsonTemplate.config.tsiApiToken;
        delete app.finalPluginJsonTemplate.config.startDateTime;
        delete app.finalPluginJsonTemplate.config.endDateTime;
        if (app.isAdvancedConfChecked == false) {
            delete app.finalPluginJsonTemplate.config.retryConfig;
            delete app.finalPluginJsonTemplate.config.conditionFields;
            delete app.finalPluginJsonTemplate.config.waitMsBeforeRetry;
            delete app.finalPluginJsonTemplate.config.chunkSize;
            delete app.finalPluginJsonTemplate.config.threadCount;
        }
    };
    this.prepareScriptFinalTemplate = function () {
        var finalJSon = $.extend(true, {}, app.finalJsonTemplate);
        app.finalScriptJsonTemplate = {
            "config": $.extend(true, {}, finalJSon.config),
            "eventDefinition": $.extend(true, {}, finalJSon.eventDefinition),
            "fieldDefinitionMap": {}
        };
        app.finalScriptJsonTemplate.fieldDefinitionMap = {};
        $.each(finalJSon.eventDefinition.properties, function (k, v) {
            if (k != "app_id" && v.startsWith("@")) {
                app.finalScriptJsonTemplate.fieldDefinitionMap[v] = finalJSon.fieldDefinitionMap[v];
            }
        });
        if (app.isAdvancedConfChecked == false) {
            delete app.finalScriptJsonTemplate.config.retryConfig;
            delete app.finalScriptJsonTemplate.config.tsiEventEndpoint;
            delete app.finalScriptJsonTemplate.config.conditionFields;
            delete app.finalScriptJsonTemplate.config.waitMsBeforeRetry;
            delete app.finalScriptJsonTemplate.config.chunkSize;
            delete app.finalScriptJsonTemplate.config.threadCount;
        }
    };
    this.sortByObjectkey = function (obj) {
        var keys = [];
        var sorted_obj = {};

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        // sort keys
        keys.sort();

        // create new array based on Sorted Keys
        jQuery.each(keys, function (i, key) {
            sorted_obj[key] = obj[key];
        });

        return sorted_obj;
    };
    this.sortArrayByValue = function (arr) {
        return arr.sort();
    };
    this.saveState = function () {
        if (app.isIncident == "true") {

            localStorage.setItem("REMEDY_FORM_ISINCIDENT", app.isIncident);
            localStorage.setItem("REMEDY_INCIDENT_ISADVCONFCHECKED", app.isAdvancedConfChecked == true ? "true" : "false");
            localStorage.setItem("REMEDY_INCIDENT_PRODUCT_ISPLUGIN", app.isPluginProductSelected);
            localStorage.setItem("REMEDY_INCIDENT_DEFAULT_TEMPLATE", JSON.stringify(app.defaultTemplate));
            localStorage.setItem("REMEDY_INCIDENT_GENERATED_TEMPLATE", JSON.stringify(app.generatedTemplate));
            localStorage.setItem("REMEDY_INCIDENT_FINAL_TEMPLATE", JSON.stringify(app.finalJsonTemplate));

        } else {
            localStorage.setItem("REMEDY_FORM_ISINCIDENT", app.isIncident);
            localStorage.setItem("REMEDY_CHANGE_ISADVCONFCHECKED", app.isAdvancedConfChecked);
            localStorage.setItem("REMEDY_CHANGE_PRODUCT_ISPLUGIN", app.isPluginProductSelected);
            localStorage.setItem("REMEDY_CHANGE_DEFAULT_TEMPLATE", JSON.stringify(app.defaultTemplate));
            localStorage.setItem("REMEDY_CHANGE_GENERATED_TEMPLATE", JSON.stringify(app.generatedTemplate));
            localStorage.setItem("REMEDY_CHANGE_FINAL_TEMPLATE", JSON.stringify(app.finalJsonTemplate));
        }

    };
    this.loadLastState = function () {
        var isIncident = localStorage.getItem("REMEDY_FORM_ISINCIDENT");
        var isPluginSelected;
        var defaultTemplate;
        var generatedTemplate;
        var finalJsonTemplate;
        var isAdvancedConfChecked;
        if (isIncident) {
            if (isIncident == "true") {
                isAdvancedConfChecked = localStorage.getItem("REMEDY_INCIDENT_ISADVCONFCHECKED");
                isPluginSelected = localStorage.getItem("REMEDY_INCIDENT_PRODUCT_ISPLUGIN");
                defaultTemplate = localStorage.getItem("REMEDY_INCIDENT_DEFAULT_TEMPLATE");
                generatedTemplate = localStorage.getItem("REMEDY_INCIDENT_GENERATED_TEMPLATE");
                finalJsonTemplate = localStorage.getItem("REMEDY_INCIDENT_FINAL_TEMPLATE");
            } else {
                isAdvancedConfChecked = localStorage.getItem("REMEDY_CHANGE_ISADVCONFCHECKED");
                isPluginSelected = localStorage.getItem("REMEDY_CHANGE_PRODUCT_ISPLUGIN");
                defaultTemplate = localStorage.getItem("REMEDY_CHANGE_DEFAULT_TEMPLATE");
                generatedTemplate = localStorage.getItem("REMEDY_CHANGE_GENERATED_TEMPLATE");
                finalJsonTemplate = localStorage.getItem("REMEDY_CHANGE_FINAL_TEMPLATE");
            }
        }
        app.isIncident = isIncident;
        app.isPluginProductSelected = isPluginSelected;
        app.isAdvancedConfChecked = (isAdvancedConfChecked == "true" ? true : false);
        app.defaultTemplate = defaultTemplate ? JSON.parse(defaultTemplate) : defaultTemplate;
        app.generatedTemplate = generatedTemplate ? JSON.parse(generatedTemplate) : generatedTemplate;
        app.finalJsonTemplate = finalJsonTemplate ? JSON.parse(finalJsonTemplate) : finalJsonTemplate;
    };

    this.loadStateByForm = function (formName) {
        var isPluginSelected;
        var defaultTemplate;
        var generatedTemplate;
        var finalJsonTemplate;
        var isAdvancedConfChecked;
        if (formName) {
            if (formName == "incident") {
                isAdvancedConfChecked = localStorage.getItem("REMEDY_INCIDENT_ISADVCONFCHECKED");
                isPluginSelected = localStorage.getItem("REMEDY_INCIDENT_PRODUCT_ISPLUGIN");
                defaultTemplate = localStorage.getItem("REMEDY_INCIDENT_DEFAULT_TEMPLATE");
                generatedTemplate = localStorage.getItem("REMEDY_INCIDENT_GENERATED_TEMPLATE");
                finalJsonTemplate = localStorage.getItem("REMEDY_INCIDENT_FINAL_TEMPLATE");
            }

            if (formName == "change") {
                isAdvancedConfChecked = localStorage.getItem("REMEDY_CHANGE_ISADVCONFCHECKED");
                isPluginSelected = localStorage.getItem("REMEDY_CHANGE_PRODUCT_ISPLUGIN");
                defaultTemplate = localStorage.getItem("REMEDY_CHANGE_DEFAULT_TEMPLATE");
                generatedTemplate = localStorage.getItem("REMEDY_CHANGE_GENERATED_TEMPLATE");
                finalJsonTemplate = localStorage.getItem("REMEDY_CHANGE_FINAL_TEMPLATE");
            }
        }
        app.isPluginProductSelected = isPluginSelected;
        app.isAdvancedConfChecked = (isAdvancedConfChecked == "true" ? true : false);
        app.defaultTemplate = defaultTemplate ? JSON.parse(defaultTemplate) : defaultTemplate;
        app.generatedTemplate = generatedTemplate ? JSON.parse(generatedTemplate) : generatedTemplate;
        app.finalJsonTemplate = finalJsonTemplate ? JSON.parse(finalJsonTemplate) : finalJsonTemplate;;
    };

    this.resetState = function () {
        localStorage.removeItem('REMEDY_FORM_ISINCIDENT');
        localStorage.removeItem('REMEDY_INCIDENT_ISADVCONFCHECKED');
        localStorage.removeItem('REMEDY_CHANGE_ISADVCONFCHECKED');
        localStorage.removeItem('REMEDY_INCIDENT_PRODUCT_ISPLUGIN');
        localStorage.removeItem('REMEDY_INCIDENT_DEFAULT_TEMPLATE');
        localStorage.removeItem('REMEDY_INCIDENT_GENERATED_TEMPLATE');
        localStorage.removeItem('REMEDY_INCIDENT_FINAL_TEMPLATE');
        localStorage.removeItem('REMEDY_CHANGE_PRODUCT_ISPLUGIN');
        localStorage.removeItem('REMEDY_CHANGE_DEFAULT_TEMPLATE');
        localStorage.removeItem('REMEDY_CHANGE_GENERATED_TEMPLATE');
        localStorage.removeItem('REMEDY_CHANGE_FINAL_TEMPLATE');
    };

    this.getConditionFields = function () {
        return { "3": "Submit Date", "6": "Last Modified Date" };
    };
    this.getValueMapForFieldId = function (fieldId) {
        var valMap;
        $.each(app.finalJsonTemplate.fieldDefinitionMap, function (definitionName, definition) {
            if (definition.fieldId == fieldId && definition.valueMap) {
                valMap = definition.valueMap;
            }
        });
        return valMap;
    };

}