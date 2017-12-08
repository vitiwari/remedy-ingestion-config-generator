function UIGenerator(app) {
    this.app = app;
    this.init = function (app) {
        this.app = app;
        app.eventBus.subscribe(app.EVENT.RENDER_REQUESTED, function () {
            util.prepareScriptFinalTemplate();
            util.preparePluginFinalTemplate();
            var template;
            if (app.isIncident == "true") {
                $("input[name=isincident]").val([true]);
            } else {
                $("input[name=isincident]").val([false]);
            }
            if (app.isPluginProductSelected == "true") {
                $("input[name=product]").val([true]);
                template = $.extend(true, {}, app.finalPluginJsonTemplate);
            } else {
                $("input[name=product]").val([false]);
                template = $.extend(true, {}, app.finalScriptJsonTemplate);
            }
            if (app.isAdvancedConfChecked == true) {
                $("#isAdvancedConf").attr('checked', "checked");
            } else {
                $('#isAdvancedConf').removeAttr('checked');
            }
            $("#configuration-container").html("");
            $("#adv-configuration-container").html("");
            var config = template.config;
            if (config) {
                var htmltext = "";
                var advConfHtml = "";
                $.each(config, function (k, v) {
                    if (k == "queryStatusList") {
                        //alert(v[2])
                        // var values = v.split(",");

                        htmltext = htmltext + '<div class="row">' +
                            '<div class="col-sm-3">' +
                            '<label for="' + k + '">' + k + '</label>' +
                            '<a tabindex="3" class="badge badge-secondary" role="button" data-toggle="popover" data-trigger="focus" title=""' +
                            'data-content="Please choose the status, the incidents/change tickets would be queried with the selected status.' +
                            '">?</a>' +
                            '</div>' +
                            '<div class="col-sm-9">';
                        var valueMap = util.getValueMapForFieldId(7);
                        $.each(valueMap, function (id, name) {
                            if ($.inArray(parseInt(id), v) != -1) {
                                htmltext = htmltext + '<div class="form-check form-check-inline">' +
                                    '<label class="form-check-label">' +
                                    '<input checked class="form-check-input configfield" type="checkbox" name="' + k + '" id="statusCheckbox' + id + '" value=' + id + '> ' + name +
                                    '</label>' +
                                    '</div>';
                            } else {
                                htmltext = htmltext + '<div class="form-check form-check-inline">' +
                                    '<label class="form-check-label">' +
                                    '<input class="form-check-input configfield" type="checkbox" name="' + k + '" id="statusCheckbox' + id + '" value=' + id + '> ' + name +
                                    '</label>' +
                                    '</div>';
                            }

                        });

                        htmltext = htmltext + '<div class="form-control-feedback"></div>' +
                            '</div>' +
                            '</div>';
                    } else if (k == "conditionFields") {
                        advConfHtml = advConfHtml + '<div class="row">' +
                            '<div class="col-sm-3">' +
                            '<label for="' + k + '">' + k + '</label>' +
                            '<a tabindex="4" class="badge badge-secondary" role="button" data-toggle="popover" data-trigger="focus" title=""' +
                            'data-content="This would create a date range query based on the values of these fields.' +
                            'Ex. if you select submit date, Incidents would be selected if the submit date value lies in the startDate and endDate configured range (In case of plugin it is poll interval)' +
                            '">?</a>' +
                            '</div>' +
                            '<div class="col-sm-9">';
                        $.each(util.getConditionFields(), function (id, name) {
                            if ($.inArray(parseInt(id), v) != -1) {
                                advConfHtml = advConfHtml + '<div class="form-check form-check-inline">' +
                                    '<label class="form-check-label">' +
                                    '<input checked class="form-check-input configfield" type="checkbox" name="' + k + '" id="statusCheckbox' + id + '" value=' + id + '> ' + name +
                                    '</label>' +
                                    '</div>';
                            } else {
                                advConfHtml = advConfHtml + '<div class="form-check form-check-inline">' +
                                    '<label class="form-check-label">' +
                                    '<input class="form-check-input configfield" type="checkbox" name="' + k + '" id="statusCheckbox' + id + '" value=' + id + '> ' + name +
                                    '</label>' +
                                    '</div>';
                            }
                        });
                        advConfHtml = advConfHtml + '<div class="form-control-feedback"></div>' +
                            '</div>' +
                            '</div>';
                    } else if (k == "tsiEventEndpoint" || k == "retryConfig" || k == "waitMsBeforeRetry" || k == "chunkSize" || k == "threadCount") {
                        advConfHtml = advConfHtml + '<div class="row">' +
                            '<div class="col-sm-3">' +
                            '<label for="' + k + '">' + k + '</label>' +
                            '</div>' +
                            '<div class="col-sm-9">' +
                            '<input type="text" class="form-control configfield" id="' + k + '" value="' + v + '">' +
                            '<div class="form-control-feedback"></div>' +
                            '</div>' +
                            '</div>';
                    } else {
                        htmltext = htmltext + '<div class="row">' +
                            '<div class="col-sm-3">' +
                            '<label for="' + k + '">' + k + '</label>' +
                            '</div>' +
                            '<div class="col-sm-9">' +
                            '<input type="text" class="form-control configfield" id="' + k + '" value="' + v + '">' +
                            '<div class="form-control-feedback"></div>' +
                            '</div>' +
                            '</div>';
                    }
                });
                $("#configuration-container").html(htmltext);
                $("#adv-configuration-container").html(advConfHtml);
                $('[data-toggle="popover"]').popover();
            }
            var properties = template.eventDefinition.properties;
            if (properties) {
                $("#property-container").html("");
                var htmltext1 = '<table class="table table-responsive">' +
                    '<thead>' +
                    '<tr>' +
                    '<th scope="col">Property Name</th>' +
                    '<th scope="col">Value/Definition Name</th>' +
                    '<th scope="col">Field ID</th>' +
                    '<th scope="col">Field Type</th>' +
                    '</tr>' +
                    '</thead><tbody>';

                var orderedPropertiesList = util.sortByObjectkey(properties);
                $.each(orderedPropertiesList, function (k, v) {
                    var definition = template.fieldDefinitionMap[v];
                    if (v.startsWith("@") && definition) {

                        htmltext1 = htmltext1 + '<tr id="' + k + '">' +
                            '<td>' +
                            '<a class="nav-link property" href="#"  id="' + k + '"> ' + k + ' </a>' +
                            '</td>' +
                            '<td class="definition">' + v + '</td>' +
                            '<td class="fieldid">' + definition["fieldId"] + '</td>' +
                            '<td class="field-type">' + definition["fieldType"] + '</td>' +
                            '</tr>';

                    } else {


                        htmltext1 = htmltext1 + '<tr id="' + k + '">' +
                            '<td>' +
                            '<a class="nav-link property" href="#"  id="' + k + '"> ' + k + ' </a>' +
                            '</td>' +
                            '<td class="definition">' + v + '</td>' +
                            '<td class="fieldid"></td>' +
                            '<td class="field-type"> </td>' +
                            '</tr>';

                    }

                });
                htmltext1 = htmltext1 + '</tbody></table>';
                $("#property-container").append(htmltext1);
            }
            $("#final-template").html('<pre>' + JSON.stringify(template, null, 4) + "</pre>");
            util.saveState();
        });
        app.eventBus.subscribe(app.EVENT.CONFIG_UPDATED, function (data) {
            if (data.name == "queryStatusList" || data.name == "conditionFields") {
                app.finalJsonTemplate.config[data.name] = data.value;
            } else {
                app.finalJsonTemplate.config[data.id] = data.value;
            }
            util.prepareScriptFinalTemplate();
            util.preparePluginFinalTemplate();
            if (app.isPluginProductSelected == "true") {
                $("#final-template").html('<pre>' + JSON.stringify(app.finalPluginJsonTemplate, null, 4) + '</pre>');
            } else {
                $("#final-template").html('<pre>' + JSON.stringify(app.finalScriptJsonTemplate, null, 4) + '</pre>');
            }
            validator.validateConfig(app.finalJsonTemplate.config);
            util.saveState();
        });

        app.eventBus.subscribe(app.EVENT.MODEL_RENDER_REQUESTED, function (data) {
            var currentProperty;
            var definitionSelected;
            var definition;
            if (data) {
                currentProperty = data.propertyName;
                definitionSelected = data.definitionName;
                definition = data.definition;
            }

            var definitionList = [];
            $("#model_propertyname").val(currentProperty ? currentProperty : "");
            var listitems = '<option value="-1">Select a Remedy definition</option>';
            var fieldDefinitionMap = app.finalJsonTemplate.fieldDefinitionMap;
            var properties = app.finalJsonTemplate.eventDefinition.properties;
            $.each(fieldDefinitionMap, function (key, value) {
                var isPresent = false;
                $.each(properties, function (P, D) {
                    if (D == key) {
                        isPresent = true;
                        return;
                    }
                });
                if (!isPresent) {
                    definitionList.push(key);
                    var fieldType = value.fieldType;
                }
            });
            if (definitionSelected && definitionSelected.startsWith("@")) {
                definitionList.push(definitionSelected);
            }
            var orderedDefinitionList = util.sortArrayByValue(definitionList);
            var listitems = '<option value=' + -1 + '>Select Definition Name </option>';
            orderedDefinitionList.forEach(function (item) {
                if (definitionSelected && item == definitionSelected) {
                    listitems = listitems + '<option selected value=' + item + '>' + item + '</option>';
                } else {
                    listitems = listitems + '<option value=' + item + '>' + item + '</option>';
                }

            });

            $("#model_definitionname").html("");
            $("#model_definitionname").append(listitems);



            if (definition) {
                $("#definition-tab").tab('show');
                $("#model_value").val("");
                $("#model_fieldtype").val(definition.fieldType);
                $("#model_fielddatatype").val(definition.fieldInstance);
                $("#model_fieldid").val(definition.fieldId);
                $("#value-map").html("");
                var liHtml = "";
                $.each(definition.valueMap, function (key, value) {
                    liHtml = liHtml + '<li class="list-group-item">' + key + ':' + value + '</li>'
                });
                $("#value-map").append(liHtml);
            } else {
                $("#model_value").val(definitionSelected ? definitionSelected : "");
                $("#model_definitionname").val('-1');
                $("#value-tab").tab('show');
                $("#model_fieldtype").val("");
                $("#model_fielddatatype").val("");
                $("#model_fieldid").val("");
                $("#value-map").html("");
            }

        });

    };
    this.markError = function (id, msg, name) {
        var that = $("#" + id);
        if (that.hasClass("form-control-success")) {
            that.removeClass("form-control-success")
            that.parent().parent().removeClass("has-success");
        }
        if (!that.hasClass("form-control-danger")) {
            that.addClass("form-control-danger");
            $("#" + id).parent().parent().addClass("has-danger");
        }
        $("#" + id).parent().find(".form-control-feedback").html(msg);

    };
    this.markSuccess = function (id, msg) {

        var that = $("#" + id);
        if (that.hasClass("form-control-danger")) {
            that.removeClass("form-control-danger")
            that.parent().parent().removeClass("has-danger");
        }
        if (!that.hasClass("form-control-success")) {
            that.addClass("form-control-success");
            $("#" + id).parent().parent().addClass("has-success");
        }
        $("#" + id).parent().find(".form-control-feedback").html(msg);
    };
    this.markCheckError = function (name, msg) {
        var that = $("input:checkbox[name=" + name + "]");
        if (that.hasClass("form-control-success")) {
            that.removeClass("form-control-success")
            that.parent().parent().removeClass("has-success");
        }
        if (!that.hasClass("form-control-danger")) {
            that.addClass("form-control-danger");
            that.parent().parent().addClass("has-danger");
        }
        that.parent().parent().parent().find(".form-control-feedback").html(msg);

    };
    this.markCheckSuccess = function (name, msg) {

        var that = $("input:checkbox[name=" + name + "]");
        if (that.hasClass("form-control-danger")) {
            that.removeClass("form-control-danger")
            that.parent().parent().removeClass("has-danger");
        }
        if (!that.hasClass("form-control-success")) {
            that.addClass("form-control-success");
            that.parent().parent().addClass("has-success");
        }
        that.parent().parent().parent().find(".form-control-feedback").html(msg);
    };
    this.clearDashboard = function () {
        $("#generatedtemplatefile").val("")
        $("#configuration-container").html("");
        $("#adv-configuration-container").html("");
        $("#property-container").html("");
        $("#final-template").html("");
        $('#isAdvancedConf').removeAttr('checked');
    };
}
