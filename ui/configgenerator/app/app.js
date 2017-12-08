var validator;
var uigenerator;
var util;


$(document).ready(function () {
    $("#model_definitionname").select2({ width: '100%' });
    $('[data-toggle="popover"]').popover();
    //Check the support for the File API support
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // var defaultFile = document.getElementById('defaulttemplatefile');
        var generatedFile = document.getElementById('generatedtemplatefile');
        generatedFile.addEventListener('change', function (e) {
            var fileTobeRead = generatedFile.files[0];
            var fileGenReader = new FileReader();
            fileGenReader.onload = function (e) {
                var genTempalate = $.parseJSON(fileGenReader.result);
                app.generatedTemplate = Object.assign({}, genTempalate);
            }
            fileGenReader.readAsText(fileTobeRead);
        }, false);
    }
    else {
        alert("Files are not supported");
    }
    $('#updateModel').modal({ "show": false });
    // Step 1 Select the incident or change
    $("input[type=radio][name=isincident]").on('change', function () {
        app.isIncident = $(this).val();
        app.isAdvancedConfChecked = false;
        app.isPluginProductSelected = undefined;
        app.defaultTemplate = undefined;
        app.generatedTemplate = undefined;
        app.finalJsonTemplate = undefined;

        util.loadStateByForm(app.isIncident == "true" ? "incident" : "change");
        if (app.finalJsonTemplate) {
            app.eventBus.publish(app.EVENT.RENDER_REQUESTED, "");
            validator.validateConfig(app.finalJsonTemplate.config);
            $("#generatedtemplatefile").prop("disabled", true);
            $("#product-select .productradio").removeAttr('disabled');
            $("#loadBtn").prop("disabled", true);
        } else {
            var endPoint;
            if (app.isIncident == "true") {
                endPoint = "https://raw.githubusercontent.com/vitiwari/remedy-tsi-integration-lib/master/src/main/resources/incidentDefaultTemplate.json";
            } else {
                endPoint = "https://raw.githubusercontent.com/vitiwari/remedy-tsi-integration-lib/master/src/main/resources/changeDefaultTemplate.json"
            }
            $.getJSON(
                endPoint,
                function (data) {
                    app.defaultTemplate = data;
                    uigenerator.clearDashboard();
                    $("#generatedtemplatefile").removeAttr('disabled');
                    $("#product-select .productradio").removeAttr('disabled');
                    $("#loadBtn").removeAttr('disabled');
                });
        }
    });

    //Step 2: Load button click
    $("#loadBtn").click(function () {
        // if (!app.generatedTemplate) {
        //     alert("Did you load the generated file ? It seems the generated file is not loaded.");
        // }
        app.isPluginProductSelected = $('input[name=product]:checked').val();
        util.loadDefaultConfigs();
        app.eventBus.publish(app.EVENT.RENDER_REQUESTED, "");
        $("#generatedtemplatefile").prop("disabled", true);
        $("#loadBtn").prop("disabled", true);
        $("#product-select .productradio").removeAttr('disabled');

    });

    //Step 3: Change the Product selected
    $("input[type=radio][name=product]").on('change', function () {
        app.isPluginProductSelected = $(this).val();
        app.eventBus.publish(app.EVENT.RENDER_REQUESTED, "");
        validator.validateConfig(app.finalJsonTemplate.config);
    });

    $("#configuration-container").on("change", ".configfield", function () {
        if ($(this).is(":checkbox")) {
            var values = [];
            var name = $(this).attr('name');
            $("input:checkbox[name=" + name + "]:checked").each(function () {
                values.push(parseInt($(this).val()));
            });
            app.eventBus.publish(app.EVENT.CONFIG_UPDATED, { "name": $(this).attr('name'), "value": values });
        } else if ($(this).attr('id') == 'retryConfig' || $(this).attr('id') == 'waitMsBeforeRetry') {
            app.eventBus.publish(app.EVENT.CONFIG_UPDATED, { "id": $(this).attr('id'), "value": $(this).val() });
        } else {
            app.eventBus.publish(app.EVENT.CONFIG_UPDATED, { "id": $(this).attr('id'), "value": $(this).val() });
        }
    });
    $("#adv-configuration-container").on("change", ".configfield", function () {
        if ($(this).is(":checkbox")) {
            var values = [];
            var name = $(this).attr('name');
            $("input:checkbox[name=" + name + "]:checked").each(function () {
                values.push(parseInt($(this).val()));
            });
            app.eventBus.publish(app.EVENT.CONFIG_UPDATED, { "name": $(this).attr('name'), "value": values });
        } else if ($(this).attr('id') == 'retryConfig' || $(this).attr('id') == 'waitMsBeforeRetry') {
            app.eventBus.publish(app.EVENT.CONFIG_UPDATED, { "id": $(this).attr('id'), "value": $(this).val() });
        } else {
            app.eventBus.publish(app.EVENT.CONFIG_UPDATED, { "id": $(this).attr('id'), "value": $(this).val() });
        }
    });
    $("#adv input:checkbox").change(function () {
        var ischecked = $(this).is(':checked');
        if (!ischecked) {
            app.isAdvancedConfChecked = false;
        } else {
            app.isAdvancedConfChecked = true;
        }
        // app.eventBus.publish(app.EVENT.ADVANCED_CONFIG_UPDATED, "");
        app.eventBus.publish(app.EVENT.RENDER_REQUESTED, "");
    });

    $("#property-container").on("click", ".property", function () {
        app.currentProperty = $(this).attr('id');
        $("#updateModel").modal("show");
    });

    $('#updateModel').on('show.bs.modal', function (e) {
        if (app.currentProperty) {
            var definitionName = app.finalJsonTemplate.eventDefinition.properties[app.currentProperty];
            var definition = app.finalJsonTemplate.fieldDefinitionMap[definitionName];
            var data = {
                "propertyName": app.currentProperty,
                "definitionName": definitionName,
                "definition": definition
            };
            app.eventBus.publish(app.EVENT.MODEL_RENDER_REQUESTED, data);
        } else {
            app.eventBus.publish(app.EVENT.MODEL_RENDER_REQUESTED, undefined);
        }
    });

    $("body").on("click", "#addPropBtn", function () {
        app.currentProperty = undefined;
        $("#updateModel").modal("show");
    });

    $("#updateModel").on("click", "#save-btn", function () {
        if (app.currentProperty) {
            delete app.finalJsonTemplate.eventDefinition.properties[app.currentProperty];
        }
        if (Object.keys(app.finalJsonTemplate.eventDefinition.properties).length >= 128) {
            alert("Sorry ! maximum 128 fields are supported ");
        } else {
            var propertyName = $("#model_propertyname").val();
            var definitionName = $("#model_definitionname").val();
            var value = $("#model_value").val();
            if (propertyName && propertyName != "") {
                var activeId = $("ul#myTab li a.active").attr("id");
                if (activeId == "value-tab") {
                    app.finalJsonTemplate.eventDefinition.properties[propertyName] = value;
                    $("#model_definitionname").val('-1');
                } else {
                    app.finalJsonTemplate.eventDefinition.properties[propertyName] = definitionName;
                    $("#model_value").val("");
                }
                app.eventBus.publish(app.EVENT.RENDER_REQUESTED, "");
                $("#updateModel").modal("hide");
            } else {
                alert("Property field is blank !")
            }
        }
    });

    $("#updateModel").on("click", "#delete-btn", function () {
        if (app.currentProperty) {
            if (app.currentProperty == "app_id" || app.currentProperty == "Submit_Date" || app.currentProperty == "Last_Modified_Date") {
                alert("Cannot delete this properties, it is mandatory ! ")
            } else {
                delete app.finalJsonTemplate.eventDefinition.properties[app.currentProperty];
            }

        }
        app.eventBus.publish(app.EVENT.RENDER_REQUESTED, "");
        $("#updateModel").modal("hide");
    });

    $("#updateModel").on("change", "#model_definitionname", function () {
        var definitionName = $(this).val();
        var definition = app.finalJsonTemplate.fieldDefinitionMap[definitionName];
        var data = {
            "propertyName": app.currentProperty,
            "definitionName": definitionName,
            "definition": definition
        };
        app.eventBus.publish(app.EVENT.MODEL_RENDER_REQUESTED, data);

    });

    $("#resetBtn").click(function () {
        util.resetState();
        location.reload();
    });
});

function bootInit() {
    util = new Util(app);
    util.loadLastState();
    validator = new Validator(app);
    uigenerator = new UIGenerator(app);
    uigenerator.init(app);
    if (app.finalJsonTemplate) {
        app.eventBus.publish(app.EVENT.RENDER_REQUESTED, "");
        validator.validateConfig(app.finalJsonTemplate.config);
        $("#generatedtemplatefile").prop("disabled", true);
        $("#product-select .productradio").removeAttr('disabled');
        $("#loadBtn").prop("disabled", true);
    } else {
        //$("#generatedtemplatefile").removeAttr('disabled');
        //$("#loadBtn").removeAttr('disabled');
    }

}
bootInit();
